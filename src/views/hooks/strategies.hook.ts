import useLocalStorageState from 'use-local-storage-state'
import { type Strategy } from '../../model/solvers/strategy'
import { allStrategies, defaultStrategies } from '../../model/solvers/strategies'

interface StrategyHook {
    strategies: Strategy[]
    currentStrategy: Strategy | undefined
    strategyQueue: Strategy[]
    setCurrentStrategy: (strategy?: Strategy) => void
    setStrategies: (strategies: Strategy[]) => void
    setStrategyQueue: (strategies: Strategy[]) => void
    queueStrategy: (strategy: Strategy) => void
}

export const useStrategy = (): StrategyHook => {
    const [currentStrategyId, setCurrentStrategyId] = useLocalStorageState<string | undefined>('currentStrategyId')
    const [strategyQueueIds, setStrategyQueueIds] = useLocalStorageState<string[]>('strategyQueueIds', { defaultValue: [] })
    const [strategyIds, setStrategyIds] = useLocalStorageState<string[]>('strategyIds', {
        defaultValue: defaultStrategies.map(strategy => strategy.id)
    })

    const getStrategy = (id: string): Strategy | undefined => allStrategies.find(strategy => strategy.id === id)
    const isDefaultStrategyOverridden = (defaultStrategy: Strategy): boolean =>
        strategyIds.some((id) =>
            getStrategy(id)?.overrideStrategies?.some(strategy => strategy.id === defaultStrategy.id) ?? false
        )
    const defaultStrategyIds = defaultStrategies
        .filter(strategy => !isDefaultStrategyOverridden(strategy))
        .map(strategy => strategy.id)
    const strategyIdsWithDefaults = [...defaultStrategyIds, ...strategyIds]
    const mapStrategyIds = (ids: string[]): Strategy[] =>
        ids
            .map(id => getStrategy(id))
            .filter((strategy): strategy is Strategy => strategy !== undefined)
    const strategies = mapStrategyIds([...new Set(strategyIdsWithDefaults)])
    const setStrategies = (strategies: Strategy[]): void => { setStrategyIds(strategies.map(strategy => strategy.id)) }

    const currentStrategy = currentStrategyId !== undefined ? getStrategy(currentStrategyId) : undefined
    const setCurrentStrategy = (strategy?: Strategy): void => { setCurrentStrategyId(strategy?.id) }
    const strategyIdsSet = new Set(strategies.map(strategy => strategy.id))
    const strategyQueue = mapStrategyIds(strategyQueueIds).filter(strategy => strategyIdsSet.has(strategy.id))
    const setStrategyQueue = (strategies: Strategy[]): void => { setStrategyQueueIds(strategies.map(strategy => strategy.id)) }
    const queueStrategy = (strategy: Strategy): void => {
        if (currentStrategyId === undefined && strategyQueueIds.length === 0) {
            setCurrentStrategy(strategy)
            return
        }
        setStrategyQueueIds([...strategyQueueIds, strategy.id])
    }

    return {
        strategies,
        currentStrategy,
        strategyQueue,
        setCurrentStrategy,
        setStrategies,
        setStrategyQueue,
        queueStrategy
    }
}
