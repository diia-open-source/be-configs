/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace jest {
    interface Matchers<R> {
        toInterceptorsBeDone(): R

        toBeAttentionMessage(): R

        toBeTextWithParameters(): R

        toBeContextMenu(): R

        toContainObjects<T>(argument: Partial<T>[]): R

        toBeValueWithLabel(value?: string): R

        toBeNavigationPanel(): R

        toBeMainButton(action?: string): R
    }

    interface Expect {
        toBeAttentionMessage(): any

        toBeTextWithParameters(): any

        toBeContextMenu(): any

        toBeValueWithLabel(value?: string): any

        toBeNavigationPanel(): any

        toBeMainButton(action?: string): any
    }
}
