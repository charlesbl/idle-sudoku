import { styled } from 'styled-components'
import Tile from './Tile'
import { useSudoku } from './hooks/sudoku.context'
import {
    getSolverSpeedLevel as getSolverSpeedLevelDetails,
    getSolverTileScanTimeMs
} from '../model/solvers/solverSpeed'

const GridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    aspect-ratio: 1;
    width: 100%;
    overflow: hidden;
    border: 3px solid #f8fafc;
    border-radius: 6px;
    background: #070b10;
    box-shadow:
        0 0 0 1px rgb(81 214 194 / 25%),
        inset 0 0 30px rgb(0 0 0 / 55%);
`

const SubGridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(3, minmax(0, 1fr));
    min-width: 0;
    min-height: 0;
    border: 2px solid #f8fafc;
`

const SudokuGrid = (): JSX.Element => {
    const { currentSolver, getSolverSpeedLevel, sudoku, solverTile, selectedTile, setSelectedTile } = useSudoku()
    if (sudoku === undefined) return <></>

    const solverScanDurationMs = currentSolver !== undefined
        ? getSolverTileScanTimeMs(getSolverSpeedLevelDetails(getSolverSpeedLevel(currentSolver)))
        : undefined

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
                                scanDurationMs={solverScanDurationMs}
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
