#!/usr/bin/env node
// Detects breaking proto changes: compares the working-tree proto API against a git
// baseline (default: origin/main). Builds a self-contained image for each side and diffs
// them, so vendored include modules (design-system/types) don't add noise.
//   diia-buf-breaking            # against origin/main (falls back to main)
//   diia-buf-breaking <gitref>   # against an explicit ref/branch/tag/commit
import { readFileSync, mkdtempSync, mkdirSync, symlinkSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
const rules = readFileSync(join(here, 'buf.yaml'), 'utf8').replace(/^[\s\S]*?(?=^lint:)/m, '') // lint: + breaking:
const config = readFileSync('buf.yaml', 'utf8').replace(/\s*$/, '\n') + rules

const has = (ref) => spawnSync('git', ['rev-parse', '--verify', '--quiet', ref], { stdio: 'ignore' }).status === 0
const ref = process.argv[2] || (has('origin/main') ? 'origin/main' : 'main')
if (!has(ref)) {
    console.error(`diia-buf-breaking: git ref "${ref}" not found`)
    process.exit(2)
}

const buf = (args) => spawnSync('buf', args, { stdio: 'inherit' }).status ?? 1
const tmp = mkdtempSync(join(tmpdir(), 'diia-breaking-'))
try {
    // current side — working-tree proto
    const current = join(tmp, 'current.binpb')
    if (buf(['build', '--config', config, '-o', current])) process.exit(1)

    // baseline side — the ref's proto/ with the current node_modules (for import resolution)
    const ws = join(tmp, 'ws')
    mkdirSync(ws)
    if (spawnSync('sh', ['-c', `git archive ${ref} proto | tar -x -C ${ws}`], { stdio: 'inherit' }).status) {
        console.error(`diia-buf-breaking: could not export proto/ from "${ref}"`)
        process.exit(1)
    }
    symlinkSync(resolve('node_modules'), join(ws, 'node_modules'))
    copyFileSync('buf.yaml', join(ws, 'buf.yaml'))
    if (existsSync('buf.lock')) copyFileSync('buf.lock', join(ws, 'buf.lock')) // pins googleapis
    const baseline = join(tmp, 'baseline.binpb')
    if (buf(['build', '--config', config, '-o', baseline, ws])) process.exit(1)

    process.exit(buf(['breaking', current, '--config', config, '--against', baseline]))
} finally {
    rmSync(tmp, { recursive: true, force: true })
}
