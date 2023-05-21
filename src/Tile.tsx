import styled from 'styled-components'
import DraftTile from './DraftTile'
import { type TileModel } from './SudokuModel'

const TileStyle = styled.div<{ selected: boolean }>`
    border: 1px solid white;
    width: 1em;
    height: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: ${props => props.selected ? 'white' : 'transparent'};
    color: ${props => props.selected ? 'black' : 'white'};
`

interface TileProps {
    onClick: () => void
    selected: boolean
    tileModel: TileModel
}

const Tile = (props: TileProps): JSX.Element => {
    const isDraft = props.tileModel.value === undefined

    return (
        <TileStyle
            onClick={(e) => { props.onClick(); e.stopPropagation() }}
            selected={props.selected}
        >
            {isDraft ? <DraftTile numbers={props.tileModel.draftNumbers} /> : props.tileModel.value}
        </TileStyle>
    )
}

export default Tile
