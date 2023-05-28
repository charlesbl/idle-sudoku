import styled from 'styled-components'
import DraftTile from './DraftTile'
import { type TileModel } from '../model/sudoku.model'

const TileStyle = styled.div<{ $selected: boolean, $solving: boolean, $fixed: boolean, $error: boolean }>`
    border: 1px solid white;
    width: 1em;
    height: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: ${props => props.$solving ? 'green' : props.$selected ? 'white' : 'transparent'};
    color: ${props => props.$fixed ? 'grey' : props.$error ? 'red' : props.$selected ? 'black' : 'white'};
`

interface TileProps {
    onClick: () => void
    selected: boolean
    tileModel: TileModel
    solving: boolean
}

const Tile = (props: TileProps): JSX.Element => {
    const isDraft = props.tileModel.value === undefined

    return (
        <TileStyle
            $error={props.tileModel.error}
            $fixed={props.tileModel.fixed}
            $selected={props.selected}
            $solving={props.solving}
            onClick={(e) => { props.onClick(); e.stopPropagation() }}
        >
            {isDraft ? <DraftTile numbers={props.tileModel.draftNumbers} /> : props.tileModel.value}
        </TileStyle>
    )
}

export default Tile
