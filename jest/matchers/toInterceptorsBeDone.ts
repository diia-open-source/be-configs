import { Scope } from 'nock'

import { MatcherResult } from '../interfaces'

export function toInterceptorsBeDone(scope: Scope): MatcherResult {
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
