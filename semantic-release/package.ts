import { gitPlugin, releaseRules } from './common'

export const branches = ['main']

export const plugins = [
    [
        '@semantic-release/commit-analyzer',
        {
            preset: 'angular',
            releaseRules,
        },
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/gitlab',
    ['@semantic-release/npm', { npmPublish: false }],
    gitPlugin,
]
