import type { ExpectationResult, MatcherState } from '@vitest/expect'
import { expect } from 'vitest'

export function toContainObjects(this: MatcherState, received: unknown, argument: unknown[]): ExpectationResult {
    const pass = this.equals(received, expect.arrayContaining(argument.map((item) => expect.objectContaining(item))))
    if (pass) {
        return {
            message: () => `expected ${this.utils.printReceived(received)} not to contain objects ${this.utils.printExpected(argument)}`,
            pass: true,
        }
    }

    return {
        message: () => `expected ${this.utils.printReceived(received)} to contain objects ${this.utils.printExpected(argument)}`,
        pass: false,
    }
}
