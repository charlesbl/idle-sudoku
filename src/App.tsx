import styled from 'styled-components'
import Sudoku from './Sudoku'
import { type KeyboardEventHandler, useEffect, useState } from 'react'
import { type TileModel, generateSudoku } from './SudokuModel'

const AppStyle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 4em;
    font-family: Roboto, sans-serif;
    flex-direction: column;
`

const App = (): JSX.Element => {
    const [sudoku, setSudoku] = useState<TileModel[]>(generateSudoku())
    const [selectedTile, setSelectedTile] = useState<number | undefined>(undefined)
    const [draftMode, setDraftMode] = useState<boolean>(false)

    const handleChangeDraftMode = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== ' ' && e.key !== '0') return
        setDraftMode(!draftMode)
    }

    const handleSelectedTileDisplacement = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (selectedTile === undefined) return
        if (!e.key.includes('Arrow')) return
        const i = Math.floor(selectedTile / 9)
        const j = selectedTile % 9
        let newX = i % 3 * 3 + j % 3 + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)
        let newY = Math.trunc(i / 3) * 3 + Math.trunc(j / 3) + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)
        if (newX < 0) newX = 8
        if (newX > 8) newX = 0
        if (newY < 0) newY = 8
        if (newY > 8) newY = 0
        setSelectedTile((Math.floor(newX / 3) + Math.floor(newY / 3) * 3) * 9 + (newX % 3) + (newY % 3) * 3)
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
                Draft mode:
                {' '}

                { draftMode ? 'on' : 'off'}
            </div>

            <Sudoku
                selectedTile={selectedTile}
                setSelectedTile={(tileId) => { setSelectedTile(tileId) }}
                sudoku={sudoku}
            />
        </AppStyle>
    )
}

export default App
