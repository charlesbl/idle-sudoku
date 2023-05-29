import { columnDraftHelper } from '../draftHelpers/column'
import { type DraftHelper } from '../draftHelpers/draftHelpers'
import { lineDraftHelper } from '../draftHelpers/line'
import { squareDraftHelper } from '../draftHelpers/square'
import { columnSolver, draftColumnSolver } from '../solvers/column'
import { errorTrackerSolver } from '../solvers/errorTracker'
import { lastDraftSolver } from '../solvers/lastDraft'
import { draftLineSolver, lineSolver } from '../solvers/line'
import { removeDraftSolver } from '../solvers/removeDrafts'
import { draftSquareSolver, squareSolver } from '../solvers/square'
import { type Strategy } from '../solvers/strategy'

export interface UpgradeModel {
    id: string
    name: string
    cost: number
    description: string
    strategy?: Strategy
    draftHelper?: DraftHelper
}

export const allUpgrades: UpgradeModel[] = [
    { id: 'line-draft-helper', name: 'Line Draft Helper', cost: 1, description: 'Unlock the line draft helper', draftHelper: lineDraftHelper },
    { id: 'column-draft-helper', name: 'Column Draft Helper', cost: 1, description: 'Unlock the column draft helper', draftHelper: columnDraftHelper },
    { id: 'square-draft-helper', name: 'Square Draft Helper', cost: 1, description: 'Unlock the square draft helper', draftHelper: squareDraftHelper },

    { id: 'set-all-drafts-on-start', name: 'Auto Draft', cost: 1, description: 'Set all drafts on start' },

    { id: 'error-tracker', name: 'Error Tracker', cost: 1, description: 'Set tile on error if its not the solution', strategy: errorTrackerSolver },

    { id: 'line-solver', name: 'Line Strategy', cost: 1, description: 'Unlock the line strategy for the solver', strategy: lineSolver },
    { id: 'column-solver', name: 'Column Strategy', cost: 1, description: 'Unlock the column strategy for the solver', strategy: columnSolver },
    { id: 'square-solver', name: 'Square Strategy', cost: 1, description: 'Unlock the square strategy for the solver', strategy: squareSolver },
    { id: 'remove-draft-solver', name: 'Remove Draft Strategy', cost: 1, description: 'Unlock the remove draft strategy for the solver', strategy: removeDraftSolver },

    { id: 'draft-line-solver', name: 'Draft line Strategy', cost: 1, description: 'Unlock the draft line strategy for the solver', strategy: draftLineSolver },
    { id: 'draft-column-solver', name: 'Draft column Strategy', cost: 1, description: 'Unlock the draft column strategy for the solver', strategy: draftColumnSolver },
    { id: 'draft-square-solver', name: 'Draft square Strategy', cost: 1, description: 'Unlock the draft square strategy for the solver', strategy: draftSquareSolver },
    { id: 'last-draft-solver', name: 'Last Draft Strategy', cost: 1, description: 'Unlock the last draft strategy for the solver', strategy: lastDraftSolver }
]
