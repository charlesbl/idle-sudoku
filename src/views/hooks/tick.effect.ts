import { useEffect } from 'react'
import { type SudokuContextModel } from './sudoku.context'
import { runSolverStep } from '../../model/solvers/solver'
import { cloneSudoku } from '../../model/sudoku.model'

const SOLVER_TICK_TIME = 10

export const useTick = ({
    sudoku,
    solution,
    setSudoku,
    solverTile,
    setCurrentSolver,
    currentSolver,
    autoSolvers,
    solverQueue,
    setSolverQueue,
    setSolverTile,
    isSolved,
    setIsSolved,
    reset,
    upgradeFeatures,
    autoSolverQueueEnabled,
    solverDraftHelpers,
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
                    setCurrentSolver(undefined)
                    setSolverQueue([])
                    addMoney(1)
                    return
                }
                if (currentSolver === undefined && solverTile === undefined) {
                    const queuedSolver = solverQueue[0]
                    if (queuedSolver !== undefined) {
                        setSolverQueue(solverQueue.slice(1))
                        setCurrentSolver(queuedSolver)
                        return
                    }
                    if (upgradeFeatures.includes('autoSolverQueue') && autoSolverQueueEnabled && autoSolvers.length > 0) {
                        setSolverQueue(autoSolvers)
                        return
                    }
                }
                if (currentSolver !== undefined && solverTile === undefined) {
                    setSolverTile(0)
                    return
                }
                if (solverTile === undefined) {
                    return
                }
                if (currentSolver !== undefined) {
                    const newSudoku = runSolverStep(currentSolver.solve, cloneSudoku(sudoku), solverTile, solution)
                    const completedTiles = newSudoku
                        .map((tile, index) => ({ tile, index }))
                        .filter(({ tile, index }) => tile.value !== undefined && tile.value !== sudoku[index].value)
                        .map(({ index }) => index)

                    completedTiles.forEach((tileIndex) => {
                        solverDraftHelpers.forEach((helper) => {
                            helper.help(newSudoku, tileIndex)
                        })
                    })
                    setSudoku(newSudoku)
                }
                if (solverTile === 80) {
                    setCurrentSolver(undefined)
                    setSolverTile(undefined)
                    return
                }
                nextTile()
            }, SOLVER_TICK_TIME)
            return () => {
                clearInterval(solverInterval)
            }
        }, [solverTile, sudoku, isSolved, currentSolver, solverQueue, autoSolvers, upgradeFeatures, autoSolverQueueEnabled, solverDraftHelpers])
    }
}
