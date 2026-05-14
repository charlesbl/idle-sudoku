import { lastColumnDraftStrategy, lastDraftStrategy, lastLineDraftStrategy, lastSquareDraftStrategy, lastTileDraftStrategy } from './lastDraft'
import { removeAllDraftStrategy, removeColumnDraftStrategy, removeLineDraftStrategy, removeSquareDraftStrategy } from './removeDrafts'
import { autoDraftStrategy, setDraftStrategy } from './setDrafts'
import { type Strategy } from './strategy'

export const defaultStrategies: Strategy[] = [
    autoDraftStrategy,
    removeLineDraftStrategy,
    removeColumnDraftStrategy,
    removeSquareDraftStrategy
]

export const allStrategies: Strategy[] = [
    autoDraftStrategy,
    removeLineDraftStrategy,
    removeColumnDraftStrategy,
    removeSquareDraftStrategy,
    removeAllDraftStrategy,
    setDraftStrategy,
    lastLineDraftStrategy,
    lastColumnDraftStrategy,
    lastSquareDraftStrategy,
    lastTileDraftStrategy,
    lastDraftStrategy
]
