import styled from 'styled-components'

const SubGridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(3, minmax(0, 1fr));
    align-items: center;
    width: 86%;
    height: 86%;
    color: inherit;
    text-align: center;
`

const DraftTileStyle = styled.div`
    display: grid;
    place-items: center;
    min-width: 0;
    min-height: 0;
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1;
    opacity: 0.82;

    @media (width <= 620px) {
        font-size: 0.48rem;
    }
`

interface DraftTileProps {
    numbers?: boolean[]
}

const DraftTile = (props: DraftTileProps): JSX.Element => {
    const numbers = props.numbers ?? Array(9).fill(false)
    return (
        <SubGridStyle>
            {numbers.map((selected, index) => (
                <DraftTileStyle key={index}>{selected ? index + 1 : ''}</DraftTileStyle>
            ))}
        </SubGridStyle>
    )
}

export default DraftTile
