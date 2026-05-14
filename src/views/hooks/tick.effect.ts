import { useEffect } from 'react'
import { type SudokuContextModel } from './sudoku.context'
import { solve } from '../../model/solvers/solver'
import { cloneSudoku } from '../../model/sudoku.model'

const SOLVER_TICK_TIME = 10

export const useTick = ({
    sudoku,
    solution,
    setSudoku,
    solverTile,
    setCurrentStrategy,
    currentStrategy,
    setSolverTile,
    isSolved,
    setIsSolved,
    reset,
    upgrades,
    addMoney
}: SudokuContextModel): () => void => {
    const nextTile = (): void => {
        if (solverTile === undefined) return
        setSolverTile((solverTile + 1) % 81)
        // const remainingIds = sudoku?.map((tile, i) => ({ ...tile, i })).filter(tile => tile.value === undefined).map(tile => tile.i)
        // if (remainingIds === undefined) return
        // setSolverTile(remainingIds[Math.floor(Math.random() * remainingIds.length)])
    }

    const checkSolved = (): boolean =>
        sudoku !== undefined &&
        solution !== undefined &&
        sudoku.every((tile, i) => solution[i] === tile.value)
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
                    addMoney(1)
                    return
                }
                if (currentStrategy !== undefined && solverTile === undefined) {
                    setSolverTile(0)
                    return
                }
                if (solverTile === undefined) {
                    return
                }
                if (currentStrategy !== undefined) {
                    const newSudoku = solve(currentStrategy.solver, cloneSudoku(sudoku), solverTile, solution)
                    setSudoku(newSudoku)
                }
                if (solverTile === 80) {
                    setCurrentStrategy(undefined)
                    setSolverTile(undefined)
                    return
                }
                nextTile()
            }, SOLVER_TICK_TIME)
            return () => {
                clearInterval(solverInterval)
            }
        }, [solverTile, sudoku, isSolved, currentStrategy, upgrades])
    }
}
