import { type SudokuModel } from '../sudoku.model'
import { removeLineDraftStrategy, removeColumnDraftStrategy, removeSquareDraftStrategy, removeAllDraftStrategy } from './removeDrafts'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategy'

export const setDraftStrategy: Strategy = {
    id: 'set-draft',
    name: 'set drafts strategy',
    solver: (sudoku: SudokuModel, solvingTile: number): SudokuModel => {
        let newSudoku = [...sudoku]
        newSudoku[solvingTile].draftNumbers = Array(9).fill(true)
        const testedNumbers: TestedNumber[] = newSudoku[solvingTile].draftNumbers.map((isDraft, index) => ({ index, isDraft }))
        newSudoku = removeLineDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        newSudoku = removeColumnDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        newSudoku = removeSquareDraftStrategy.solver(newSudoku, solvingTile, testedNumbers)
        return newSudoku
    },
    overrideStrategies: [removeLineDraftStrategy, removeColumnDraftStrategy, removeSquareDraftStrategy, removeAllDraftStrategy]
}
