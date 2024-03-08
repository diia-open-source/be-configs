import { Describe, array, object, optional, string } from 'superstruct'

import { MatcherResult } from '../../interfaces'
import { assert } from '../../utils'
import { AttentionMessageParameterSchema } from '../toBeAttentionMessageParameter'

import { TextWithParameters } from './interfaces'

const textWithParametersSchema: Describe<TextWithParameters> = object({
    text: string(),
    parameters: optional(array(AttentionMessageParameterSchema)),
})

export function toBeTextWithParameters(received: TextWithParameters): MatcherResult {
    const message = `TextWithParameters matcher`

    return assert(message, received, textWithParametersSchema)
}
