import { type UnlockUpgradeCategory, type UnlockUpgradeModel } from './unlockUpgrade'

export interface PermanentUpgradeModel extends UnlockUpgradeModel {
    permanentCost: number
}

const permanentUpgradeCosts: Record<UnlockUpgradeCategory, number> = {
    basicSolvers: 1,
    singleDrafts: 2,
    solverQueue: 3,
    draftCleanup: 4,
    advancedSingles: 5,
    solverAutomation: 6,
    draftSetup: 6,
    automaticHelpers: 8,
    startingDrafts: 12
}

export const getPermanentUpgradeCost = (upgrade: UnlockUpgradeModel): number =>
    permanentUpgradeCosts[upgrade.category]

export const createPermanentUpgradeModel = (upgrade: UnlockUpgradeModel): PermanentUpgradeModel => ({
    ...upgrade,
    permanentCost: getPermanentUpgradeCost(upgrade)
})
