#!/usr/bin/env node
// Formats and lints a Diia service's protos with the shared rule set.
//   diia-buf-lint         format check + lint
//   diia-buf-lint --fix   format write + lint
// The rules live once in this package's buf.yaml; we merge them with the service's own
// buf.yaml (its modules) at runtime and pass the result as `buf lint --config`, so buf
// resolves the service's local imports without every service copying the rule list.
// buf has no rules for the Java a service's proto jar compiles into, so two are added here and
// fail before the jar is published: JAVA_CLASS_UNIQUE (java-classes.mjs), two files writing one
// Java class, and JAVA_RESERVED_WORD (java-reserved-words.mjs), a name javac rejects.
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { javaClassClashes } from './java-classes.mjs'
import { javaReservedWords } from './java-reserved-words.mjs'

const fix = process.argv.includes('--fix')
const here = dirname(fileURLToPath(import.meta.url))
const rules = readFileSync(join(here, 'buf.yaml'), 'utf8').replace(/^[\s\S]*?(?=^lint:)/m, '') // lint: + breaking:
const service = readFileSync('buf.yaml', 'utf8').replace(/\s*$/, '\n') // service modules/deps

const buf = (args) => spawnSync('buf', args, { stdio: 'inherit' }).status ?? 1
const format = buf(['format', './proto', ...(fix ? ['--write'] : ['--diff', '--exit-code'])])
const lint = buf(['lint', '--config', service + rules])
const java = checkJava()
process.exit(format || lint || java)

// A build failure is a compile error `buf lint` has already printed, so its output is shown
// only when lint passed. Source info gives the reserved-word rule its lines and ignore comments.
function checkJava() {
    const build = spawnSync('buf', ['build', 'proto', '--exclude-imports', '-o', '-#format=json'], {
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
    })
    if (build.status !== 0) {
        if (lint === 0) {
            process.stderr.write(build.stderr)
        }

        return build.status ?? 1
    }

    const files = JSON.parse(build.stdout).file ?? []
    const problems = [...javaClassClashes(files), ...javaReservedWords(files)]
    for (const problem of problems) {
        console.error(problem)
    }

    return problems.length > 0 ? 1 : 0
}
