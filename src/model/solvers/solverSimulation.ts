import { fillValidDrafts } from '../drafts'
import { type GameDifficulty } from '../difficulty'
import { cloneSudoku, generateSudoku, type SudokuModel } from '../sudoku.model'
import { blockDraftHelper, columnDraftHelper, rowDraftHelper } from '../draftHelpers/draftHelpers'
import { runSolverStep } from './solver'
import { allSolvers } from './solvers'

export interface SolverSimulationOptions {
    difficulties?: GameDifficulty[]
    puzzlesPerDifficulty?: number
    maxPasses?: number
}

export interface SolverSimulationFailure {
    difficulty: GameDifficulty
    puzzleIndex: number
    filledCells: number
}

export interface SolverSimulationResult {
    checkedPuzzles: number
    failures: SolverSimulationFailure[]
}

const solverDraftHelpers = [rowDraftHelper, columnDraftHelper, blockDraftHelper]

const isSolved = (sudoku: SudokuModel, solution: number[]): boolean =>
    sudoku.every((tile, index) => tile.value === solution[index])

const serializeSudoku = (sudoku: SudokuModel): string =>
    sudoku
        .map(tile => `${tile.value ?? '-'}:${tile.draftNumbers.map(draft => draft ? '1' : '0').join('')}`)
        .join('|')

const runSolverPass = (sudoku: SudokuModel, solution: number[]): SudokuModel => {
    return allSolvers.reduce((currentSudoku, solver) => {
        let nextSudoku = cloneSudoku(currentSudoku)

        for (let tileIndex = 0; tileIndex < nextSudoku.length; tileIndex++) {
            const previousValue = nextSudoku[tileIndex].value
            nextSudoku = runSolverStep(solver.solve, nextSudoku, tileIndex, solution, 100)

            if (nextSudoku[tileIndex].value !== undefined && nextSudoku[tileIndex].value !== previousValue) {
                solverDraftHelpers.forEach(helper => { helper.help(nextSudoku, tileIndex) })
            }

            if (!isSolved(nextSudoku, solution)) continue
        }

        return nextSudoku
    }, sudoku)
}

export const runSolverSimulation = ({
    difficulties = ['hard', 'expert'],
    puzzlesPerDifficulty = 10,
    maxPasses = 200
}: SolverSimulationOptions = {}): SolverSimulationResult => {
    const failures: SolverSimulationFailure[] = []

    difficulties.forEach((difficulty) => {
        for (let puzzleIndex = 0; puzzleIndex < puzzlesPerDifficulty; puzzleIndex++) {
            const [puzzle, solution] = generateSudoku(difficulty)
            let sudoku = fillValidDrafts(puzzle)
            let previousSnapshot = ''

            for (let pass = 0; pass < maxPasses && !isSolved(sudoku, solution); pass++) {
                const nextSudoku = runSolverPass(sudoku, solution)
                const nextSnapshot = serializeSudoku(nextSudoku)
                if (nextSnapshot === previousSnapshot) break
                previousSnapshot = nextSnapshot
                sudoku = nextSudoku
            }

            if (!isSolved(sudoku, solution)) {
                failures.push({
                    difficulty,
                    puzzleIndex,
                    filledCells: sudoku.filter(tile => tile.value !== undefined).length
                })
            }
        }
    })

    return {
        checkedPuzzles: difficulties.length * puzzlesPerDifficulty,
        failures
    }
}
