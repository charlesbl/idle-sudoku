import { getBlockId } from '../../utils/utils'
import { type SudokuModel } from '../sudoku.model'
import { type TestedNumber } from './solver'
import { type SudokuSolver } from './sudokuSolver'

export const onlyDraftInCellSolver: SudokuSolver = {
    id: 'only-draft-in-cell',
    name: 'Only draft in cell',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]) => {
        if (testedNumbers.length !== 1 || sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        newSudoku[solvingTile].value = testedNumbers[0].index + 1
        return newSudoku
    }
}

export const singleDraftInRowSolver: SudokuSolver = {
    id: 'single-draft-in-row',
    name: 'Single draft in row',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const row = newSudoku
            .map((tile, index) => ({ ...tile, index }))
            .filter((tile) => Math.floor(tile.index / 9) === Math.floor(solvingTile / 9))
        testedNumbers.forEach((testedNb) => {
            if (row.every((tile) => tile.index === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}

export const singleDraftInColumnSolver: SudokuSolver = {
    id: 'single-draft-in-column',
    name: 'Single draft in column',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const column = newSudoku
            .map((tile, index) => ({ ...tile, index }))
            .filter((tile) => Math.floor(tile.index % 9) === Math.floor(solvingTile % 9))
        testedNumbers.forEach((testedNb) => {
            if (column.every((tile) => tile.index === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}

export const singleDraftInBlockSolver: SudokuSolver = {
    id: 'single-draft-in-block',
    name: 'Single draft in block',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        if (sudoku[solvingTile].value !== undefined) return sudoku
        const newSudoku = [...sudoku]
        const block = newSudoku
            .map((tile, index) => ({ ...tile, index }))
            .filter((tile) => getBlockId(tile.index) === getBlockId(solvingTile))
        testedNumbers.forEach((testedNb) => {
            if (block.every((tile) => tile.index === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}

export const findSingleDraftsSolver: SudokuSolver = {
    id: 'find-single-drafts',
    name: 'Find single drafts',
    solve: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        let newSudoku = singleDraftInRowSolver.solve(sudoku, solvingTile, testedNumbers)
        newSudoku = singleDraftInColumnSolver.solve(newSudoku, solvingTile, testedNumbers)
        newSudoku = singleDraftInBlockSolver.solve(newSudoku, solvingTile, testedNumbers)
        newSudoku = onlyDraftInCellSolver.solve(newSudoku, solvingTile, testedNumbers)
        return newSudoku
    },
    replaces: [singleDraftInRowSolver, singleDraftInColumnSolver, singleDraftInBlockSolver, onlyDraftInCellSolver]
}
