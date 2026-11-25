import { describe, expect, it } from 'vitest'

import { javaReservedWords } from '../../buf/java-reserved-words.mjs'

const statusEnum = (values: string[]): { name: string; value: { name: string; number: number }[] } => ({
    name: 'GrantStatus',
    value: values.map((name, number) => ({ name, number })),
})

describe('diia-buf-lint Java reserved word check', () => {
    it('reports an enum value that is a Java keyword at the line buf recorded for it', () => {
        // Arrange
        const files = [
            {
                name: 'grant-service.proto',
                package: 'ua.gov.diia.grant',
                syntax: 'proto3',
                enumType: [statusEnum(['applicationSubmitted', 'new'])],
                sourceCodeInfo: { location: [{ path: [5, 0, 2, 1], span: [116, 2, 10] }] },
            },
        ]

        // Act
        const problems = javaReservedWords(files)

        // Assert
        expect(problems).toEqual([
            'proto/grant-service.proto:117:3:Enum value "new" is a Java keyword; the generated enum does not compile. Rename it, or keep a stored or sent name with buf:lint:ignore JAVA_RESERVED_WORD. (JAVA_RESERVED_WORD)',
        ])
    })

    it('keeps a name marked with buf:lint:ignore JAVA_RESERVED_WORD above it', () => {
        // Arrange
        const files = [
            {
                name: 'grant-service.proto',
                package: 'ua.gov.diia.grant',
                syntax: 'proto3',
                enumType: [statusEnum(['applicationSubmitted', 'new'])],
                sourceCodeInfo: {
                    location: [{ path: [5, 0, 2, 1], span: [116, 2, 10], leadingComments: ' buf:lint:ignore JAVA_RESERVED_WORD\n' }],
                },
            },
        ]

        // Act
        const problems = javaReservedWords(files)

        // Assert
        expect(problems).toEqual([])
    })

    it('reports a keyword value of an enum nested in a message', () => {
        // Arrange
        const files = [{ name: 'a.proto', package: 'p', messageType: [{ name: 'Wrapper', enumType: [statusEnum(['none', 'default'])] }] }]

        // Act
        const problems = javaReservedWords(files)

        // Assert
        expect(problems).toHaveLength(1)
        expect(problems[0]).toContain('Enum value "default" is a Java keyword')
    })

    it.each([
        ['proto3', 1],
        ['proto2', 0],
    ])('reports an UNRECOGNIZED value in a %s enum %i times', (syntax, count) => {
        // Arrange
        const files = [{ name: 'a.proto', package: 'p', syntax, enumType: [statusEnum(['none', 'UNRECOGNIZED'])] }]

        // Act
        const problems = javaReservedWords(files)

        // Assert
        expect(problems).toHaveLength(count)
    })

    it('reports a restricted identifier as a message name, and leaves contextual and upper-case enum values alone', () => {
        // Arrange
        const files = [
            {
                name: 'a.proto',
                package: 'p',
                syntax: 'proto3',
                messageType: [{ name: 'record' }],
                enumType: [statusEnum(['none', 'var', 'DEFAULT', 'newApplication'])],
            },
        ]

        // Act
        const problems = javaReservedWords(files)

        // Assert
        expect(problems).toEqual(['proto/a.proto:1:1:Message name "record" is not a legal Java class name. (JAVA_RESERVED_WORD)'])
    })

    it.each([
        ['the proto package, with no java_package', 'ua.gov.diia.public', undefined, 1],
        ['java_package', 'ua.gov.diia.publicservice', 'ua.gov.diia.public', 1],
        ['neither, once java_package replaces it', 'ua.gov.diia.public', 'ua.gov.diia.publicservice', 0],
    ])('checks the Java package segments of %s', (_case, protoPackage, javaPackage, count) => {
        // Arrange
        const files = [{ name: 'a.proto', package: protoPackage, options: javaPackage ? { javaPackage } : undefined }]

        // Act
        const problems = javaReservedWords(files)

        // Assert
        expect(problems).toHaveLength(count)
    })
})
