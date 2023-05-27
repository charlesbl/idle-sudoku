import Upgrade from './Upgrade'
import styled from 'styled-components'
import { type UpgradeModel } from '../model/upgrades/upgrade'
import { useSudoku } from './SudokuContext'

const UpgradesStyle = styled.div`
    text-align: left;   
    margin-right: 1em;
    width: 40vw;
`

const Title = styled.div`
    font-size: 2em;
    font-weight: bold;
    text-align: center;
    margin: 10px;
`

const UpgradesContainer = styled.div`
    height: 70vh;
    overflow-y: scroll;
`

const Upgrades = (): JSX.Element => {
    const { upgrades } = useSudoku()
    return (
        <UpgradesStyle>
            <Title>Upgrades</Title>

            {upgrades.length > 0
                ? (
                    <UpgradesContainer>
                        {upgrades.map((upgrade, index) => {
                            return (
                                <Upgrade
                                    key={index}
                                    upgrade={upgrade}
                                />
                            )
                        })}
                    </UpgradesContainer>
                )
                : <div>No upgrades available</div>}
        </UpgradesStyle>
    )
}

export default Upgrades
