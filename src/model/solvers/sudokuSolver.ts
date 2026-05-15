import { type SolverStep } from './solver'

export interface SudokuSolver {
    id: string
    name: string
    solve: SolverStep
    replaces?: SudokuSolver[]
}
