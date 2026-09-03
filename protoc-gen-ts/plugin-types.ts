/**
 * Minimal subset of google/protobuf/compiler/plugin.proto.
 *
 * We treat the nested-descriptor fields (`proto_file`, `source_file_descriptors`,
 * `generated_code_info`) as opaque `bytes`. protobufjs round-trips unknown
 * fields losslessly, so when we re-serialize the request, ts-proto sees the
 * original FileDescriptorProto wire bytes byte-for-byte. We only touch:
 *   - `CodeGeneratorRequest.parameter` (inject Diia flags)
 *   - `CodeGeneratorResponse.file[].content` (post-process per file)
 *   - `CodeGeneratorResponse.file[]` (append our synthesized index.ts)
 */
import protobuf from 'protobufjs'

const PLUGIN_PROTO = `
syntax = "proto2";

package google.protobuf.compiler;

message Version {
  optional int32 major = 1;
  optional int32 minor = 2;
  optional int32 patch = 3;
  optional string suffix = 4;
}

message CodeGeneratorRequest {
  repeated string file_to_generate = 1;
  optional string parameter = 2;
  repeated bytes proto_file = 15;
  repeated bytes source_file_descriptors = 17;
  optional Version compiler_version = 3;
}

message CodeGeneratorResponse {
  optional string error = 1;
  optional uint64 supported_features = 2;
  optional int32 minimum_edition = 3;
  optional int32 maximum_edition = 4;

  message File {
    optional string name = 1;
    optional string insertion_point = 2;
    optional string content = 15;
    optional bytes generated_code_info = 16;
  }

  repeated File file = 15;
}
`

const root = protobuf.parse(PLUGIN_PROTO, { keepCase: true }).root

export const CodeGeneratorRequest = root.lookupType('google.protobuf.compiler.CodeGeneratorRequest')
export const CodeGeneratorResponse = root.lookupType('google.protobuf.compiler.CodeGeneratorResponse')

export interface RequestMessage {
    file_to_generate?: string[]
    parameter?: string
    proto_file?: Uint8Array[]
    source_file_descriptors?: Uint8Array[]
    compiler_version?: unknown
}

export interface ResponseFile {
    name?: string
    insertion_point?: string
    content?: string
    generated_code_info?: Uint8Array
}

export interface ResponseMessage {
    error?: string
    supported_features?: bigint | number
    file?: ResponseFile[]
}
