/**
 * Auto-discover `-M file.proto=@npm-package` mappings.
 *
 * Scans the consumer's `node_modules/@diia-inhouse/**\/proto/**\/*.proto`
 * tree. Any proto whose `package` line is `ua.gov.diia*` is treated as
 * an external import — the plugin will tell ts-proto NOT to emit a local
 * copy of its message types but to `import` them from the npm package
 * the proto file ships in.
 *
 * This is the only piece of dynamic configuration in the plugin. Every
 * other ts-proto flag is identical across the fleet (see ./diia-flags.ts).
 */
import { readFileSync } from 'node:fs'

import { glob } from 'glob'

export async function discoverImportMappings(): Promise<string[]> {
    const candidates = await glob('node_modules/@diia-inhouse/**/proto/**/*.proto', {
        ignore: 'node_modules/**/node_modules/**',
    })

    const seen = new Set<string>()
    const mappings: string[] = []

    for (const file of candidates) {
        const parts = file.split('/')
        const nmIdx = parts.indexOf('node_modules')
        if (nmIdx === -1) continue

        // pkgName is the next two segments after node_modules — for scoped
        // packages this is "@diia-inhouse/<name>".
        const pkgName = `${parts[nmIdx + 1]}/${parts[nmIdx + 2]}`

        // Skip files that aren't really shared protos — only those with a
        // `package ua.gov.diia*` declaration count.
        let contents: string
        try {
            contents = readFileSync(file, 'utf8')
        } catch {
            continue
        }
        if (!contents.includes('package ua.gov.diia')) continue

        // The relative path used inside the .proto file. Strip everything up
        // through the package's `dist/proto/` or `proto/` directory so we
        // match how the consuming proto names it in `import "..."`.
        const tail = parts
            .slice(nmIdx + 1)
            .filter((segment) => !['dist', 'proto', '@diia-inhouse', parts[nmIdx + 2]].includes(segment) || segment.endsWith('.proto'))
        const protoImportPath = tail.join('/')

        const mapping = `M${protoImportPath}=${pkgName}`
        if (seen.has(mapping)) continue
        seen.add(mapping)
        mappings.push(mapping)
    }

    return mappings
}
