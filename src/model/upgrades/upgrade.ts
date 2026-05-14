import { columnDraftHelper, type DraftHelper, lineDraftHelper, squareDraftHelper } from '../draftHelpers/draftHelpers'
import { lastColumnDraftStrategy, lastDraftStrategy, lastLineDraftStrategy, lastSquareDraftStrategy, lastTileDraftStrategy } from '../solvers/lastDraft'
import { removeAllDraftStrategy } from '../solvers/removeDrafts'
import { setDraftStrategy } from '../solvers/setDrafts'
import { type Strategy } from '../solvers/strategy'

export interface UpgradeModel {
    id: string
    name: string
    category: UpgradeCategory
    cost: number
    description: string
    strategy?: Strategy
    draftHelper?: DraftHelper
}

export type UpgradeCategory =
    | 'helpers'
    | 'Last drafts'
    | 'Remove drafts strategy'
    | 'set drafts strategy'
    | 'Last draft strategy'

const createStrategyUpgrade = (strategy: Strategy, category: UpgradeCategory, description: string, cost: number): UpgradeModel => ({
    id: `${strategy.id}-upgrade`,
    name: strategy.name,
    category,
    cost,
    description,
    strategy
})

export const allUpgrades: UpgradeModel[] = [
    // draft helpers
    {
        id: `${lineDraftHelper.id}-upgrade`,
        name: 'Line draft helper',
        category: 'helpers',
        cost: 1,
        description: 'When you place a number, remove this number draft on line',
        draftHelper: lineDraftHelper
    },
    {
        id: `${columnDraftHelper.id}-upgrade`,
        name: 'Column draft helper',
        category: 'helpers',
        cost: 1,
        description: 'When you place a number, remove this number draft on column',
        draftHelper: columnDraftHelper
    },
    {
        id: `${squareDraftHelper.id}-upgrade`,
        name: 'Square draft helper',
        category: 'helpers',
        cost: 1,
        description: 'When you place a number, remove this number draft on square',
        draftHelper: squareDraftHelper
    },
    // last draft
    createStrategyUpgrade(lastLineDraftStrategy, 'Last drafts', 'Set number if the draft is available only in one tile on the line', 1),
    createStrategyUpgrade(lastColumnDraftStrategy, 'Last drafts', 'Set number if the draft is available only in one tile on the column', 1),
    createStrategyUpgrade(lastSquareDraftStrategy, 'Last drafts', 'Set number if the draft is available only in one tile on the square', 1),
    createStrategyUpgrade(lastTileDraftStrategy, 'Last drafts', 'Set number if its the last draft of the tile', 1),
    // remove drafts
    createStrategyUpgrade(removeAllDraftStrategy, 'Remove drafts strategy', 'Remove impossible draft', 1),
    // set draft
    createStrategyUpgrade(setDraftStrategy, 'set drafts strategy', 'Set all drafts', 1),
    createStrategyUpgrade(lastDraftStrategy, 'Last draft strategy', 'Set number if the draft is available only in one tile on the line / colmun / square or if its the last draft of the tile', 1)
]
