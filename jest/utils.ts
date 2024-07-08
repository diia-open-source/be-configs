import { Struct, StructError, assert as superstructAssert } from 'superstruct'
import { JestConfigWithTsJest } from 'ts-jest'
import parser from 'yargs-parser'

import { MatcherResult } from './interfaces'

export function setCoverageConfig(): JestConfigWithTsJest {
    const { selectProjects, coverage } = parser(process.argv, { array: ['selectProjects'] })
    if (!coverage) {
        return {}
    }

    let coverageDirectory = './coverage/all'
    let projectName
    if (selectProjects?.length === 1) {
        projectName = selectProjects[0]
        coverageDirectory = `./coverage/${projectName}`
    }

    const reporters: JestConfigWithTsJest['reporters'] = [
        'default',
        ['jest-junit', { outputName: `/${coverageDirectory}/junit.xml`, addFileAttribute: 'true' }],
    ]

    return {
        reporters,
        coverageDirectory,
        coverageProvider: 'v8',
        collectCoverageFrom: [
            'src/**',
            'dist/**',
            '!**/*.d.ts',
            '!src/interfaces/**',
            '!dist/interfaces/**',
            '!dist/generated/**',
            '!dist/index.js',
            '!dist/deps.js',
            '!dist/config.js',
            '!dist/bootstrap.js',
            '!src/generated/**',
            '!src/index.ts',
            '!src/deps.ts',
            '!src/config.ts',
            '!src/bootstrap.ts',
        ],
        coverageReporters: ['lcov', 'text', 'cobertura'],
    }
}

function getPrettyMessage(data: unknown): string {
    return JSON.stringify(data, null, 2)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(matcherMessage: string, data: unknown, schema: Struct<any>): MatcherResult {
    try {
        superstructAssert(data, schema)

        return {
            pass: true,
            message: () => `${matcherMessage} is satisfied`,
        }
    } catch (e) {
        if (e instanceof StructError) {
            const errors = []

            for (const failure of e.failures()) {
                const { message, value, type, path, branch } = failure

                const errorItem = {
                    message,
                    value,
                    expectedType: type,
                    path,
                    branch,
                }

                errors.push(errorItem)
            }

            const errorMessage = {
                matcherMessage,
                receivedData: data,
                errors,
            }

            return {
                pass: false,
                message: () => getPrettyMessage(errorMessage),
            }
        }

        return {
            pass: false,
            message: () => `${matcherMessage}: Unexpected error caused. ${getPrettyMessage(e)}`,
        }
    }
}
