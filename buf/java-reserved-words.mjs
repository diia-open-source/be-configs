// Finds proto names that protoc's Java generator copies verbatim into Java source that javac rejects.
//
// protoc escapes field and oneof names, but takes enum values, message and enum names and package
// segments as they are. Diia's lower-camel enum values (`stringEnums` makes the proto name the
// string a service stores and sends) make `new`, `default` or `public` easy to write: TypeScript
// accepts them, and the Java class generated from the service's proto jar does not compile.
// Every proto3 enum also gets an UNRECOGNIZED constant in Java, so a value of that name collides.
//
// A name that is already part of a stored or sent contract is kept with buf's own comment above it:
//   // buf:lint:ignore JAVA_RESERVED_WORD
// diia-buf-lint passes the descriptors from `buf build proto --exclude-imports` (protojson, with
// source info for line numbers and those comments) and prints what this returns.

const RULE = 'JAVA_RESERVED_WORD'

// JLS §3.9 keywords and §3.10 literals: illegal as any identifier.
const KEYWORDS = new Set(
    `abstract assert boolean break byte case catch char class const continue default do double else enum extends final
    finally float for goto if implements import instanceof int interface long native new package private protected public
    return short static strictfp super switch synchronized this throw throws transient try void volatile while true false
    null _`.split(/\s+/),
)
// JLS §3.9 restricted identifiers: legal as an enum constant, illegal as a class name.
const RESTRICTED_TYPE_NAMES = new Set(['var', 'yield', 'record', 'sealed', 'permits'])

// FileDescriptorProto and friends, by field number, for source info paths.
const FILE_PACKAGE = 2
const FILE_MESSAGE = 4
const FILE_ENUM = 5
const FILE_OPTIONS = 8
const OPTIONS_JAVA_PACKAGE = 1
const MESSAGE_NESTED = 3
const MESSAGE_ENUM = 4
const ENUM_VALUE = 2

function sourceIndex(file) {
    const index = new Map()
    for (const location of file.sourceCodeInfo?.location ?? []) {
        index.set((location.path ?? []).join(','), location)
    }

    return index
}

/**
 * @param files FileDescriptorProto objects in protojson form, paths relative to the proto module
 * @param moduleDir the module directory the paths are reported under
 * @returns one buf-lint-style line per name the generated Java would not compile with
 */
export function javaReservedWords(files, moduleDir = 'proto') {
    const problems = []
    for (const file of files) {
        const locations = sourceIndex(file)
        const report = (path, message) => {
            const location = locations.get(path.join(','))
            const comments = `${location?.leadingComments ?? ''}${location?.trailingComments ?? ''}`
            if (comments.includes(`buf:lint:ignore ${RULE}`)) {
                return
            }

            const [line, column] = location?.span ?? [0, 0]
            problems.push(`${moduleDir}/${file.name}:${line + 1}:${column + 1}:${message} (${RULE})`)
        }

        const javaPackage = file.options?.javaPackage
        for (const segment of (javaPackage || file.package || '').split('.')) {
            if (KEYWORDS.has(segment)) {
                const path = javaPackage ? [FILE_OPTIONS, OPTIONS_JAVA_PACKAGE] : [FILE_PACKAGE]
                report(path, `Java package segment "${segment}" is a Java keyword; the generated classes do not compile.`)
            }
        }

        const proto3 = file.syntax === 'proto3'
        const checkEnum = (enumType, path) => {
            if (KEYWORDS.has(enumType.name) || RESTRICTED_TYPE_NAMES.has(enumType.name)) {
                report(path, `Enum name "${enumType.name}" is not a legal Java class name.`)
            }
            for (const [i, value] of (enumType.value ?? []).entries()) {
                if (KEYWORDS.has(value.name)) {
                    report(
                        [...path, ENUM_VALUE, i],
                        `Enum value "${value.name}" is a Java keyword; the generated enum does not compile. Rename it, or keep a stored or sent name with buf:lint:ignore ${RULE}.`,
                    )
                } else if (proto3 && value.name === 'UNRECOGNIZED') {
                    report(
                        [...path, ENUM_VALUE, i],
                        'Enum value "UNRECOGNIZED" collides with the constant protoc adds to every proto3 enum in Java.',
                    )
                }
            }
        }
        const checkMessage = (message, path) => {
            if (KEYWORDS.has(message.name) || RESTRICTED_TYPE_NAMES.has(message.name)) {
                report(path, `Message name "${message.name}" is not a legal Java class name.`)
            }
            for (const [i, nested] of (message.nestedType ?? []).entries()) {
                checkMessage(nested, [...path, MESSAGE_NESTED, i])
            }
            for (const [i, enumType] of (message.enumType ?? []).entries()) {
                checkEnum(enumType, [...path, MESSAGE_ENUM, i])
            }
        }

        for (const [i, message] of (file.messageType ?? []).entries()) {
            checkMessage(message, [FILE_MESSAGE, i])
        }
        for (const [i, enumType] of (file.enumType ?? []).entries()) {
            checkEnum(enumType, [FILE_ENUM, i])
        }
    }

    return problems
}
