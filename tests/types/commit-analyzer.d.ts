declare module '@semantic-release/commit-analyzer' {
    export function analyzeCommits(
        pluginConfig: object,
        context: {
            cwd: string
            commits: { message: string; hash: string }[]
            logger: { log: (...args: unknown[]) => void }
        },
    ): Promise<string | null>
}
