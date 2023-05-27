import { styled } from 'styled-components'
import Tile from './Tile'
import { useSudoku } from './SudokuContext'

const GridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
`

const SubGridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid gray;
`

const Sudoku = (): JSX.Element => {
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

export default Sudoku
