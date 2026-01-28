import { gitPlugin, releaseNotesGeneratorPlugin, releaseRules } from './common'

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
        releaseNotesGeneratorPlugin,
        '@semantic-release/gitlab',
        ['@semantic-release/npm', { npmPublish: false }],
        gitPlugin,
        [
            'semantic-release-slack-bot',
            {
                notifyOnSuccess: true,
                notifyOnFail: false,
                markdownReleaseNotes: true,
                branchesConfig: [{ pattern: 'main', notifyOnSuccess: true, notifyOnFail: false }],
            },
        ],
    ],
}
