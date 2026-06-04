import useLocalStorageState from 'use-local-storage-state'
import { type SudokuSolver } from '../../model/solvers/sudokuSolver'
import { maxSolverSpeedLevel, normalizeSolverSpeedLevel } from '../../model/solvers/solverSpeed'

export type SolverSpeedLevels = Record<string, number>

interface SolverSpeedsHook {
    solverSpeedLevels: SolverSpeedLevels
    getSolverSpeedLevel: (solver: SudokuSolver) => number
    setSolverSpeedLevel: (solver: SudokuSolver, level: number) => void
    upgradeSolverSpeed: (solver: SudokuSolver) => void
    resetSolverSpeeds: () => void
}

export const useSolverSpeeds = (): SolverSpeedsHook => {
    const [solverSpeedLevels, setSolverSpeedLevels] = useLocalStorageState<SolverSpeedLevels>('solverSpeedLevels', { defaultValue: {} })

    const getSolverSpeedLevel = (solver: SudokuSolver): number =>
        normalizeSolverSpeedLevel(solverSpeedLevels[solver.id])

    const setSolverSpeedLevel = (solver: SudokuSolver, level: number): void => {
        setSolverSpeedLevels({
            ...solverSpeedLevels,
            [solver.id]: normalizeSolverSpeedLevel(level)
        })
    }

    const upgradeSolverSpeed = (solver: SudokuSolver): void => {
        const currentLevel = getSolverSpeedLevel(solver)
        if (currentLevel >= maxSolverSpeedLevel) return
        setSolverSpeedLevel(solver, currentLevel + 1)
    }

    const resetSolverSpeeds = (): void => {
        setSolverSpeedLevels({})
    }

    return {
        solverSpeedLevels,
        getSolverSpeedLevel,
        setSolverSpeedLevel,
        upgradeSolverSpeed,
        resetSolverSpeeds
    }
}
