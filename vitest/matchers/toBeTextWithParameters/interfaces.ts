import { AttentionMessageParameter } from '../../interfaces'

export interface TextWithParameters {
    text: string
    parameters?: AttentionMessageParameter[]
}
