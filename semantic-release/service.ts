import { gitPlugin, releaseRules } from './common'

export = {
    branches: ['master', { name: 'dev', channel: 'rc', prerelease: 'rc' }],
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
            '@saithodev/semantic-release-backmerge',
            {
                backmergeBranches: [{ from: 'master', to: 'dev' }],
                clearWorkspace: true,
                backmergeStrategy: 'merge',
            },
        ],
        [
            'semantic-release-slack-bot',
            {
                notifyOnSuccess: true,
                notifyOnFail: true,
                markdownReleaseNotes: true,
                branchesConfig: [{ pattern: 'dev', notifyOnSuccess: false, notifyOnFail: false }],
            },
        ],
    ],
}
