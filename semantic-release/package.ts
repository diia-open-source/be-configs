import { releaseRules } from './common'

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
    '@semantic-release/npm',
    [
        '@semantic-release/git',
        {
            assets: ['package.json'],
            message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
    ],
]
