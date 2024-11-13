import { gitPlugin, releaseRules } from './common'

export = {
    branches: ['main'],
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
        [
            'semantic-release-slack-bot',
            {
                notifyOnSuccess: true,
                notifyOnFail: true,
                markdownReleaseNotes: true,
                branchesConfig: [{ pattern: 'main', notifyOnSuccess: false, notifyOnFail: false }],
            },
        ],
    ],
}
