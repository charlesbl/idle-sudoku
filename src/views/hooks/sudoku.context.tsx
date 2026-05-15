import { type PropsWithChildren, type SetStateAction, createContext, useContext, useState } from 'react'
import type React from 'react'
import { type CustomDifficulty, generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import { getUnlockedUpgradeCategory, type UpgradeFeature, type UpgradeModel } from '../../model/upgrades/upgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type Strategy } from '../../model/solvers/strategy'
import { useTick } from './tick.effect'
import { useStrategy } from './strategies.hook'
import { useUpgrades } from './upgrades.hook'
import { useMoney } from './money.hook'
import { trackSudokuErrors } from '../../model/solvers/errorTracker'
import { columnDraftHelper, type DraftHelper, lineDraftHelper, squareDraftHelper } from '../../model/draftHelpers/draftHelpers'
import { useDraftHelpers } from './draftHelpers.hook'

const DIFFICULTY: CustomDifficulty = 'medium'

export interface SudokuContextModel {
    solution: number[] | undefined
    sudoku: SudokuModel | undefined
    setSudoku: React.Dispatch<React.SetStateAction<SudokuModel | undefined>>
    selectedTile: number | undefined
    setSelectedTile: React.Dispatch<React.SetStateAction<number | undefined>>
    solverTile: number | undefined
    draftMode: boolean
    setDraftMode: React.Dispatch<React.SetStateAction<boolean>>
    strategies: Strategy[]
    currentStrategy: Strategy | undefined
    strategyQueue: Strategy[]
    setCurrentStrategy: (strategy?: Strategy) => void
    setStrategyQueue: (strategies: Strategy[]) => void
    queueStrategy: (strategy: Strategy) => void
    upgrades: UpgradeModel[]
    upgradeFeatures: UpgradeFeature[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
    hasUpgradeFeature: (feature: UpgradeFeature) => boolean
    autoStrategyQueueEnabled: boolean
    setAutoStrategyQueueEnabled: React.Dispatch<React.SetStateAction<boolean>>
    cheatSolve: () => void
    reset: () => void
    isSolved: boolean
    setIsSolved: React.Dispatch<React.SetStateAction<boolean>>
    setSolverTile: React.Dispatch<React.SetStateAction<number | undefined>>
    money: number
    addMoney: (amount: number) => void
    purchaseUpgrade: (upgrade: UpgradeModel) => void
    draftHelpers: DraftHelper[]
    strategyDraftHelpers: DraftHelper[]
    addDraftHelper: (id: string) => void
}

const SudokuContext = createContext<SudokuContextModel>({} as any)

export const SudokuProvider = (props: PropsWithChildren): JSX.Element => {
    const [sudoku, setStoredSudoku] = useLocalStorageState<SudokuModel | undefined>('sudoku')
    const [solution, setSolution] = useLocalStorageState<number[] | undefined>('solution')
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [solverTile, setSolverTile] = useLocalStorageState<number | undefined>('solverTile')
    const [draftMode, setDraftMode] = useLocalStorageState<boolean>('draftMode', { defaultValue: false })
    const [isSolved, setIsSolved] = useLocalStorageState<boolean>('isSolved', { defaultValue: false })
    const [autoStrategyQueueEnabled, setAutoStrategyQueueEnabled] = useLocalStorageState<boolean>('autoStrategyQueueEnabled', { defaultValue: true })

    const { upgrades, upgradeFeatures, setUpgrades, unlockUpgradeFeature } = useUpgrades()

    const { setCurrentStrategy, strategies, currentStrategy, setStrategies, strategyQueue, setStrategyQueue, queueStrategy } = useStrategy()

    const { money, addMoney, spend } = useMoney()
    const { draftHelpers, addDraftHelper } = useDraftHelpers()
    const strategyDraftHelpers = [
        upgradeFeatures.includes('strategyLineDraftHelper') ? lineDraftHelper : undefined,
        upgradeFeatures.includes('strategyColumnDraftHelper') ? columnDraftHelper : undefined,
        upgradeFeatures.includes('strategySquareDraftHelper') ? squareDraftHelper : undefined
    ].filter((helper): helper is DraftHelper => helper !== undefined)

    const hasValueUpdate = (nextSudoku: SudokuModel, previousSudoku?: SudokuModel): boolean =>
        previousSudoku === undefined ||
        nextSudoku.some((tile, index) => tile.value !== previousSudoku[index]?.value)

    const setSudoku: React.Dispatch<SetStateAction<SudokuModel | undefined>> = (action) => {
        setStoredSudoku((previousSudoku) => {
            const nextSudoku = typeof action === 'function'
                ? action(previousSudoku)
                : action

            if (nextSudoku === undefined || solution === undefined) return nextSudoku
            if (!hasValueUpdate(nextSudoku, previousSudoku)) return nextSudoku

            return trackSudokuErrors(nextSudoku, solution)
        })
    }

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku(DIFFICULTY)
        setStoredSudoku(puzzle)
        setSolution(solution)
        setIsSolved(false)
        setSolverTile(undefined)
        setCurrentStrategy(undefined)
        setStrategyQueue([])
    }

    const hasUpgradeFeature = (feature: UpgradeFeature): boolean => upgradeFeatures.includes(feature)

    const purchaseUpgrade = (upgrade: UpgradeModel): void => {
        const upgradeAvailable = upgrades.some((availableUpgrade) => availableUpgrade.id === upgrade.id)
        if (!upgradeAvailable || upgrade.category !== getUnlockedUpgradeCategory(upgrades)) return

        const spent = spend(upgrade.cost)
        if (!spent) return
        if (upgrade.strategy !== undefined) {
            let newStrategies = [...strategies, upgrade.strategy]
            if (upgrade.strategy.overrideStrategies !== undefined) {
                const removeStrategyIds = upgrade.strategy.overrideStrategies.map(strategy => strategy.id)
                newStrategies = newStrategies.filter(strategy => !removeStrategyIds.includes(strategy.id))
            }
            setStrategies(newStrategies)
        }
        if (upgrade.draftHelper !== undefined) {
            addDraftHelper(upgrade.draftHelper.id)
        }
        if (upgrade.feature !== undefined) {
            unlockUpgradeFeature(upgrade.feature)
            if (upgrade.feature === 'autoStrategyQueue') setAutoStrategyQueueEnabled(true)
        }
        const overrideStrategyIds = upgrade.strategy?.overrideStrategies?.map(strategy => strategy.id) ?? []
        setUpgrades(upgrades.filter((u) =>
            u.id !== upgrade.id &&
            (u.strategy === undefined || !overrideStrategyIds.includes(u.strategy.id))
        ))
    }

    const cheatSolve = (): void => {
        if (solution === undefined || sudoku === undefined) return
        const newSudoku = sudoku.map((tile, i) => ({
            ...tile,
            value: solution[i],
            error: false
        }))
        setSudoku(newSudoku)
    }

    const value: SudokuContextModel = {
        sudoku,
        setSudoku,
        solution,
        selectedTile,
        setSelectedTile,
        solverTile,
        draftMode,
        setDraftMode,
        strategies,
        currentStrategy,
        strategyQueue,
        upgrades,
        upgradeFeatures,
        setUpgrades,
        cheatSolve,
        reset,
        isSolved,
        setIsSolved,
        setCurrentStrategy,
        setStrategyQueue,
        queueStrategy,
        setSolverTile,
        money,
        addMoney,
        purchaseUpgrade,
        hasUpgradeFeature,
        autoStrategyQueueEnabled,
        setAutoStrategyQueueEnabled,
        draftHelpers,
        strategyDraftHelpers,
        addDraftHelper
    }

    const tickeffect = useTick(value)
    tickeffect()

    return (
        <SudokuContext.Provider value={value}>
            {props.children}
        </SudokuContext.Provider>
    )
}

export const useSudoku = (): SudokuContextModel => {
    return useContext(SudokuContext)
}
