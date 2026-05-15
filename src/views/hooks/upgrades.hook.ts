import useLocalStorageState from 'use-local-storage-state'
import { allUpgrades, type UpgradeFeature, type UpgradeModel } from '../../model/upgrades/upgrade'

interface UpgradeHook {
    upgrades: UpgradeModel[]
    upgradeFeatures: UpgradeFeature[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
    unlockUpgradeFeature: (feature: UpgradeFeature) => void
}

export const useUpgrades = (): UpgradeHook => {
    const [upgradeIds, setUpgradeIds] = useLocalStorageState<string[]>('upgradeIds', { defaultValue: allUpgrades.map(upgrade => upgrade.id) })
    const [upgradeFeatures, setUpgradeFeatures] = useLocalStorageState<UpgradeFeature[]>('upgradeFeatures', { defaultValue: [] })

    const upgrades = allUpgrades.filter(upgrade => {
        const featureNotUnlocked = upgrade.feature !== undefined && !upgradeFeatures.includes(upgrade.feature)
        return upgradeIds.includes(upgrade.id) || featureNotUnlocked
    })
    const setUpgrades = (upgrades: UpgradeModel[]): void => { setUpgradeIds(upgrades.map(upgrade => upgrade.id)) }
    const unlockUpgradeFeature = (feature: UpgradeFeature): void => {
        if (upgradeFeatures.includes(feature)) return
        setUpgradeFeatures([...upgradeFeatures, feature])
    }

    return {
        upgrades,
        upgradeFeatures,
        setUpgrades,
        unlockUpgradeFeature
    }
}
