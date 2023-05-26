import styled from 'styled-components'
import Sudoku from './Sudoku'
import { useEffect, useState } from 'react'
import { type SudokuModel, generateSudoku } from './SudokuModel'
import { solve, strategies } from './solvers/solver'

const AppStyle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 4em;
    font-family: Roboto, sans-serif;
    flex-direction: column;
`
const SOLVER_TICK_TIME = 10

const App = (): JSX.Element => {
    const [puzzle, solution] = generateSudoku()
    const [sudoku, setSudoku] = useState<SudokuModel>(puzzle)
    const [solutionSudoku, setSolutionSudoku] = useState<SudokuModel>(solution)
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [solverTile, setSolverTile] = useState<number>(0)
    const [draftMode, setDraftMode] = useState<boolean>(true)
    const [isSolved, setIsSolved] = useState<boolean>(false)
    const [currentStrategy, setCurrentStrategy] = useState<number>(0)

    useEffect(() => {
        const solverInterval = setInterval(() => {
            console.log(`TICK STRAT ${currentStrategy}`)
            if (isSolved) {
                clearInterval(solverInterval)
                setTimeout(() => {
                    reset()
                }, 2000)
                return
            }
            if (checkSolved()) {
                setIsSolved(true)
                setSolverTile(-1)
                return
            }
            if (solverTile === 80) {
                nexStrategy()
            }
            if (sudoku[solverTile].value !== undefined) {
                nextTile()
                return
            }
            const newSudoku = solve(strategies[currentStrategy], sudoku, solverTile)
            setSudoku(newSudoku)
            nextTile()
        }, SOLVER_TICK_TIME)
        return () => {
            clearInterval(solverInterval)
        }
    }, [solverTile, sudoku, isSolved, currentStrategy])

    const reset = (): void => {
        const [puzzle, solution] = generateSudoku()
        setSudoku(puzzle)
        setSolutionSudoku(solution)
        setIsSolved(false)
        setSolverTile(0)
        setCurrentStrategy(0)
    }

    const nextTile = (): void => {
        setSolverTile((solverTile + 1) % 81)
    }

    const nexStrategy = (): void => {
        setCurrentStrategy((currentStrategy + 1) % strategies.length)
        // setCurrentStrategy(Math.floor(Math.random() * strategies.length))
    }

    const checkSolved = (): boolean => sudoku.every((tile, i) => solutionSudoku[i].value === tile.value)

    const cheatSolve = (): void => {
        const newSudoku = [...sudoku]
        newSudoku.forEach((tile, i) => {
            tile.value = solutionSudoku[i].value
        })
        setSudoku(newSudoku)
    }

    const handleChangeDraftMode = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== ' ' && e.key !== '0') return
        setDraftMode(!draftMode)
    }

    const handleSelectedTileDisplacement = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (selectedTile === undefined) return
        if (!e.key.includes('Arrow')) return
        let newX = selectedTile % 9 + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)
        let newY = Math.floor(selectedTile / 9) + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)
        if (newX < 0) newX = 8
        if (newX > 8) newX = 0
        if (newY < 0) newY = 8
        if (newY > 8) newY = 0
        setSelectedTile(newX + newY * 9)
    }

    const handleChangeTileValue = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        const parsedKey = parseInt(e.key)
        if (isNaN(parsedKey) || parsedKey <= 0 || parsedKey > 9) return
        if (draftMode) {
            changeTileDraftMode(parsedKey)
        } else {
            changeTileNormalMode(parsedKey)
        }
    }

    const changeTileDraftMode = (value: number): void => {
        if (selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = [...sudoku]
        newSudoku[selectedTile].draftNumbers[value - 1] = !newSudoku[selectedTile].draftNumbers[value - 1]
        newSudoku[selectedTile].value = undefined
        setSudoku(newSudoku)
    }

    const changeTileNormalMode = (value: number): void => {
        if (selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = [...sudoku]
        newSudoku[selectedTile].value = value
        setSudoku(newSudoku)
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        handleChangeDraftMode(e)
        handleSelectedTileDisplacement(e)
        handleChangeTileValue(e)
    }

    return (
        <AppStyle
            onClick={() => { setSelectedTile(undefined) }}
            onKeyDown={handleOnKeyDown}
            tabIndex={0}
        >
            <div>
            Strategy:
                {' '}

                {currentStrategy}
            </div>

            <div>
            Draft mode:
                {' '}

                { draftMode ? 'on' : 'off'}
            </div>

            <Sudoku
                selectedTile={selectedTile}
                setSelectedTile={(tileId) => { setSelectedTile(tileId) }}
                solverTile={solverTile}
                sudoku={sudoku}
            />

            <div>
                <button onClick={cheatSolve}>Solve</button>

                <button onClick={() => { setIsSolved(true) }}>
                    pause
                </button>

                <button onClick={() => {
                    reset()
                }}
                >
                    New
                </button>
            </div>
        </AppStyle>
    )
}

export default App
