export const releaseRules = [
    { type: 'refactor', release: 'patch' },
    { type: 'chore', release: 'patch' },
]

export const releaseNotesGeneratorPlugin = [
    '@semantic-release/release-notes-generator',
    {
        preset: 'conventionalcommits',
        presetConfig: {
            types: [
                { type: 'feat', section: 'Features' },
                { type: 'fix', section: 'Bug Fixes' },
                { type: 'docs', hidden: true },
                { type: 'style', hidden: true },
                { type: 'refactor', section: 'Refactor' },
                { type: 'perf', section: 'Performance Improvements' },
                { type: 'test', hidden: true },
            ],
            issuePrefixes: ['BACK-'],
            issueUrlFormat: 'https://diia.atlassian.net/browse/{{prefix}}{{id}}',
        },
    },
]

export const gitPlugin = [
    '@semantic-release/git',
    {
        assets: ['package.json', 'package-lock.json'],
        message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
    },
]
