import { AttentionMessageParameter } from '../../interfaces'

export interface AttentionMessage {
    icon: string
    title?: string
    text?: string
    parameters?: AttentionMessageParameter[]
}
