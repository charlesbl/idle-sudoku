import { type PropsWithChildren, createContext, useContext, useState } from 'react'
import type React from 'react'
import { type CustomDifficulty, generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import { type UpgradeModel } from '../../model/upgrades/upgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type Strategy } from '../../model/solvers/strategy'
import { useTick } from './tick.effect'
import { useStrategy } from './strategies.hook'
import { useUpgrades } from './upgrades.hook'
import { useMoney } from './money.hook'
import { useDraftHelpers } from './draftHelpers.hook'
import { type DraftHelper } from '../../model/draftHelpers/draftHelpers'

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
    addStategy: (id: string) => void
    currentStrategy: Strategy | undefined
    setCurrentStrategy: (strategy: Strategy) => void
    upgrades: UpgradeModel[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
    cheatSolve: () => void
    reset: () => void
    isSolved: boolean
    setIsSolved: React.Dispatch<React.SetStateAction<boolean>>
    setSolverTile: React.Dispatch<React.SetStateAction<number | undefined>>
    money: number
    addMoney: (amount: number) => void
    purchaseUpgrade: (upgrade: UpgradeModel) => void
    draftHelpers: DraftHelper[]
    addDraftHelper: (id: string) => void
}

const SudokuContext = createContext<SudokuContextModel>({} as any)

export const SudokuProvider = (props: PropsWithChildren): JSX.Element => {
    const [sudoku, setSudoku] = useLocalStorageState<SudokuModel | undefined>('sudoku')
    const [solution, setSolution] = useLocalStorageState<number[] | undefined>('solution')
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [solverTile, setSolverTile] = useLocalStorageState<number | undefined>('solverTile')
    const [draftMode, setDraftMode] = useLocalStorageState<boolean>('draftMode', { defaultValue: true })
    const [isSolved, setIsSolved] = useLocalStorageState<boolean>('isSolved', { defaultValue: false })
    const [draftOnStart, setDraftOnStart] = useLocalStorageState<boolean>('draftOnStart', { defaultValue: false })

    const { upgrades, setUpgrades } = useUpgrades()

    const { setCurrentStrategy, strategies, currentStrategy, addStategy } = useStrategy()

    const { money, addMoney, spend } = useMoney()

    const { draftHelpers, addDraftHelper } = useDraftHelpers()

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku(DIFFICULTY)
        if (draftOnStart) puzzle.forEach((tile) => { tile.draftNumbers = Array(9).fill(true) })
        setSudoku(puzzle)
        setSolution(solution)
        setIsSolved(false)
        setSolverTile(undefined)
        setCurrentStrategy(undefined)
    }

    const purchaseUpgrade = (upgrade: UpgradeModel): void => {
        const spent = spend(upgrade.cost)
        if (!spent) return
        if (upgrade.strategy !== undefined) {
            addStategy(upgrade.strategy.id)
        }
        if (upgrade.draftHelper !== undefined) {
            addDraftHelper(upgrade.draftHelper.id)
        }
        if (upgrade.id === 'set-all-drafts-on-start') {
            setDraftOnStart(true)
        }
        setUpgrades(upgrades.filter((u) => u.id !== upgrade.id))
    }

    const cheatSolve = (): void => {
        if (solution === undefined || sudoku === undefined) return
        const newSudoku = [...sudoku]
        newSudoku.forEach((tile, i) => {
            tile.value = solution[i]
        })
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
        addStategy,
        upgrades,
        setUpgrades,
        cheatSolve,
        reset,
        isSolved,
        setIsSolved,
        setCurrentStrategy,
        setSolverTile,
        money,
        addMoney,
        purchaseUpgrade,
        draftHelpers,
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
