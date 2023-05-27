import { type SudokuModel } from '../SudokuModel'
import { type TestedNumber } from './solver'
import { type Strategy } from './strategies'

export const lineSolver: Strategy = {
    id: 'line',
    name: 'Line Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        const newSudoku = [...sudoku]
        const line = newSudoku.filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
        testedNumbers.forEach((testedNb) => {
            if (line.some((tile) => tile.value === testedNb.index + 1)) { newSudoku[solvingTile].draftNumbers[testedNb.index] = false }
        })
        return newSudoku
    }
}

export const draftLineSolver: Strategy = {
    id: 'draft-line',
    name: 'Draft Line Strategy',
    solver: (sudoku: SudokuModel, solvingTile: number, testedNumbers: TestedNumber[]): SudokuModel => {
        const newSudoku = [...sudoku]
        const line = newSudoku.map((tm, i) => ({ ...tm, i })).filter((_, index) => Math.floor(index / 9) === Math.floor(solvingTile / 9))
        testedNumbers.forEach((testedNb) => {
            if (line.every((tile) => tile.i === solvingTile || (tile.value !== undefined && tile.value !== testedNb.index + 1) || !tile.draftNumbers[testedNb.index])) {
                newSudoku[solvingTile].value = testedNb.index + 1
            }
        })
        return newSudoku
    }
}
