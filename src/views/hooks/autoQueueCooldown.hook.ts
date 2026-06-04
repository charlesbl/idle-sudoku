import useLocalStorageState from 'use-local-storage-state'
import { maxAutoQueueCooldownLevel, normalizeAutoQueueCooldownLevel } from '../../model/autoQueueCooldown'

interface AutoQueueCooldownHook {
    autoQueueCooldownLevel: number
    setAutoQueueCooldownLevel: (level: number) => void
    upgradeAutoQueueCooldown: () => void
    resetAutoQueueCooldown: () => void
}

export const useAutoQueueCooldown = (): AutoQueueCooldownHook => {
    const [storedAutoQueueCooldownLevel, setAutoQueueCooldownLevel] = useLocalStorageState<number>('autoQueueCooldownLevel', { defaultValue: 0 })
    const autoQueueCooldownLevel = normalizeAutoQueueCooldownLevel(storedAutoQueueCooldownLevel)

    const upgradeAutoQueueCooldown = (): void => {
        if (autoQueueCooldownLevel >= maxAutoQueueCooldownLevel) return
        setAutoQueueCooldownLevel(autoQueueCooldownLevel + 1)
    }

    const resetAutoQueueCooldown = (): void => {
        setAutoQueueCooldownLevel(0)
    }

    return {
        autoQueueCooldownLevel,
        setAutoQueueCooldownLevel,
        upgradeAutoQueueCooldown,
        resetAutoQueueCooldown
    }
}
