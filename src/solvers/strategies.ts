import { columnSolver, draftColumnSolver } from './column'
import { lastDraftSolver } from './lastDraft'
import { lineSolver, draftLineSolver } from './line'
import { squareSolver, draftSquareSolver } from './square'

export const strategies = [
    lineSolver,
    columnSolver,
    squareSolver,
    draftLineSolver,
    draftColumnSolver,
    draftSquareSolver,
    lastDraftSolver
]
