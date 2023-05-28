import useLocalStorageState from 'use-local-storage-state'
import { allUpgrades, type UpgradeModel } from '../../model/upgrades/upgrade'

interface UpgradeHook {
    upgrades: UpgradeModel[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
}

export const useUpgrades = (): UpgradeHook => {
    const [upgradeIds, setUpgradeIds] = useLocalStorageState<string[]>('upgradeIds', { defaultValue: allUpgrades.map(upgrade => upgrade.id) })

    const upgrades = allUpgrades.filter(upgrade => upgradeIds.includes(upgrade.id))
    const setUpgrades = (upgrades: UpgradeModel[]): void => { setUpgradeIds(upgrades.map(upgrade => upgrade.id)) }

    return {
        upgrades,
        setUpgrades
    }
}
