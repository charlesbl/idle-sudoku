import { lineDraftHelper, type DraftHelper, columnDraftHelper, squareDraftHelper } from '../draftHelpers/draftHelpers'
import { errorTrackerSolver } from '../solvers/errorTracker'
import { lastColumnDraftStrategy, lastDraftStrategy, lastLineDraftStrategy, lastSquareDraftStrategy, lastTileDraftStrategy } from '../solvers/lastDraft'
import { removeAllDraftStrategy, removeColumnDraftStrategy, removeLineDraftStrategy, removeSquareDraftStrategy } from '../solvers/removeDrafts'
import { type Strategy } from '../solvers/strategy'

export interface UpgradeModel {
    id: string
    name: string
    cost: number
    description: string
    strategy?: Strategy
    draftHelper?: DraftHelper
}

const createStrategyUpgrade = (strategy: Strategy, description: string, cost: number): UpgradeModel => ({
    id: `${strategy.id}-upgrade`,
    name: strategy.name,
    cost,
    description,
    strategy
})

export const allUpgrades: UpgradeModel[] = [
    // draft helpers
    {
        id: `${lineDraftHelper.id}-upgrade`,
        name: 'Line draft helper',
        cost: 1,
        description: 'When you place a number, remove this number draft on line',
        draftHelper: lineDraftHelper
    },
    {
        id: `${columnDraftHelper.id}-upgrade`,
        name: 'Column draft helper',
        cost: 1,
        description: 'When you place a number, remove this number draft on column',
        draftHelper: columnDraftHelper
    },
    {
        id: `${squareDraftHelper.id}-upgrade`,
        name: 'Square draft helper',
        cost: 1,
        description: 'When you place a number, remove this number draft on square',
        draftHelper: squareDraftHelper
    },
    // miscs
    {
        id: 'set-all-drafts-on-start',
        name: 'Auto draft',
        cost: 1,
        description: 'Set all drafts on start'
    },
    createStrategyUpgrade(errorTrackerSolver, 'Set tile on error if its not the solution', 1),

    // remove drafts
    createStrategyUpgrade(removeLineDraftStrategy, 'Remove impossible draft on line', 1),
    createStrategyUpgrade(removeColumnDraftStrategy, 'Remove impossible draft on column', 1),
    createStrategyUpgrade(removeSquareDraftStrategy, 'Remove impossible draft on square', 1),
    createStrategyUpgrade(removeAllDraftStrategy, 'Remove impossible draft', 1),
    // last draft
    createStrategyUpgrade(lastLineDraftStrategy, 'Set number if the draft is available only in one tile on the line', 1),
    createStrategyUpgrade(lastColumnDraftStrategy, 'Set number if the draft is available only in one tile on the column', 1),
    createStrategyUpgrade(lastSquareDraftStrategy, 'Set number if the draft is available only in one tile on the square', 1),
    createStrategyUpgrade(lastTileDraftStrategy, 'Set number if its the last draft of the tile', 1),
    createStrategyUpgrade(lastDraftStrategy, 'Set number if the draft is available only in one tile on the line / colmun / square or if its the last draft of the tile', 1)
]
