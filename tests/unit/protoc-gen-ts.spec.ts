import { describe, expect, it } from 'vitest'

import { DIIA_TS_PROTO_FLAGS } from '../../protoc-gen-ts/diia-flags.js'
import { buildIndexBarrel } from '../../protoc-gen-ts/postprocess.js'

describe('DIIA_TS_PROTO_FLAGS', () => {
    it('bakes in the fleet ts-proto flag set', () => {
        for (const flag of [
            'esModuleInterop=true',
            'importSuffix=.js',
            'stringEnums=true',
            'enumsAsLiterals=true',
            'useSnakeTypeName=false',
            'unrecognizedEnum=false',
            'outputServices=nice-grpc',
        ]) {
            expect(DIIA_TS_PROTO_FLAGS).toContain(flag)
        }
    })
})

const diiaFile = (name: string, message: string): { name: string; content: string } => ({
    name,
    content: [
        'export const protobufPackage = "ua.gov.diia.publicservice";',
        `export interface ${message} {}`,
        'export type DeepPartial<T> = { [K in keyof T]?: T[K] };',
        'export interface MessageFns {}',
    ].join('\n'),
})

describe('buildIndexBarrel', () => {
    it('re-exports a repeated name from one module only', () => {
        const barrel = buildIndexBarrel([diiaFile('debts.ts', 'GetDebtsRequest'), diiaFile('payment.ts', 'GetPaymentRequest')])

        expect(barrel.match(/\bprotobufPackage\b/g)).toHaveLength(1)
        expect(barrel.match(/\bDeepPartial\b/g)).toHaveLength(1)
        expect(barrel.match(/\bMessageFns\b/g)).toHaveLength(1)
        expect(barrel).toContain("export { protobufPackage } from './debts.js';")
        expect(barrel).toContain("export type { GetDebtsRequest, DeepPartial, MessageFns } from './debts.js';")
        expect(barrel).toContain("export type { GetPaymentRequest } from './payment.js';")
    })
})
