import { type PropsWithChildren, createContext, useContext, useState } from 'react'
import type React from 'react'
import { generateSudoku, type SudokuModel } from '../../model/sudoku.model'
import { allUpgrades, type UpgradeModel } from '../../model/upgrades/upgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type Strategy } from '../../model/solvers/strategies'
import { type Difficulty } from 'sudoku-gen/dist/types/difficulty.type'
import { useTick } from './tick.effect'
import { useStrategy } from './strategies.hook'
import { useUpgrades } from './upgrades.hook'

const DIFFICULTY: Difficulty = 'easy'

export interface SudokuContextModel {
    solution: SudokuModel | undefined
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
}

const SudokuContext = createContext<SudokuContextModel>({} as any)

export const SudokuProvider = (props: PropsWithChildren): JSX.Element => {
    const [sudoku, setSudoku] = useLocalStorageState<SudokuModel | undefined>('sudoku')
    const [solution, setSolution] = useLocalStorageState<SudokuModel | undefined>('solution')
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [solverTile, setSolverTile] = useLocalStorageState<number | undefined>('solverTile')
    const [draftMode, setDraftMode] = useLocalStorageState<boolean>('draftMode', { defaultValue: true })
    const [isSolved, setIsSolved] = useLocalStorageState<boolean>('isSolved', { defaultValue: false })

    const { upgrades, setUpgrades } = useUpgrades()

    const {
        setCurrentStrategy,
        strategies,
        currentStrategy,
        addStategy
    } = useStrategy()

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku(DIFFICULTY)
        setSudoku(puzzle)
        setSolution(solution)
        setIsSolved(false)
        setSolverTile(undefined)
        setCurrentStrategy(undefined)
    }

    const cheatSolve = (): void => {
        if (solution === undefined || sudoku === undefined) return
        const newSudoku = [...sudoku]
        newSudoku.forEach((tile, i) => {
            tile.value = solution[i].value
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
        setSolverTile
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
