import styled from 'styled-components'
import { type UpgradeModel } from '../model/upgrades/upgrade'
import { useSudoku } from './SudokuContext'

const UgradeStyle = styled.div`
    font-size: 1em;
    border: 1px solid white;
`
const Title = styled.div`
    font-size: 1.5em;
    font-weight: bold;
    text-align: center;
    margin: 10px;
`

const Description = styled.div`
    margin: 10px;
`

const Cost = styled.div`
    text-align: right;
`

const CostButton = styled.button`
    margin: 10px;
`

interface UpgradeProps {
    upgrade: UpgradeModel
}

const Upgrade = (props: UpgradeProps): JSX.Element => {
    const { addStategy, upgrades, setUpgrades } = useSudoku()

    const purchaseUpgrade = (): void => {
        if (props.upgrade.strategy !== undefined) {
            addStategy(props.upgrade.strategy.id)
        }
        setUpgrades(upgrades.filter((upgrade) => upgrade.id !== props.upgrade.id))
    }

    return (
        <UgradeStyle>
            <Title>
                {props.upgrade.name}
            </Title>

            <Description>
                {props.upgrade.description}
            </Description>

            <Cost>
                Buy:
                <CostButton onClick={() => { purchaseUpgrade() }}>
                    {props.upgrade.cost}
                </CostButton>
            </Cost>
        </UgradeStyle>
    )
}

export default Upgrade
