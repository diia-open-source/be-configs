import type { ExpectationResult } from '@vitest/expect'
import { Describe, array, object, optional, string } from 'superstruct'

import { assert } from '../../utils'
import { AttentionMessageParameterSchema } from '../toBeAttentionMessageParameter'

import { AttentionMessage } from './interfaces'

const AttentionMessageSchema: Describe<AttentionMessage> = object({
    icon: string(),
    title: optional(string()),
    text: optional(string()),
    parameters: optional(array(AttentionMessageParameterSchema)),
})

export function toBeAttentionMessage(received: AttentionMessage): ExpectationResult {
    const title = 'AttentionMessage matcher'

    return assert(title, received, AttentionMessageSchema)
}
