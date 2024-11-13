import type { ExpectationResult } from '@vitest/expect'
import { array, literal, object, optional, string } from 'superstruct'

import { assert } from '../../utils'

import { MainButton } from './interfaces'

export function toBeMainButton(received: MainButton, action?: string): ExpectationResult {
    const message = `MainButton matcher`

    return assert(
        message,
        received,
        object({
            name: string(),
            action: action ? literal(action) : optional(string()),
            checkboxes: optional(array(string())),
        }),
    )
}
