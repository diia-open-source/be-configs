export interface PublicServiceContextMenu {
    type: string
    name: string
    code?: string
    appVersions?: {
        versions?: Record<string, string[]>
        minVersion?: Record<string, string>
    }
}
