import { Describe, array, object, optional, record, string } from 'superstruct'

import { MatcherResult } from '../../interfaces'
import { assert } from '../../utils'

import { PublicServiceContextMenu } from './interfaces'

export const ContextMenuSchema: Describe<PublicServiceContextMenu[]> = array(
    object({
        type: string(),
        name: string(),
        code: optional(string()),
        appVersions: optional(
            object({
                versions: optional(record(string(), array(string()))),
                minVersion: optional(record(string(), string())),
            }),
        ),
    }),
)

export function toBeContextMenu(contextMenu: PublicServiceContextMenu[]): MatcherResult {
    const message = `PublicServiceContextMenu[] matcher`

    return assert(message, contextMenu, ContextMenuSchema)
}
