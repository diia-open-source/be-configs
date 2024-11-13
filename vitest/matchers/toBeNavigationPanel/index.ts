import type { ExpectationResult } from '@vitest/expect'
import { Describe, object, optional, string } from 'superstruct'

import { assert } from '../../utils'
import { ContextMenuSchema } from '../toBeContextMenu'

import { NavigationPanel } from './interfaces'

const NavigationPanelSchema: Describe<NavigationPanel> = object({
    header: optional(string()),
    contextMenu: optional(ContextMenuSchema),
})

export function toBeNavigationPanel(navigationPanel: NavigationPanel): ExpectationResult {
    const message = `NavigationPanel matcher`

    return assert(message, navigationPanel, NavigationPanelSchema)
}
