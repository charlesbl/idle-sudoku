import { type PropsWithChildren, createContext, useContext, useState, useEffect } from 'react'
import type React from 'react'
import { generateSudoku, type SudokuModel } from '../model/SudokuModel'
import { solve } from '../model/solvers/solver'
import { allUpgrades, type UpgradeModel } from '../model/upgrades/upgrade'
import useLocalStorageState from 'use-local-storage-state'
import { type Strategy, allStrategies } from '../model/solvers/strategies'

const SOLVER_TICK_TIME = 10

interface SudokuContextModel {
    solution: SudokuModel | undefined
    sudoku: SudokuModel | undefined
    setSudoku: React.Dispatch<React.SetStateAction<SudokuModel | undefined>>
    selectedTile: number | undefined
    setSelectedTile: React.Dispatch<React.SetStateAction<number | undefined>>
    solverTile: number | undefined
    draftMode: boolean
    setDraftMode: React.Dispatch<React.SetStateAction<boolean>>
    currentStrategy: Strategy | undefined
    addStategy: (id: string) => void
    upgrades: UpgradeModel[]
    setUpgrades: (upgrades: UpgradeModel[]) => void
    checkSolved: () => boolean
    cheatSolve: () => void
    reset: () => void
}

const SudokuContext = createContext<SudokuContextModel>({} as any)

export const SudokuProvider = (props: PropsWithChildren): JSX.Element => {
    const [sudoku, setSudoku] = useLocalStorageState<SudokuModel | undefined>('sudoku')
    const [solution, setSolution] = useLocalStorageState<SudokuModel | undefined>('solution')
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [solverTile, setSolverTile] = useLocalStorageState<number | undefined>('solverTile')
    const [draftMode, setDraftMode] = useLocalStorageState<boolean>('draftMode', { defaultValue: true })
    const [isSolved, setIsSolved] = useLocalStorageState<boolean>('isSolved', { defaultValue: false })
    const [currentStrategyId, setCurrentStrategyId] = useLocalStorageState<string | undefined>('currentStrategyId')
    const [strategyIds, setStrategyIds] = useLocalStorageState<string[]>('strategyIds', { defaultValue: [] })
    const [upgradeIds, setUpgradeIds] = useLocalStorageState<string[]>('upgradeIds', { defaultValue: allUpgrades.map(upgrade => upgrade.id) })

    const upgrades = allUpgrades.filter(upgrade => upgradeIds.includes(upgrade.id))
    const setUpgrades = (upgrades: UpgradeModel[]): void => { setUpgradeIds(upgrades.map(upgrade => upgrade.id)) }

    const getStrategy = (id: string): Strategy | undefined => allStrategies.find(strategy => strategy.id === id)
    const addStategy = (id: string): void => { setStrategyIds([...strategyIds, id]) }
    const currentStrategy = currentStrategyId !== undefined ? getStrategy(currentStrategyId) : undefined

    useEffect(() => {
        const solverInterval = setInterval(() => {
            if (isSolved) {
                clearInterval(solverInterval)
                setTimeout(() => {
                    reset()
                }, 2000)
                return
            }
            if (sudoku === undefined || solution === undefined) {
                const [puzzle, solution] = generateSudoku()
                setSudoku(puzzle)
                setSolution(solution)
                return
            }
            if (checkSolved()) {
                setIsSolved(true)
                setSolverTile(undefined)
                return
            }
            if (currentStrategy === undefined) {
                nexStrategy()
                return
            }
            if (solverTile === undefined) {
                setSolverTile(0)
                return
            }
            if (solverTile === 80) {
                nexStrategy()
            }
            if (sudoku[solverTile].value !== undefined) {
                nextTile()
                return
            }
            if (currentStrategy !== undefined) {
                const newSudoku = solve(currentStrategy.solver, sudoku, solverTile)
                setSudoku(newSudoku)
            }
            nextTile()
        }, SOLVER_TICK_TIME)
        return () => {
            console.log('clearing interval')
            clearInterval(solverInterval)
        }
    }, [solverTile, sudoku, isSolved, currentStrategyId, upgradeIds])

    const checkSolved = (): boolean =>
        sudoku !== undefined &&
        solution !== undefined &&
        sudoku.every((tile, i) => solution[i].value === tile.value)

    const nextTile = (): void => {
        if (solverTile === undefined) return
        setSolverTile((solverTile + 1) % 81)
    }

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku()
        setSudoku(puzzle)
        setSolution(solution)
        setIsSolved(false)
        setSolverTile(0)
        setCurrentStrategyId(undefined)
    }

    const nexStrategy = (): void => {
        if (strategyIds.length === 0) return
        if (currentStrategy === undefined) {
            setCurrentStrategyId(strategyIds[0])
            return
        }
        setCurrentStrategyId(strategyIds[(strategyIds.indexOf(currentStrategy.id) + 1) % strategyIds.length])
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
        currentStrategy,
        addStategy,
        upgrades,
        setUpgrades,
        checkSolved,
        cheatSolve,
        reset
    }

    return (
        <SudokuContext.Provider value={value}>
            {props.children}
        </SudokuContext.Provider>
    )
}

export const useSudoku = (): SudokuContextModel => {
    return useContext(SudokuContext)
}
