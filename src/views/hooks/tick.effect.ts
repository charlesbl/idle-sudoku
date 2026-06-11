import { useEffect } from 'react'
import { type SudokuContextModel } from './sudoku.context'
import { runSolverStep } from '../../model/solvers/solver'
import { cloneSudoku } from '../../model/sudoku.model'
import { getSolverSpeedLevel as getSolverSpeedLevelDetails } from '../../model/solvers/solverSpeed'

const SOLVER_IDLE_TICK_TIME = 80

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
    solverSpeedLevels,
    getSolverSpeedLevel,
    puzzleTransitionDelayMs,
    autoSolverCooldownUntil,
    setAutoSolverCooldownUntil,
    autoQueueCooldownDelayMs,
    solutionAssistChancePercent,
    completeSolvedPuzzle
}: SudokuContextModel): void => {
    const checkSolved = (): boolean =>
        sudoku !== undefined &&
        solution !== undefined &&
        sudoku.every((tile, i) => solution[i] === tile.value)
    const getTickTime = (): number => {
        if (currentSolver === undefined || solverTile === undefined) return SOLVER_IDLE_TICK_TIME
        return getSolverSpeedLevelDetails(getSolverSpeedLevel(currentSolver)).tileTimeMs
    }
    const getNextSolver = (): { nextSolver: typeof currentSolver, nextQueue: typeof solverQueue } => {
        const queuedSolver = solverQueue[0]
        if (queuedSolver !== undefined) {
            setAutoSolverCooldownUntil(undefined)
            return {
                nextSolver: queuedSolver,
                nextQueue: solverQueue.slice(1)
            }
        }

        if (upgradeFeatures.includes('autoSolverQueue') && autoSolverQueueEnabled && autoSolvers.length > 0) {
            if (autoQueueCooldownDelayMs > 0 && autoSolverCooldownUntil === undefined) {
                setAutoSolverCooldownUntil(Date.now() + autoQueueCooldownDelayMs)
                return {
                    nextSolver: undefined,
                    nextQueue: []
                }
            }

            if (autoSolverCooldownUntil !== undefined && autoSolverCooldownUntil > Date.now()) {
                return {
                    nextSolver: undefined,
                    nextQueue: []
                }
            }

            setAutoSolverCooldownUntil(undefined)
            return {
                nextSolver: autoSolvers[0],
                nextQueue: autoSolvers.slice(1)
            }
        }

        if (autoSolverCooldownUntil !== undefined) setAutoSolverCooldownUntil(undefined)

        return {
            nextSolver: undefined,
            nextQueue: []
        }
    }
    const startNextSolver = (): boolean => {
        const { nextSolver, nextQueue } = getNextSolver()
        if (nextSolver === undefined) return false

        setSolverQueue(nextQueue)
        setCurrentSolver(nextSolver)
        setSolverTile(0)
        return true
    }

    useEffect(() => {
            if (isSolved) {
                const resetTimeout = setTimeout(() => {
                    reset()
                }, puzzleTransitionDelayMs)

                return () => {
                    clearTimeout(resetTimeout)
                }
            }

            const solverInterval = setInterval(() => {
                if (sudoku === undefined || solution === undefined) {
                    reset()
                    return
                }
                if (checkSolved()) {
                    clearInterval(solverInterval)
                    setIsSolved(true)
                    setSolverTile(undefined)
                    setCurrentSolver(undefined)
                    setSolverQueue([])
                    completeSolvedPuzzle()
                    return
                }
                if (currentSolver === undefined && solverTile === undefined) {
                    startNextSolver()
                    return
                }
                if (currentSolver !== undefined && solverTile === undefined) {
                    setSolverTile(0)
                    return
                }
                if (solverTile === undefined) {
                    return
                }
                if (currentSolver !== undefined) {
                    const speed = getSolverSpeedLevelDetails(getSolverSpeedLevel(currentSolver))
                    let newSudoku = cloneSudoku(sudoku)
                    let nextSolverTile = solverTile
                    let solverCompletedPass = false

                    for (let scan = 0; scan < speed.tilesPerTick; scan++) {
                        const previousValue = newSudoku[nextSolverTile].value
                        newSudoku = runSolverStep(currentSolver.solve, newSudoku, nextSolverTile, solution, solutionAssistChancePercent)

                        if (newSudoku[nextSolverTile].value !== undefined && newSudoku[nextSolverTile].value !== previousValue) {
                            if (solution !== undefined && newSudoku[nextSolverTile].value === solution[nextSolverTile]) {
                                solverDraftHelpers.forEach((helper) => {
                                    helper.help(newSudoku, nextSolverTile)
                                })
                            }
                        }

                        if (nextSolverTile === 80) {
                            solverCompletedPass = true
                            break
                        }

                        nextSolverTile++
                    }

                    setSudoku(newSudoku)

                    if (solverCompletedPass) {
                        if (!startNextSolver()) {
                            setCurrentSolver(undefined)
                            setSolverTile(undefined)
                        }
                        return
                    }

                    setSolverTile(nextSolverTile)
                }
            }, getTickTime())
            return () => {
                clearInterval(solverInterval)
            }
        }, [solverTile, sudoku, isSolved, currentSolver, solverQueue, autoSolvers, upgradeFeatures, autoSolverQueueEnabled, solverDraftHelpers, solverSpeedLevels, puzzleTransitionDelayMs, autoSolverCooldownUntil, autoQueueCooldownDelayMs, solutionAssistChancePercent])
}
