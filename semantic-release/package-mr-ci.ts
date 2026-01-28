import { releaseNotesGeneratorPlugin, releaseRules } from './common'

export const branches = ['main', { name: '*', prerelease: true }]

export const plugins = [
    [
        '@semantic-release/commit-analyzer',
        {
            preset: 'angular',
            releaseRules,
        },
    ],
    releaseNotesGeneratorPlugin,
    '@semantic-release/gitlab',
    ['@semantic-release/npm', { npmPublish: false }],
    '@semantic-release/git',
]
