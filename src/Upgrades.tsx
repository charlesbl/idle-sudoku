import Upgrade from './Upgrade'
import styled from 'styled-components'
import { type UpgradeModel } from './upgrades/upgrade'

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

interface UpgradesProps {
    upgrades: UpgradeModel[]
}

const Upgrades = (props: UpgradesProps): JSX.Element => {
    return (
        <UpgradesStyle>
            <Title>Upgrades</Title>

            <UpgradesContainer>
                {props.upgrades.map((upgrade, index) => {
                    return (
                        <Upgrade
                            key={index}
                            upgrade={upgrade}
                        />
                    )
                })}
            </UpgradesContainer>
        </UpgradesStyle>
    )
}

export default Upgrades
