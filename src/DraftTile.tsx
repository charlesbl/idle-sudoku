import styled from 'styled-components'

const SubGridStyle = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
    width: 90%;
    height: 90%;
`

const DraftTileStyle = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.2em;
    height: 1em;
`

interface DraftTileProps {
    numbers: boolean[]
}

const DraftTile = (props: DraftTileProps): JSX.Element => {
    return (
        <SubGridStyle>
            {props.numbers.map((selected, index) => (
                <DraftTileStyle key={index}>{selected ? index + 1 : ''}</DraftTileStyle>
            ))}
        </SubGridStyle>
    )
}

export default DraftTile
