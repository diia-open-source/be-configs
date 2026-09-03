/**
 * Post-processing applied to every file ts-proto emits, before we hand the
 * response back to buf.
 *
 *   1. Strip reserved-word type aliases inside `export namespace` blocks.
 *      ts-proto sometimes emits `export type delete = typeof Icon.delete;`
 *      which TypeScript rejects. Faithful port of
 *      genproto/src/command/tsCommandBuilder.ts:185-246.
 *
 *   2. Synthesize an `index.ts` barrel that re-exports everything ts-proto
 *      generated. Faithful port of genproto/src/utils/index.ts:36-130.
 */

const RESERVED_WORDS = new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'null',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'let',
    'static',
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
])

export function stripReservedWordTypeAliases(content: string): string {
    if (!content.includes('export namespace ')) return content

    const lines = content.split('\n')
    const output: string[] = []
    let insideNamespace = false
    let namespaceStartIndex = -1
    let hasNonReservedMember = false

    for (const line of lines) {
        if (line.startsWith('export namespace ')) {
            insideNamespace = true
            namespaceStartIndex = output.length
            hasNonReservedMember = false
            output.push(line)
            continue
        }

        if (insideNamespace && line === '}') {
            insideNamespace = false

            if (hasNonReservedMember) {
                output.push(line)
            } else {
                output.splice(namespaceStartIndex)
            }
            continue
        }

        if (insideNamespace) {
            const match = line.match(/^\s*export type (\w+) = typeof /)

            if (match && RESERVED_WORDS.has(match[1])) {
                continue
            }

            hasNonReservedMember = true
        }

        output.push(line)
    }

    return output.join('\n')
}

interface ExportedNames {
    valueNames: string[]
    typeNames: string[]
}

function extractExportedNames(content: string): ExportedNames {
    const valueSet = new Set<string>()
    const typeSet = new Set<string>()

    // Same regex as genproto's utils/index.ts: matches `export const/let/var/function/enum/class Name`
    // and `export interface/type Name`. Type-only names that also exist as values are demoted to value.
    const exportRegex = /^export\s+(?:(?:const|let|var|function|enum|class)\s+(\w+)|(?:interface|type)\s+(\w+))/gm

    for (const match of content.matchAll(exportRegex)) {
        if (match[1]) {
            valueSet.add(match[1])
        } else if (match[2]) {
            typeSet.add(match[2])
        }
    }

    const pureTypeNames = [...typeSet].filter((n) => !valueSet.has(n))

    return { valueNames: [...valueSet], typeNames: pureTypeNames }
}

function isDiiaPackage(content: string): boolean {
    const match = content.match(/protobufPackage\s*=\s*"([^"]+)"/)
    return match?.[1]?.startsWith('ua.gov.diia') ?? false
}

interface EmittedFile {
    name: string
    content: string
}

/**
 * Replicate genproto v4's index.ts barrel format:
 *   - external files (google.*): `export * as <ns> from './path.js';`
 *     where <ns> is the path with '/' → '_', leading non-distinct path
 *     segments stripped.
 *   - local files (ua.gov.diia.*): explicit value + type re-exports.
 */
export function buildIndexBarrel(files: EmittedFile[]): string {
    const externalLines: string[] = []
    const localValueExports: string[] = []
    const localTypeExports: string[] = []

    // Sort by filename so output is deterministic across runs and matches
    // genproto v4's alphabetical-by-namespace ordering.
    const sorted = [...files].toSorted((a, b) => a.name.localeCompare(b.name))

    const claimed = new Set<string>()
    const takeUnclaimed = (names: string[]): string[] => {
        const fresh = names.filter((name) => !claimed.has(name))

        for (const name of fresh) {
            claimed.add(name)
        }

        return fresh
    }

    for (const file of sorted) {
        if (!file.name.endsWith('.ts') || file.name === 'index.ts') continue

        const moduleRef = file.name.replace(/\.ts$/, '.js')

        if (isDiiaPackage(file.content)) {
            const { valueNames, typeNames } = extractExportedNames(file.content)
            const values = takeUnclaimed(valueNames)
            const types = takeUnclaimed(typeNames)
            if (values.length > 0) {
                localValueExports.push(`export { ${values.join(', ')} } from './${moduleRef}';`)
            }
            if (types.length > 0) {
                localTypeExports.push(`export type { ${types.join(', ')} } from './${moduleRef}';`)
            }
        } else {
            const nsPath = file.name.replace(/\.ts$/, '').split('/')
            // For protos under google/ (google/api/foo, google/protobuf/foo) we
            // namespace by the last two segments — `api_foo`, `protobuf_foo` —
            // matching genproto's output.
            const ns = nsPath.slice(-2).join('_')
            externalLines.push(`export * as ${ns} from './${moduleRef}';`)
        }
    }

    const sections = [externalLines.join('\n\n'), localValueExports.join('\n'), localTypeExports.join('\n')]
        .filter((s) => s.length > 0)
        .join('\n\n')

    return sections + '\n'
}
