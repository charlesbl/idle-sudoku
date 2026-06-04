import type React from 'react'
import styled from 'styled-components'
import { type UnlockUpgradeModel } from '../model/upgrades/unlockUpgrade'
import { useSudoku } from './hooks/sudoku.context'
import { Tooltip, TooltipAnchor } from './Tooltip'
import { formatNumber } from '../utils/utils'
import { getSolverTotalSpeedUpgradeSpent } from '../model/solvers/solverSpeed'

const UpgradeStyle = styled.div<{ $locked: boolean }>`
    flex: 0 0 auto;
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
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
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
    unlockUpgrade?: UnlockUpgradeModel
    name?: string
    description?: string
    cost?: number
    onPurchase?: (buyMax?: boolean) => void
    availableAmount?: number
    currencyLabel?: string
}

const Upgrade = (props: UpgradeProps): JSX.Element => {
    const { money, purchaseUnlockUpgrade, getSolverSpeedLevel } = useSudoku()
    const name = props.unlockUpgrade?.name ?? props.name ?? ''
    const description = props.unlockUpgrade?.description ?? props.description ?? ''
    const cost = props.unlockUpgrade?.cost ?? props.cost ?? 0
    const availableAmount = props.availableAmount ?? money
    const currencyLabel = props.currencyLabel ?? ''
    const unaffordable = availableAmount < cost
    const disabled = props.locked || unaffordable

    const unlockUpgrade = props.unlockUpgrade
    let refundAmount = 0
    if (unlockUpgrade?.solver?.replaces !== undefined) {
        refundAmount = unlockUpgrade.solver.replaces.reduce((sum, replacedSolver) => {
            const level = getSolverSpeedLevel(replacedSolver)
            return sum + getSolverTotalSpeedUpgradeSpent(level)
        }, 0)
    }

    const tooltipText = props.locked
        ? 'Finish the previous category first'
        : unaffordable
            ? (props.currencyLabel === 'PP' ? 'Not enough PP' : `Not enough credits${refundAmount > 0 ? ` (Refunds ${formatNumber(refundAmount)} credits)` : ''}`)
            : `Purchase upgrade${refundAmount > 0 ? ` (Refunds ${formatNumber(refundAmount)} credits)` : ''}`

    const handlePurchase = (event: React.MouseEvent<HTMLButtonElement>): void => {
        if (disabled) return
        const buyMax = event.shiftKey
        if (props.onPurchase !== undefined) {
            props.onPurchase(buyMax)
            return
        }
        if (props.unlockUpgrade !== undefined) {
            purchaseUnlockUpgrade(props.unlockUpgrade)
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

                {currencyLabel}

                <TooltipAnchor>
                    <CostButton
                        disabled={disabled}
                        onClick={handlePurchase}
                    >
                        {formatNumber(cost)}
                    </CostButton>

                    <Tooltip
                        data-align="right"
                        role="tooltip"
                    >
                        {tooltipText}
                    </Tooltip>
                </TooltipAnchor>
            </Cost>
        </UpgradeStyle>
    )
}

export default Upgrade
