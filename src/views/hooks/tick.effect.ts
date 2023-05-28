import { useEffect } from 'react'
import { type SudokuContextModel } from './sudoku.context'
import { solve } from '../../model/solvers/solver'

const SOLVER_TICK_TIME = 10

export const useTick = ({
    sudoku,
    solution,
    setSudoku,
    solverTile,
    setCurrentStrategy,
    strategies,
    currentStrategy,
    setSolverTile,
    isSolved,
    setIsSolved,
    reset,
    upgrades
}: SudokuContextModel): () => void => {
    const nextTile = (): void => {
        if (solverTile === undefined) return
        setSolverTile((solverTile + 1) % 81)
        // const remainingIds = sudoku?.map((tile, i) => ({ ...tile, i })).filter(tile => tile.value === undefined).map(tile => tile.i)
        // if (remainingIds === undefined) return
        // setSolverTile(remainingIds[Math.floor(Math.random() * remainingIds.length)])
    }

    const nexStrategy = (): void => {
        if (strategies.length === 0) return
        if (currentStrategy === undefined) {
            setCurrentStrategy(strategies[0])
            return
        }
        setCurrentStrategy(strategies[(strategies.indexOf(currentStrategy) + 1) % strategies.length])
    }

    const checkSolved = (): boolean =>
        sudoku !== undefined &&
        solution !== undefined &&
        sudoku.every((tile, i) => solution[i].value === tile.value)
    return (): void => {
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
                    reset()
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
        }, [solverTile, sudoku, isSolved, currentStrategy, upgrades])
    }
}
