import { styled } from 'styled-components'
import Tile from './Tile'
import { type TileModel } from './SudokuModel'

const GridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
`

const SubGridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid gray;
`

interface SudokuProps {
    sudoku: TileModel[]
    selectedTile: number | undefined
    setSelectedTile: (tileId: number | undefined) => void
}

const Sudoku = (props: SudokuProps): JSX.Element => {
    return (
        <GridStyle>
            {Array(9).fill(0).map((_, i) => (
                <SubGridStyle key={i}>
                    {Array(9).fill(0).map((_, j) => {
                        // const x = i % 3 * 3 + j % 3
                        // const y = Math.trunc(i / 3) * 3 + Math.trunc(j / 3)
                        const tileId = i * 9 + j
                        return (
                            <Tile
                                key={j}
                                onClick={() => { props.setSelectedTile(tileId) }}
                                selected={props.selectedTile === tileId}
                                tileModel={props.sudoku[tileId]}
                            />
                        )
                    })}
                </SubGridStyle>
            ))}
        </GridStyle>
    )
}

export default Sudoku
