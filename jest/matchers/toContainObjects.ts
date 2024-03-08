import { MatcherResult } from '../interfaces'

export function toContainObjects(this: jest.MatcherContext, received: unknown, argument: unknown[]): MatcherResult {
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
