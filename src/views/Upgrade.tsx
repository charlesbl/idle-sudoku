import styled from 'styled-components'
import { type UpgradeModel } from '../model/upgrades/upgrade'
import { useSudoku } from './hooks/sudoku.context'

const UpgradeStyle = styled.div<{ $locked: boolean }>`
    flex: 0 0 auto;
    overflow: hidden;
    border: 1px solid ${props => props.$locked ? 'rgb(255 255 255 / 7%)' : 'rgb(255 255 255 / 11%)'};
    border-radius: 8px;
    opacity: ${props => props.$locked ? 0.48 : 1};
    background:
        linear-gradient(180deg, rgb(255 255 255 / 7%), rgb(255 255 255 / 2.5%)),
        rgb(255 255 255 / 3.5%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 6%);
    transition:
        border-color 160ms ease,
        transform 160ms ease;

    &:hover {
        border-color: ${props => props.$locked ? 'rgb(255 255 255 / 7%)' : 'rgb(81 214 194 / 50%)'};
        transform: ${props => props.$locked ? 'none' : 'translateY(-1px)'};
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

    &:disabled {
        border-color: rgb(255 255 255 / 14%);
        color: #6f7684;
        background: rgb(255 255 255 / 8%);
        cursor: not-allowed;
    }

    &:disabled:hover {
        filter: none;
        transform: none;
    }
`

interface UpgradeProps {
    locked: boolean
    upgrade?: UpgradeModel
    name?: string
    description?: string
    cost?: number
    onPurchase?: () => void
}

const Upgrade = (props: UpgradeProps): JSX.Element => {
    const { money, purchaseUpgrade } = useSudoku()
    const name = props.upgrade?.name ?? props.name ?? ''
    const description = props.upgrade?.description ?? props.description ?? ''
    const cost = props.upgrade?.cost ?? props.cost ?? 0
    const unaffordable = money < cost
    const disabled = props.locked || unaffordable
    const title = props.locked
        ? 'Finish the previous category first'
        : unaffordable ? 'Not enough credits' : undefined

    const handlePurchase = (): void => {
        if (disabled) return
        if (props.onPurchase !== undefined) {
            props.onPurchase()
            return
        }
        if (props.upgrade !== undefined) {
            purchaseUpgrade(props.upgrade)
        }
    }

    return (
        <UpgradeStyle $locked={props.locked}>
            <Title>
                {name}
            </Title>

            <Description>
                {description}
            </Description>

            <Cost>
                Buy

                <CostButton
                    disabled={disabled}
                    onClick={handlePurchase}
                    title={title}
                >
                    {cost}
                </CostButton>
            </Cost>
        </UpgradeStyle>
    )
}

export default Upgrade
