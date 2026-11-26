import { gitPlugin, releaseNotesGeneratorPlugin, releaseRules } from './common.js'

export const branches = ['main', { name: '*', prerelease: true }]

export const plugins = [
    [
        '@semantic-release/commit-analyzer',
        {
            preset: 'angular',
            releaseRules: [...releaseRules, { type: 'chore', scope: 'deps', release: false }],
        },
    ],
    releaseNotesGeneratorPlugin,
    '@semantic-release/gitlab',
    ['@semantic-release/npm', { npmPublish: false }],
    gitPlugin,
]
