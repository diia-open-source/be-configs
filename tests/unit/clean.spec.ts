import { type SpawnSyncReturns, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const cli = resolve('clean/clean.mjs')

describe('diia-clean', () => {
    let cwd: string

    beforeEach(() => {
        cwd = mkdtempSync(join(tmpdir(), 'diia-clean-'))
    })

    afterEach(() => {
        rmSync(cwd, { recursive: true, force: true })
    })

    const run = (...paths: string[]): SpawnSyncReturns<string> => spawnSync(process.execPath, [cli, ...paths], { cwd, encoding: 'utf8' })

    it('deletes every path it is given, nested content included, and skips the missing ones', () => {
        // Arrange
        mkdirSync(join(cwd, 'dist/nested'), { recursive: true })
        writeFileSync(join(cwd, 'dist/nested/index.js'), '')
        writeFileSync(join(cwd, 'report.xml'), '')

        // Act
        const result = run('dist/', 'report.xml', 'coverage')

        // Assert
        expect(result.status).toBe(0)
        expect(existsSync(join(cwd, 'dist'))).toBe(false)
        expect(existsSync(join(cwd, 'report.xml'))).toBe(false)
    })

    it.each(['.', '..', '/', ''])('refuses %j, which is not inside the working directory, and deletes nothing', (outside) => {
        // Arrange
        mkdirSync(join(cwd, 'dist'))

        // Act
        const result = run('dist', outside)

        // Assert
        expect(result.status).toBe(2)
        expect(result.stderr).toContain(`diia-clean: refusing to delete "${outside}"`)
        expect(existsSync(join(cwd, 'dist'))).toBe(true)
    })

    it('fails instead of picking a default when it is given no path', () => {
        // Arrange
        mkdirSync(join(cwd, 'dist'))

        // Act
        const result = run()

        // Assert
        expect(result.status).toBe(2)
        expect(result.stderr).toContain('diia-clean: pass the paths to delete')
        expect(existsSync(join(cwd, 'dist'))).toBe(true)
    })
})
