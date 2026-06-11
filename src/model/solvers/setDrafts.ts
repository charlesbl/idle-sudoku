import { type SudokuModel } from '../sudoku.model'
import { clearBlockDraftsSolver, clearColumnDraftsSolver, clearImpossibleDraftsSolver, clearRowDraftsSolver } from './removeDrafts'
import { type TestedNumber } from './solver'
import { type SudokuSolver } from './sudokuSolver'

export const fillCellsWithDraftsSolver: SudokuSolver = {
    id: 'fill-cells-with-drafts',
    name: 'Fill cells with drafts',
    solve: (sudoku: SudokuModel, solvingTile: number): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        newSudoku[solvingTile].draftNumbers = Array(9).fill(true)
        return newSudoku
    }
}

export const calculateValidDraftsSolver: SudokuSolver = {
    id: 'calculate-valid-drafts',
    name: 'Calculate valid drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, _testedNumbers: TestedNumber[], solution?: number[]): SudokuModel => {
        let newSudoku = [...sudoku]
        newSudoku[solvingTile].draftNumbers = Array(9).fill(true)
        const testedNumbersForCell: TestedNumber[] = newSudoku[solvingTile].draftNumbers.map((isDraft, index) => ({ index, isDraft }))
        newSudoku = clearRowDraftsSolver.solve(newSudoku, solvingTile, testedNumbersForCell, solution)
        newSudoku = clearColumnDraftsSolver.solve(newSudoku, solvingTile, testedNumbersForCell, solution)
        newSudoku = clearBlockDraftsSolver.solve(newSudoku, solvingTile, testedNumbersForCell, solution)
        return newSudoku
    },
    replaces: [fillCellsWithDraftsSolver, clearRowDraftsSolver, clearColumnDraftsSolver, clearBlockDraftsSolver, clearImpossibleDraftsSolver]
}
