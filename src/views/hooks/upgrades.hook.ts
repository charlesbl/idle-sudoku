import useLocalStorageState from 'use-local-storage-state'
import { allUnlockUpgrades, type UnlockUpgradeModel, type UpgradeFeature } from '../../model/upgrades/unlockUpgrade'

interface UpgradeHook {
    unlockUpgrades: UnlockUpgradeModel[]
    upgradeFeatures: UpgradeFeature[]
    setUnlockUpgrades: (upgrades: UnlockUpgradeModel[]) => void
    unlockUpgradeFeature: (feature: UpgradeFeature) => void
}

export const useUpgrades = (): UpgradeHook => {
    const [unlockUpgradeIds, setUnlockUpgradeIds] = useLocalStorageState<string[]>('upgradeIds', { defaultValue: allUnlockUpgrades.map(upgrade => upgrade.id) })
    const [upgradeFeatures, setUpgradeFeatures] = useLocalStorageState<UpgradeFeature[]>('upgradeFeatures', { defaultValue: [] })

    const unlockUpgrades = allUnlockUpgrades.filter(upgrade => {
        const featureNotUnlocked = upgrade.feature !== undefined && !upgradeFeatures.includes(upgrade.feature)
        return unlockUpgradeIds.includes(upgrade.id) || featureNotUnlocked
    })
    const setUnlockUpgrades = (upgrades: UnlockUpgradeModel[]): void => { setUnlockUpgradeIds(upgrades.map(upgrade => upgrade.id)) }
    const unlockUpgradeFeature = (feature: UpgradeFeature): void => {
        if (upgradeFeatures.includes(feature)) return
        setUpgradeFeatures([...upgradeFeatures, feature])
    }

    return {
        unlockUpgrades,
        upgradeFeatures,
        setUnlockUpgrades,
        unlockUpgradeFeature
    }
}
