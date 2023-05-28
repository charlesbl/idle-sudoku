import { type SudokuModel } from '../sudoku.model'
import { columnDraftHelper } from './column'
import { lineDraftHelper } from './line'
import { squareDraftHelper } from './square'

export interface DraftHelper {
    id: string
    help: (sudoku: SudokuModel, selectedTile: number) => void
}

export const allDraftHelpers: DraftHelper[] = [
    lineDraftHelper,
    columnDraftHelper,
    squareDraftHelper
]
