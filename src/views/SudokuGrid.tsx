import { styled } from 'styled-components'
import Tile from './Tile'
import { useSudoku } from './hooks/SudokuContext'

const GridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 2px solid white;
`

const SubGridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 2px solid white;
`

const SudokuGrid = (): JSX.Element => {
    const { sudoku, solverTile, selectedTile, setSelectedTile } = useSudoku()
    if (sudoku === undefined) return <></>
    return (
        <GridStyle>
            {Array(9).fill(0).map((_, i) => (
                <SubGridStyle key={i}>
                    {Array(9).fill(0).map((_, j) => {
                        const tileId = i % 3 * 3 + j % 3 + (Math.trunc(i / 3) * 3 + Math.trunc(j / 3)) * 9
                        return (
                            <Tile
                                key={j}
                                onClick={() => { setSelectedTile(tileId) }}
                                selected={selectedTile === tileId}
                                solving={solverTile === tileId}
                                tileModel={sudoku[tileId]}
                            />
                        )
                    })}
                </SubGridStyle>
            ))}
        </GridStyle>
    )
}

export default SudokuGrid
