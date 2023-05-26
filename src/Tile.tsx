import styled from 'styled-components'
import DraftTile from './DraftTile'
import { type TileModel } from './SudokuModel'

const TileStyle = styled.div<{ selected: boolean, solving: boolean, fixed: boolean }>`
    border: 1px solid white;
    width: 1em;
    height: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: ${props => props.solving ? 'green' : props.selected ? 'white' : 'transparent'};
    color: ${props => props.fixed ? 'grey' : props.selected ? 'black' : 'white'};
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
            fixed={props.tileModel.fixed}
            onClick={(e) => { props.onClick(); e.stopPropagation() }}
            selected={props.selected}
            solving={props.solving}
        >
            {isDraft ? <DraftTile numbers={props.tileModel.draftNumbers} /> : props.tileModel.value}
        </TileStyle>
    )
}

export default Tile
