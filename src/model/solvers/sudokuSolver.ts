import { type SolverStep } from './solver'

export interface SudokuSolver {
    id: string
    name: string
    solve: SolverStep
    replaces?: SudokuSolver[]
}

export const isSolverUnlocked = (activeSolvers: SudokuSolver[], solverId: string): boolean => {
    const checkSolver = (s: SudokuSolver): boolean => {
        if (s.id === solverId) return true
        if (s.replaces !== undefined) {
            return s.replaces.some(checkSolver)
        }
        return false
    }
    return activeSolvers.some(checkSolver)
}

export const areSolverPrerequisitesUnlocked = (activeSolvers: SudokuSolver[], solver: SudokuSolver): boolean => {
    if (solver.replaces === undefined) return true
    return solver.replaces.every(replaced => isSolverUnlocked(activeSolvers, replaced.id))
}
