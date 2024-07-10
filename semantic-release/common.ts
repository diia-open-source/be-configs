export const releaseRules = [
    { type: 'refactor', release: 'patch' },
    { type: 'chore', release: 'patch' },
]

export const gitPlugin = [
    '@semantic-release/git',
    {
        assets: ['package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    },
]
