export type UpgradeKind = 'unlock' | 'speed' | 'permanent'

export const upgradeKindLabels: Record<UpgradeKind, string> = {
    unlock: 'Unlocks',
    speed: 'Speed',
    permanent: 'Permanent'
}
