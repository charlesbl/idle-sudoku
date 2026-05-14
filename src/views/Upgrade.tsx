import styled from 'styled-components'
import { type UpgradeModel } from '../model/upgrades/upgrade'
import { useSudoku } from './hooks/sudoku.context'

const UpgradeStyle = styled.div`
    flex: 0 0 auto;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 11%);
    border-radius: 8px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 7%), rgb(255 255 255 / 2.5%)),
        rgb(255 255 255 / 3.5%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 6%);
    transition:
        border-color 160ms ease,
        transform 160ms ease;

    &:hover {
        border-color: rgb(81 214 194 / 50%);
        transform: translateY(-1px);
    }
`

const Title = styled.div`
    padding: 0.85rem 0.9rem 0.35rem;
    color: #f8fafc;
    font-size: 1.08rem;
    font-weight: bold;
    text-align: center;
`

const Description = styled.div`
    padding: 0 0.9rem 0.85rem;
    color: #cbd5e1;
    font-size: 0.92rem;
    line-height: 1.45;
`

const Cost = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.7rem 0.85rem;
    border-top: 1px solid rgb(255 255 255 / 9%);
    color: #9aa5b6;
    font-size: 0.9rem;
    font-weight: 800;
    background: rgb(0 0 0 / 14%);
`

const CostButton = styled.button`
    min-width: 2.4rem;
    min-height: 2rem;
    border: 1px solid rgb(244 201 93 / 45%);
    border-radius: 8px;
    color: #1b1405;
    font: inherit;
    font-weight: 900;
    background: linear-gradient(180deg, #f9df88, #f4c95d);
    cursor: pointer;
    transition:
        filter 160ms ease,
        transform 160ms ease;

    &:hover {
        filter: brightness(1.08);
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`

interface UpgradeProps {
    upgrade: UpgradeModel
}

const Upgrade = (props: UpgradeProps): JSX.Element => {
    const { purchaseUpgrade } = useSudoku()

    return (
        <UpgradeStyle>
            <Title>
                {props.upgrade.name}
            </Title>

            <Description>
                {props.upgrade.description}
            </Description>

            <Cost>
                Buy:

                <CostButton onClick={() => { purchaseUpgrade(props.upgrade) }}>
                    {props.upgrade.cost}
                </CostButton>
            </Cost>
        </UpgradeStyle>
    )
}

export default Upgrade
