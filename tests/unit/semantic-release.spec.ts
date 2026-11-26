import { analyzeCommits } from '@semantic-release/commit-analyzer'
import { describe, expect, it } from 'vitest'

import { releaseNotesGeneratorPlugin, releaseRules } from '../../semantic-release/common'
import { plugins as packagePlugins } from '../../semantic-release/package'
import { plugins as packageMrCiPlugins } from '../../semantic-release/package-mr-ci'
import serviceConfig from '../../semantic-release/service'
import serviceProdConfig from '../../semantic-release/service-prod'
import serviceStageConfig from '../../semantic-release/service-stage'

const pluginName = (plugin: unknown): unknown => (Array.isArray(plugin) ? plugin[0] : plugin)

const commitAnalyzerConfig = (plugins: unknown[]): object => {
    for (const plugin of plugins) {
        if (Array.isArray(plugin) && plugin[0] === '@semantic-release/commit-analyzer') {
            return plugin[1]
        }
    }

    throw new Error('@semantic-release/commit-analyzer is not configured')
}

const releaseType = async (plugins: unknown[], messages: string[]): Promise<string | null> =>
    await analyzeCommits(commitAnalyzerConfig(plugins), {
        cwd: process.cwd(),
        commits: messages.map((message, index) => ({ message, hash: `${index}` })),
        logger: { log: () => {} },
    })

describe('semantic-release configurations', () => {
    describe('common', () => {
        it('should define correct release rules', () => {
            expect(releaseRules).toEqual([
                { type: 'refactor', release: 'patch' },
                { type: 'chore', release: 'patch' },
            ])
        })

        it('should configure release notes generator correctly', () => {
            expect(releaseNotesGeneratorPlugin[0]).toBe('@semantic-release/release-notes-generator')
            const config = releaseNotesGeneratorPlugin[1] as {
                preset: string
                presetConfig: {
                    issuePrefixes: string[]
                }
            }

            expect(config.preset).toBe('conventionalcommits')
            expect(config.presetConfig.issuePrefixes).toEqual(['BACK-'])
        })
    })

    describe('service configurations', () => {
        it('should define correct branches for each environment', () => {
            expect(serviceProdConfig.branches).toEqual(['main'])
            expect(serviceConfig.branches).toEqual(['master', { name: 'dev', channel: 'rc', prerelease: 'rc' }])
            expect(serviceStageConfig.branches).toEqual(['semantic-dummy-release', { name: 'main', channel: 'rc', prerelease: 'rc' }])
        })

        it('should keep releasing a service for a dev-dependency update', async () => {
            // Arrange
            const plugins = serviceStageConfig.plugins

            // Act
            const release = await releaseType(plugins, ['chore(deps): update diia-inhouse'])

            // Assert
            expect(release).toBe('patch')
        })

        it('should include essential plugins in all configurations', () => {
            const configs = [serviceProdConfig, serviceConfig, serviceStageConfig]

            for (const config of configs) {
                const pluginNames = config.plugins.map(pluginName) as string[]

                expect(pluginNames).toContain('@semantic-release/commit-analyzer')
                expect(pluginNames).toContain('@semantic-release/gitlab')
                expect(pluginNames).toContain('@semantic-release/npm')
            }
        })
    })

    describe('package configurations', () => {
        it.each([
            { messages: ['chore(deps): update diia-inhouse'], expected: null },
            { messages: ['fix(deps): update diia-inhouse'], expected: 'patch' },
            { messages: ['chore: replace rimraf with diia-clean'], expected: 'patch' },
            { messages: ['chore(deps): update diia-inhouse', 'feat(BACK-1): add a provider'], expected: 'minor' },
        ])('should release $expected for $messages', async ({ messages, expected }) => {
            // Arrange
            const plugins = packagePlugins

            // Act
            const release = await releaseType(plugins, messages)

            // Assert
            expect(release).toBe(expected)
        })

        it('should include essential plugins', () => {
            const configs = [packagePlugins, packageMrCiPlugins]

            for (const plugins of configs) {
                const pluginNames = plugins.map(pluginName)

                expect(pluginNames).toContain('@semantic-release/commit-analyzer')
                expect(pluginNames).toContain('@semantic-release/gitlab')
                expect(pluginNames).toContain('@semantic-release/npm')
            }
        })
    })
})
