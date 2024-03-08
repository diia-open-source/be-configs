import { Describe, object, string } from 'superstruct'

import { AttentionMessageParameter, MatcherResult } from '../interfaces'
import { assert } from '../utils'

export const AttentionMessageParameterSchema: Describe<AttentionMessageParameter> = object({
    type: string(),
    data: object({
        name: string(),
        alt: string(),
        resource: string(),
    }),
})

export function toBeAttentionMessageParameter(received: AttentionMessageParameter): MatcherResult {
    const message = `AttentionMessageParameter matcher`

    return assert(message, received, AttentionMessageParameterSchema)
}
