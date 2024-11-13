import type { ExpectationResult } from '@vitest/expect'
import { literal, object, string } from 'superstruct'

import { assert } from '../../utils'

import { ValueWithLabel } from './interfaces'

export function toBeValueWithLabel(received: ValueWithLabel, value?: string): ExpectationResult {
    const message = `ValueWithLabel matcher`

    return assert(
        message,
        received,
        object({
            label: string(),
            value: value ? literal(value) : string(),
        }),
    )
}
