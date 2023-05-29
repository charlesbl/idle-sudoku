import useLocalStorageState from 'use-local-storage-state'
import { type Strategy } from '../../model/solvers/strategy'
import { allUpgrades } from '../../model/upgrades/upgrade'

interface StrategyHook {
    strategies: Strategy[]
    currentStrategy: Strategy | undefined
    setCurrentStrategy: (strategy?: Strategy) => void
    setStrategies: (strategies: Strategy[]) => void
}

export const useStrategy = (): StrategyHook => {
    const [currentStrategyId, setCurrentStrategyId] = useLocalStorageState<string | undefined>('currentStrategyId')
    const [strategyIds, setStrategyIds] = useLocalStorageState<string[]>('strategyIds', { defaultValue: [] })

    const getStrategy = (id: string): Strategy | undefined => allUpgrades.find(upgrade => upgrade.strategy?.id === id)?.strategy
    const mapStrategyIds = (ids: string[]): Strategy[] => ids.map(id => getStrategy(id)) as Strategy[]
    const strategies = mapStrategyIds(strategyIds)
    const setStrategies = (strategies: Strategy[]): void => { setStrategyIds(strategies.map(strategy => strategy.id)) }

    const currentStrategy = currentStrategyId !== undefined ? getStrategy(currentStrategyId) : undefined
    const setCurrentStrategy = (strategy?: Strategy): void => { setCurrentStrategyId(strategy?.id) }

    return {
        strategies,
        currentStrategy,
        setCurrentStrategy,
        setStrategies
    }
}
