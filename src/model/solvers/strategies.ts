import { columnSolver, draftColumnSolver } from './column'
import { lastDraftSolver } from './lastDraft'
import { lineSolver, draftLineSolver } from './line'
import { type Solver } from './solver'
import { squareSolver, draftSquareSolver } from './square'

export interface Strategy {
    id: string
    name: string
    solver: Solver
}

export const allStrategies: Strategy[] = [
    lineSolver,
    columnSolver,
    squareSolver,
    draftLineSolver,
    draftColumnSolver,
    draftSquareSolver,
    lastDraftSolver
]
