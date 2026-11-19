#!/usr/bin/env node
// Deletes build output the same way on every OS, so package scripts need neither rimraf nor `rm -rf`.
//   diia-clean dist [more paths]
// Each path must sit inside the working directory; a path that does not exist is skipped.
import { rmSync } from 'node:fs'
import { resolve, sep } from 'node:path'

const paths = process.argv.slice(2)
if (!paths.length) {
    console.error('diia-clean: pass the paths to delete, e.g. `diia-clean dist`')
    process.exit(2)
}

const root = process.cwd() + sep
const outside = paths.filter((path) => !resolve(path).startsWith(root))
for (const path of outside) console.error(`diia-clean: refusing to delete "${path}", which is not inside ${process.cwd()}`)
if (outside.length) process.exit(2)

for (const path of paths) rmSync(path, { recursive: true, force: true, maxRetries: 3 })
