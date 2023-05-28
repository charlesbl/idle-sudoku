import useLocalStorageState from 'use-local-storage-state'
import { type Strategy } from '../../model/solvers/strategy'
import { allUpgrades } from '../../model/upgrades/upgrade'

interface StrategyHook {
    strategies: Strategy[]
    currentStrategy: Strategy | undefined
    setCurrentStrategy: (strategy?: Strategy) => void
    addStategy: (id: string) => void
}

export const useStrategy = (): StrategyHook => {
    const [currentStrategyId, setCurrentStrategyId] = useLocalStorageState<string | undefined>('currentStrategyId')
    const [strategyIds, setStrategyIds] = useLocalStorageState<string[]>('strategyIds', { defaultValue: [] })

    const getStrategy = (id: string): Strategy | undefined => allUpgrades.find(upgrade => upgrade.strategy?.id === id)?.strategy
    const addStategy = (id: string): void => { setStrategyIds([...strategyIds, id]) }
    const strategies = strategyIds.map(id => getStrategy(id)) as Strategy[]

    const currentStrategy = currentStrategyId !== undefined ? getStrategy(currentStrategyId) : undefined
    const setCurrentStrategy = (strategy?: Strategy): void => { setCurrentStrategyId(strategy?.id) }

    return {
        strategies,
        currentStrategy,
        setCurrentStrategy,
        addStategy
    }
}
