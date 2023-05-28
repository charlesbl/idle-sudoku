import { columnSolver, draftColumnSolver } from '../solvers/column'
import { lastDraftSolver } from '../solvers/lastDraft'
import { draftLineSolver, lineSolver } from '../solvers/line'
import { draftSquareSolver, squareSolver } from '../solvers/square'
import { type Strategy } from '../solvers/strategies'

export interface UpgradeModel {
    id: string
    name: string
    cost: number
    description: string
    strategy?: Strategy
}

const createPurchaseStrategy = (id: string, name: string, description: string, cost: number, strategy: Strategy): UpgradeModel => {
    return {
        id,
        name,
        cost,
        description,
        strategy
    }
}

export const allUpgrades: UpgradeModel[] = [
    createPurchaseStrategy('line', 'Line Strategy', 'Unlock the line strategy for the solver', 1, lineSolver),
    createPurchaseStrategy('column', 'Column Strategy', 'Unlock the column strategy for the solver', 1, columnSolver),
    createPurchaseStrategy('square', 'Square Strategy', 'Unlock the square strategy for the solver', 1, squareSolver),
    createPurchaseStrategy('draft-line', 'Draft line Strategy', 'Unlock the draft line strategy for the solver', 1, draftLineSolver),
    createPurchaseStrategy('draft-column', 'Draft column Strategy', 'Unlock the draft column strategy for the solver', 1, draftColumnSolver),
    createPurchaseStrategy('draft-square', 'Draft square Strategy', 'Unlock the draft square strategy for the solver', 1, draftSquareSolver),
    createPurchaseStrategy('last-draft', 'Last Draft Strategy', 'Unlock the last draft strategy for the solver', 1, lastDraftSolver)
]
