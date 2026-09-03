#!/usr/bin/env node
// Formats and lints a Diia service's protos with the shared rule set.
//   diia-buf-lint         format check + lint
//   diia-buf-lint --fix   format write + lint
// The rules live once in this package's buf.yaml; we merge them with the service's own
// buf.yaml (its modules) at runtime and pass the result as `buf lint --config`, so buf
// resolves the service's local imports without every service copying the rule list.
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const fix = process.argv.includes('--fix')
const here = dirname(fileURLToPath(import.meta.url))
const rules = readFileSync(join(here, 'buf.yaml'), 'utf8').replace(/^[\s\S]*?(?=^lint:)/m, '') // lint: + breaking:
const service = readFileSync('buf.yaml', 'utf8').replace(/\s*$/, '\n') // service modules/deps

const buf = (args) => spawnSync('buf', args, { stdio: 'inherit' }).status ?? 1
const format = buf(['format', './proto', ...(fix ? ['--write'] : ['--diff', '--exit-code'])])
const lint = buf(['lint', '--config', service + rules])
process.exit(format || lint)
