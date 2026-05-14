import styled from 'styled-components'
import DraftTile from './DraftTile'
import { type TileModel } from '../model/sudoku.model'

const TileStyle = styled.div<{ $selected: boolean, $solving: boolean, $fixed: boolean, $error: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    border: 1px solid rgb(248 250 252 / 45%);
    color: ${props => props.$selected ? '#09111c' : props.$fixed ? '#7f8797' : props.$error ? '#ff6b6b' : '#f8fafc'};
    font-size: 2.55rem;
    font-weight: ${props => props.$fixed ? 700 : 800};
    line-height: 1;
    background: ${props => props.$solving
        ? 'linear-gradient(135deg, rgb(81 214 194 / 0.9), rgb(244 201 93 / 0.75))'
        : props.$selected
            ? '#f8fafc'
            : props.$error
                ? 'rgb(255 107 107 / 0.1)'
                : 'rgb(8 13 20 / 0.76)'};
    box-shadow: ${props => props.$selected
        ? 'inset 0 0 0 3px rgb(81 214 194 / 0.85), 0 0 22px rgb(81 214 194 / 0.3)'
        : props.$solving
            ? 'inset 0 0 0 2px rgb(255 255 255 / 0.35)'
            : 'inset 0 1px 0 rgb(255 255 255 / 0.05)'};
    cursor: pointer;
    transition:
        background 120ms ease,
        box-shadow 120ms ease,
        color 120ms ease;

    &:hover {
        background: ${props => props.$selected
        ? '#f8fafc'
        : 'rgb(255 255 255 / 0.08)'};
    }

    @media (width <= 620px) {
        font-size: 1.45rem;
    }
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
