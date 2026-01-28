import { describe, expect, it } from 'vitest'

import { releaseNotesGeneratorPlugin, releaseRules } from '../../semantic-release/common'
import { plugins as packagePlugins } from '../../semantic-release/package'
import { plugins as packageMrCiPlugins } from '../../semantic-release/package-mr-ci'
import serviceConfig from '../../semantic-release/service'
import serviceProdConfig from '../../semantic-release/service-prod'
import serviceStageConfig from '../../semantic-release/service-stage'

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

        it('should include essential plugins in all configurations', () => {
            const configs = [serviceProdConfig, serviceConfig, serviceStageConfig]

            for (const config of configs) {
                const pluginNames = config.plugins.map((plugin: unknown) => (Array.isArray(plugin) ? plugin[0] : plugin)) as string[]

                expect(pluginNames).toContain('@semantic-release/commit-analyzer')
                expect(pluginNames).toContain('@semantic-release/gitlab')
                expect(pluginNames).toContain('@semantic-release/npm')
            }
        })
    })

    describe('package configurations', () => {
        it('should include essential plugins', () => {
            const configs = [packagePlugins, packageMrCiPlugins]

            for (const plugins of configs) {
                const pluginNames = plugins.map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin))

                expect(pluginNames).toContain('@semantic-release/commit-analyzer')
                expect(pluginNames).toContain('@semantic-release/gitlab')
                expect(pluginNames).toContain('@semantic-release/npm')
            }
        })
    })
})
