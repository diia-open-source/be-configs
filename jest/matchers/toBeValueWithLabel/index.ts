import { literal, object, string } from 'superstruct'

import { MatcherResult } from '../../interfaces'
import { assert } from '../../utils'

import { ValueWithLabel } from './interfaces'

export function toBeValueWithLabel(received: ValueWithLabel, value?: string): MatcherResult {
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
