import type { ExpectationResult } from '@vitest/expect'
import { Describe, object, string } from 'superstruct'

import { AttentionMessageParameter } from '../interfaces'
import { assert } from '../utils'

export const AttentionMessageParameterSchema: Describe<AttentionMessageParameter> = object({
    type: string(),
    data: object({
        name: string(),
        alt: string(),
        resource: string(),
    }),
})

export function toBeAttentionMessageParameter(received: AttentionMessageParameter): ExpectationResult {
    const message = `AttentionMessageParameter matcher`

    return assert(message, received, AttentionMessageParameterSchema)
}
