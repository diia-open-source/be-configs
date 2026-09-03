/**
 * The Diia ts-proto flag set, lifted verbatim from genproto v4's
 * `tsCommandBuilder.ts:141-156`. Centralizing them here is the entire point
 * of this package: change a flag once, every Diia service picks it up via
 * `npm i @diia-inhouse/protoc-gen-ts@latest`.
 *
 * `outputServices=nice-grpc,outputServices=generic-definitions` is always
 * applied — the old `--generateClient=false` mode is retired. Production
 * builds will include the small service-interface block; tree-shakers drop
 * it where unreferenced, and the dist size impact is negligible.
 */
export const DIIA_TS_PROTO_FLAGS = [
    'esModuleInterop=true',
    'importSuffix=.js',
    'stringEnums=true',
    'enumsAsLiterals=true',
    'useDate=true',
    'useExactTypes=false',
    'exportCommonSymbols=true',
    'env=node',
    'useMongoObjectId=true',
    'snakeToCamel=false',
    'unrecognizedEnum=false',
    'useSnakeTypeName=false',
    'outputServices=nice-grpc',
    'outputServices=generic-definitions',
]
