export interface MatcherResult {
    pass: boolean
    message: () => string
}

export interface AttentionMessageParameter {
    type: string
    data: {
        name: string
        alt: string
        resource: string
    }
}
