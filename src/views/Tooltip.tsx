import styled from 'styled-components'

export const Tooltip = styled.span`
    position: absolute;
    bottom: calc(100% + 0.55rem);
    left: 50%;
    transform: translate(-50%, 0.2rem);
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid rgb(255 255 255 / 16%);
    border-radius: 8px;
    color: var(--text-strong);
    font-size: 0.78rem;
    font-weight: 750;
    line-height: 1;
    white-space: nowrap;
    background: rgb(7 10 14 / 96%);
    box-shadow: 0 12px 32px rgb(0 0 0 / 36%);
    opacity: 0;
    pointer-events: none;
    transition:
        opacity 140ms ease,
        visibility 140ms ease,
        transform 140ms ease;
    visibility: hidden;

    &[data-align="right"] {
        left: auto;
        right: 0;
        transform: translate(0, 0.2rem);
    }

    &[data-align="left"] {
        left: 0;
        transform: translate(0, 0.2rem);
    }

    kbd {
        min-width: 1.6rem;
        padding: 0.18rem 0.35rem;
        border: 1px solid rgb(255 255 255 / 24%);
        border-radius: 5px;
        color: var(--accent-strong);
        font: inherit;
        font-size: 0.72rem;
        font-weight: 900;
        background: rgb(255 255 255 / 8%);
        box-shadow: inset 0 -1px 0 rgb(0 0 0 / 35%);
    }
`

export const TooltipAnchor = styled.div<{ $flex?: boolean }>`
    position: relative;
    display: ${props => props.$flex ? 'flex' : 'inline-flex'};
    ${props => props.$flex && 'flex: 1; min-width: 0;'}

    &:hover ${Tooltip},
    &:focus-within ${Tooltip} {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, 0);

        &[data-align="right"] {
            transform: translate(0, 0);
        }

        &[data-align="left"] {
            transform: translate(0, 0);
        }
    }
`
