import { expect } from 'vitest'

import * as matchers from './matchers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomMatchers<R = any> {
    toInterceptorsBeDone(): R

    toBeAttentionMessage(): R

    toBeTextWithParameters(): R

    toBeContextMenu(): R

    toContainObjects<T>(argument: Partial<T>[]): R

    toBeValueWithLabel(value?: string): R

    toBeNavigationPanel(): R

    toBeMainButton(action?: string): R
}

expect.extend(matchers)
