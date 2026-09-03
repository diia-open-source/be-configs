#!/usr/bin/env node
/**
 * protoc-gen-diia-ts — Buf-native ts-proto wrapper plugin.
 *
 * Invoked by buf via `local: protoc-gen-diia-ts` in buf.gen.yaml.
 *
 * Lifecycle:
 *   1. Read CodeGeneratorRequest from stdin.
 *   2. Inject the centralized Diia ts-proto flag set and the auto-discovered
 *      -M import mappings into the request's `parameter` field.
 *   3. Spawn the real `protoc-gen-ts_proto` plugin and forward the augmented
 *      request to it.
 *   4. Read its CodeGeneratorResponse, strip reserved-word type aliases inside
 *      `export namespace` blocks, and append a synthesized `index.ts` barrel.
 *   5. Write the modified response to stdout.
 *
 * Every Diia service that imports this plugin gets identical generator
 * behaviour by virtue of pinning the same version — no per-service flag
 * lists, no per-service post-processing scripts.
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { DIIA_TS_PROTO_FLAGS } from './diia-flags.js'
import { discoverImportMappings } from './discover-mappings.js'
import { buildIndexBarrel, stripReservedWordTypeAliases } from './postprocess.js'
import {
    CodeGeneratorRequest,
    CodeGeneratorResponse,
    type RequestMessage,
    type ResponseFile,
    type ResponseMessage,
} from './plugin-types.js'

async function readStdin(): Promise<Uint8Array> {
    const chunks: Buffer[] = []
    for await (const chunk of process.stdin) {
        chunks.push(chunk as Buffer)
    }
    return Buffer.concat(chunks)
}

function locateTsProto(): string {
    return createRequire(import.meta.url).resolve('ts-proto/protoc-gen-ts_proto')
}

async function main(): Promise<void> {
    const inputBytes = await readStdin()
    const request = CodeGeneratorRequest.decode(inputBytes).toJSON() as RequestMessage

    // Merge our flag set with anything buf.gen.yaml already passed.
    const importMappings = await discoverImportMappings()
    const incoming = (request.parameter ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

    request.parameter = [...incoming, ...DIIA_TS_PROTO_FLAGS, ...importMappings].join(',')

    const augmentedBytes = CodeGeneratorRequest.encode(CodeGeneratorRequest.fromObject(request)).finish()

    // Forward to the real ts-proto plugin. process.execPath is the Node binary
    // we are running under, so it picks up the consumer's local Node — important
    // for engines: >=24 services.
    const tsProtoBin = locateTsProto()
    const result = spawnSync(process.execPath, [tsProtoBin], {
        input: Buffer.from(augmentedBytes),
        stdio: ['pipe', 'pipe', 'inherit'],
        maxBuffer: 100 * 1024 * 1024,
    })

    if (result.status !== 0) {
        process.exit(result.status ?? 1)
    }

    const responseBytes = result.stdout
    const response = CodeGeneratorResponse.decode(responseBytes).toJSON() as ResponseMessage

    // Strip reserved-word type aliases inside `export namespace` blocks.
    const files: ResponseFile[] = response.file ?? []
    for (const file of files) {
        if (file.content) {
            file.content = stripReservedWordTypeAliases(file.content)
        }
    }

    // Append index.ts barrel matching genproto v4's format.
    const indexContent = buildIndexBarrel(
        files
            .filter((f): f is ResponseFile & { name: string; content: string } => Boolean(f.name && f.content))
            .map((f) => ({ name: f.name, content: f.content })),
    )

    if (indexContent.trim().length > 0) {
        files.push({ name: 'index.ts', content: indexContent })
    }

    response.file = files

    const outputBytes = CodeGeneratorResponse.encode(CodeGeneratorResponse.fromObject(response)).finish()

    process.stdout.write(Buffer.from(outputBytes))
}

main().catch((err) => {
    process.stderr.write(`protoc-gen-diia-ts: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`)
    process.exit(2)
})
