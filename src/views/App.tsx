import styled from 'styled-components'
import SudokuGrid from './SudokuGrid'
import Upgrades from './Upgrades'
import { useSudoku } from './hooks/sudoku.context'

// TODO add in right panel a button for each strategy to activate it and pass only once, queue strategies if the first one is not finished

const AppStyle = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    height: 100vh;
    font-family: Roboto, sans-serif;
`

const SudokuLayout = styled.div`
    text-align: center;
    font-size: 4em;
`

const Infos = styled.div`
    text-align: center;
    font-size: 0.5em;
`

const App = (): JSX.Element => {
    const {
        sudoku,
        setSudoku,
        draftMode,
        setDraftMode,
        selectedTile,
        setSelectedTile,
        strategies,
        currentStrategy,
        cheatSolve,
        reset,
        money,
        draftHelpers
    } = useSudoku()

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
        if (sudoku === undefined || selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = [...sudoku]
        newSudoku[selectedTile].draftNumbers[value - 1] = !newSudoku[selectedTile].draftNumbers[value - 1]
        newSudoku[selectedTile].value = undefined
        setSudoku(newSudoku)
    }

    const changeTileNormalMode = (value: number): void => {
        if (sudoku === undefined || selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = [...sudoku]
        if (newSudoku[selectedTile].value === value) {
            newSudoku[selectedTile].value = undefined
            setSudoku(newSudoku)
            return
        }

        newSudoku[selectedTile].value = value
        newSudoku[selectedTile].error = false

        draftHelpers.forEach((helper) => {
            helper.help(newSudoku, selectedTile)
        })

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
            <Upgrades />

            <SudokuLayout>
                <Infos>
                    <div>
                        {money}

                        €
                    </div>

                    <div>
                        {currentStrategy?.name ?? 'No Strategy'}
                    </div>

                    <div>
                    Draft mode:

                        { draftMode ? 'on' : 'off'}
                    </div>
                </Infos>

                {sudoku === undefined
                    ? 'Generating...'
                    : (
                        <SudokuGrid />
                    )}

                <div>
                    <button onClick={cheatSolve}>Solve</button>

                    <button onClick={() => {
                        reset()
                    }}
                    >
                        New
                    </button>

                    <button onClick={() => { localStorage.clear() }}>Clear save</button>
                </div>
            </SudokuLayout>

            <div>
                <div>
                    Unlocked Strategies
                </div>

                <div>
                    {strategies.map((strategy) => (
                        <div key={strategy.id}>
                            {strategy.id === currentStrategy?.id ? '-> ' : ''}

                            {strategy.name}
                        </div>
                    ))}
                </div>
            </div>
        </AppStyle>
    )
}

export default App
