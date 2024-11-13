import type { ExpectationResult } from '@vitest/expect'
import { Scope } from 'nock'

export function toInterceptorsBeDone(scope: Scope): ExpectationResult {
    const message = 'expected nock interceptors to be done'

    if (scope?.isDone()) {
        return {
            message: () => message,
            pass: true,
        }
    }

    return {
        message: () => `${message}. Pending interceptors:\n${scope?.pendingMocks().join('\n')}`,
        pass: false,
    }
}
