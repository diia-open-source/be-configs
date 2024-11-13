import type { ExpectationResult } from '@vitest/expect'
import { Struct, StructError, assert as superstructAssert } from 'superstruct'

function getPrettyMessage(data: unknown): string {
    return JSON.stringify(data, null, 2)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(matcherMessage: string, data: unknown, schema: Struct<any>): ExpectationResult {
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
