import { gitPlugin, releaseRules } from './common'

export = {
    branches: ['semantic-dummy-release', { name: 'main', channel: 'rc', prerelease: 'rc' }],
    plugins: [
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
    ],
}
