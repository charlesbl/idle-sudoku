import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import SudokuGrid from './SudokuGrid'
import Upgrades from './Upgrades'
import { useSudoku } from './hooks/sudoku.context'
import { Tooltip, TooltipAnchor } from './Tooltip'
import { cloneSudoku } from '../model/sudoku.model'
import {
    getSolverSpeedDescription,
    getSolverSpeedLevel as getSolverSpeedLevelDetails
} from '../model/solvers/solverSpeed'
import { formatPuzzleTransitionDelay } from '../model/puzzleTransition'
import { formatNumber } from '../utils/utils'
import { getDifficultyTier } from '../model/difficulty'

// TODO add in right panel a button for each solver to activate it and pass only once, queue solvers if the first one is not finished.
// TODO add selector for difficulty. more difficult = more money.
// TODO prevent buying solver that has been removed by an upgrade.

const AppStyle = styled.div`
    --panel-bg: rgb(14 18 24 / 84%);
    --panel-border: rgb(255 255 255 / 12%);
    --text-muted: #9aa5b6;
    --text-strong: #f8fafc;
    --accent: #51d6c2;
    --accent-strong: #7cf7dc;
    --gold: #f4c95d;

    display: flex;
    align-items: stretch;
    flex-direction: row;
    justify-content: center;
    gap: clamp(1rem, 2vw, 2rem);
    box-sizing: border-box;
    width: 100%;
    min-height: 100vh;
    padding: clamp(1rem, 2vw, 2rem);
    color: var(--text-strong);
    font-family: Inter, "Segoe UI", Roboto, sans-serif;
    background:
        linear-gradient(135deg, rgb(12 17 24 / 92%), rgb(7 10 14 / 98%)),
        repeating-linear-gradient(
            90deg,
            rgb(255 255 255 / 3.5%) 0,
            rgb(255 255 255 / 3.5%) 1px,
            transparent 1px,
            transparent 48px
        ),
        repeating-linear-gradient(
            0deg,
            rgb(255 255 255 / 2.8%) 0,
            rgb(255 255 255 / 2.8%) 1px,
            transparent 1px,
            transparent 48px
        );

    @media (width <= 1100px) {
        flex-wrap: wrap;
        align-content: flex-start;
        overflow: hidden auto;
    }
`

const SudokuLayout = styled.main`
    display: flex;
    flex: 0 1 min(72vmin, 680px);
    align-items: center;
    flex-direction: column;
    justify-content: center;
    width: min(100%, 620px);
    min-width: min(100%, 440px);
    text-align: center;

    @media (width <= 1100px) {
        order: 1;
        flex: 1 1 100%;
        min-width: 0;
    }
`

const Infos = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    width: min(100%, 620px);
    margin-bottom: 1rem;

    @media (width <= 620px) {
        grid-template-columns: 1fr;
        width: 100%;
        max-width: 310px;
    }
`

const InfoCard = styled.div`
    min-width: 0;
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: rgb(255 255 255 / 5.5%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
`

const InfoLabel = styled.div`
    margin-bottom: 0.25rem;
    color: var(--text-muted);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
`

const InfoValue = styled.div<{ $accent?: boolean }>`
    color: ${props => props.$accent === true ? 'var(--accent-strong)' : 'var(--text-strong)'};
    font-size: 1.35rem;
    font-weight: 800;

    @media (width <= 620px) {
        font-size: 1.1rem;
    }
`

const GoalValue = styled(InfoValue)`
    font-size: 1.05rem;

    @media (width <= 620px) {
        font-size: 0.95rem;
    }
`

const PrestigeGoalCard = styled.div`
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: rgb(255 255 255 / 5.5%);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
`

const PrestigeGoalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
`

const ProgressBarContainer = styled.div`
    position: relative;
    width: 100%;
    height: 0.8rem;
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 14%);
    border-radius: 999px;
    overflow: hidden;
`

const ProgressBarFill = styled.div<{ $progress: number; $canPrestige: boolean }>`
    width: ${props => props.$progress}%;
    height: 100%;
    border-radius: inherit;
    background: ${props =>
        props.$canPrestige
            ? 'linear-gradient(90deg, var(--accent) 0%, var(--gold) 100%)'
            : 'linear-gradient(90deg, #3b82f6 0%, var(--accent) 100%)'};
    box-shadow: ${props =>
        props.$canPrestige
            ? '0 0 10px var(--accent-strong)'
            : 'none'};
    transition: width 300ms ease-out, background 300ms ease-out;
`

const PrestigeSubtext = styled.div`
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--text-muted);
    margin-top: 0.15rem;
`

const DraftStatus = styled.span<{ $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: ${props => props.$active ? 'var(--accent-strong)' : 'var(--text-muted)'};

    &::before {
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 999px;
        background: ${props => props.$active ? 'var(--accent)' : 'rgb(255 255 255 / 0.28)'};
        box-shadow: ${props => props.$active ? '0 0 16px rgb(81 214 194 / 0.7)' : 'none'};
        content: "";
    }
`

const solvedSweep = keyframes`
    from {
        transform: scaleX(0);
    }

    to {
        transform: scaleX(1);
    }
`

const solvedPulse = keyframes`
    0%,
    100% {
        opacity: 0.66;
        transform: scale(0.98);
    }

    50% {
        opacity: 1;
        transform: scale(1);
    }
`

const autoQueueCircleClose = keyframes`
    from {
        stroke-dashoffset: 75.4;
    }

    to {
        stroke-dashoffset: 0;
    }
`

const BoardShell = styled.div`
    position: relative;
    box-sizing: border-box;
    width: min(100%, 620px);
    padding: clamp(0.55rem, 1vw, 0.85rem);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background:
        linear-gradient(180deg, rgb(255 255 255 / 8%), rgb(255 255 255 / 2.5%)),
        var(--panel-bg);
    box-shadow:
        0 24px 70px rgb(0 0 0 / 38%),
        inset 0 1px 0 rgb(255 255 255 / 8%);
    overflow: hidden;

    @media (width <= 620px) {
        width: 100%;
        max-width: 310px;
        padding: 0.45rem;
    }
`

const SolvedOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1.25rem;
    background:
        linear-gradient(180deg, rgb(7 10 14 / 60%), rgb(7 10 14 / 84%)),
        rgb(81 214 194 / 8%);
    pointer-events: none;
`

const SolvedOverlayPanel = styled.div`
    display: grid;
    gap: 0.85rem;
    width: min(78%, 22rem);
    padding: 1rem;
    border: 1px solid rgb(124 247 220 / 34%);
    border-radius: 8px;
    background: rgb(7 10 14 / 82%);
    box-shadow:
        0 18px 48px rgb(0 0 0 / 34%),
        inset 0 1px 0 rgb(255 255 255 / 10%);
`

const SolvedTitle = styled.div`
    color: var(--accent-strong);
    font-size: 1.45rem;
    font-weight: 900;
    animation: ${solvedPulse} 900ms ease-in-out infinite;
`

const SolvedProgress = styled.div<{ $durationMs: number }>`
    overflow: hidden;
    height: 0.55rem;
    border: 1px solid rgb(255 255 255 / 14%);
    border-radius: 999px;
    background: rgb(255 255 255 / 8%);

    &::after {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--accent), var(--gold));
        content: "";
        transform: scaleX(0);
        transform-origin: left;
        animation: ${solvedSweep} ${props => Math.max(props.$durationMs, 90)}ms linear forwards;
    }
`

const SolvedMeta = styled.div`
    color: var(--text-muted);
    font-size: 0.82rem;
    font-weight: 800;
`

const LoadingState = styled.div`
    display: grid;
    aspect-ratio: 1;
    place-items: center;
    color: var(--text-muted);
    font-size: 2.5rem;
    font-weight: 800;

    @media (width <= 620px) {
        font-size: 1.4rem;
    }
`

const ActionBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    width: min(100%, 620px);
    margin-top: 1rem;

    @media (width <= 620px) {
        width: 100%;
        max-width: 310px;
    }
`



const ActionButton = styled.button<{ $active?: boolean; $danger?: boolean }>`
    min-height: 2.5rem;
    padding: 0 1rem;
    border: 1px solid ${props => 
        props.$active === true 
            ? 'rgb(81 214 194 / 70%)' 
            : props.$danger === true
                ? 'rgb(239 68 68 / 70%)'
                : 'rgb(255 255 255 / 12%)'
    };
    border-radius: 8px;
    color: ${props => props.$danger === true ? '#fee2e2' : 'var(--text-strong)'};
    font: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    background: ${props => 
        props.$active === true
            ? 'linear-gradient(180deg, rgb(81 214 194 / 28%), rgb(81 214 194 / 12%))'
            : props.$danger === true
                ? 'linear-gradient(180deg, rgb(239 68 68 / 28%), rgb(239 68 68 / 12%))'
                : 'linear-gradient(180deg, rgb(255 255 255 / 14%), rgb(255 255 255 / 5.5%))'
    };
    box-shadow: ${props => 
        props.$active === true 
            ? 'inset 0 1px 0 rgb(255 255 255 / 10%), 0 0 18px rgb(81 214 194 / 18%)' 
            : props.$danger === true
                ? 'inset 0 1px 0 rgb(255 255 255 / 10%), 0 0 18px rgb(239 68 68 / 18%)'
                : 'none'
    };
    cursor: pointer;
    transition:
        border-color 160ms ease,
        box-shadow 160ms ease,
        background 160ms ease,
        transform 160ms ease;

    &:focus-visible {
        outline: 2px solid ${props => props.$danger === true ? '#f87171' : 'var(--accent-strong)'};
        outline-offset: 2px;
    }

    &:disabled {
        color: var(--text-muted);
        cursor: not-allowed;
        opacity: 0.5;
        transform: none;
    }

    &:hover:not(:disabled) {
        border-color: ${props => props.$danger === true ? 'rgb(239 68 68 / 80%)' : 'rgb(81 214 194 / 80%)'};
        background: ${props => 
            props.$danger === true
                ? 'linear-gradient(180deg, rgb(239 68 68 / 25%), rgb(239 68 68 / 12%))'
                : 'linear-gradient(180deg, rgb(81 214 194 / 25%), rgb(81 214 194 / 12%))'
        };
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
`

const SolverPanel = styled.aside`
    display: flex;
    flex: 0 1 260px;
    align-self: center;
    flex-direction: column;
    min-width: 220px;
    max-height: 70vh;
    padding: 1rem;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: var(--panel-bg);
    box-shadow: 0 18px 50px rgb(0 0 0 / 28%);
    overflow: hidden;

    @media (width <= 1100px) {
        order: 3;
        flex: 1 1 100%;
        align-self: auto;
        width: 100%;
        min-width: 0;
        max-height: none;
    }

    @media (width <= 620px) {
        max-width: 310px;
    }
`

const SolverSection = styled.section<{ $grow?: boolean }>`
    display: flex;
    flex: ${props => props.$grow === true ? '1 1 auto' : '0 0 auto'};
    flex-direction: column;
    min-height: 0;

    & + & {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgb(255 255 255 / 10%);
    }
`

const SolverTitle = styled.div`
    margin-bottom: 0.9rem;
    color: var(--text-muted);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0;
    text-transform: uppercase;
`

const QueueHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    margin-bottom: 0.9rem;
`

const QueueTitle = styled(SolverTitle)`
    margin-bottom: 0;
`

const QueueControls = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
`

const QueueAutoButton = styled.button<{ $active: boolean }>`
    min-height: 2rem;
    padding: 0 0.65rem;
    border: 1px solid ${props => props.$active ? 'rgb(81 214 194 / 62%)' : 'rgb(255 255 255 / 14%)'};
    border-radius: 8px;
    color: ${props => props.$active ? 'var(--accent-strong)' : 'var(--text-muted)'};
    font: inherit;
    font-size: 0.78rem;
    font-weight: 900;
    background: ${props => props.$active ? 'rgb(81 214 194 / 13%)' : 'rgb(255 255 255 / 6%)'};
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background 160ms ease,
        color 160ms ease;

    &:focus-visible {
        outline: 2px solid var(--accent-strong);
        outline-offset: 2px;
    }

    &:hover {
        border-color: rgb(81 214 194 / 78%);
        color: var(--accent-strong);
        background: rgb(81 214 194 / 12%);
    }
`

const AutoQueueCooldownCircle = styled.svg<{ $active: boolean, $durationMs: number }>`
    flex: 0 0 auto;
    width: 1.8rem;
    height: 1.8rem;
    transform: rotate(-90deg);

    circle {
        stroke-width: 3;
    }

    .track {
        stroke: rgb(255 255 255 / 12%);
    }

    .progress {
        stroke: ${props => props.$active ? 'var(--accent-strong)' : 'rgb(255 255 255 / 20%)'};
        stroke-dasharray: 75.4;
        stroke-dashoffset: ${props => props.$active ? 75.4 : 0};
        stroke-linecap: round;
        animation: ${props => props.$active ? autoQueueCircleClose : 'none'} ${props => Math.max(props.$durationMs, 90)}ms linear forwards;
    }
`

const SolverList = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.5rem;
    overflow: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`

const SolverRow = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;

    &::before {
        width: 0.35rem;
        height: 1.8rem;
        border-radius: 999px;
        background: ${props => props.$active ? 'var(--gold)' : 'rgb(255 255 255 / 0.12)'};
        content: "";
    }
`

const SolverButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    gap: 0.5rem;
    min-height: 2.85rem;
    min-width: 0;
    padding: 0 0.75rem;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 8px;
    color: var(--text-strong);
    font: inherit;
    font-size: 0.9rem;
    font-weight: 750;
    text-align: left;
    background: rgb(255 255 255 / 5.5%);
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background 160ms ease;

    &:disabled {
        color: var(--text-muted);
        cursor: not-allowed;
        opacity: 0.72;
    }

    &:hover:not(:disabled) {
        border-color: rgb(244 201 93 / 65%);
        background: rgb(244 201 93 / 12%);
    }
`

const SolverButtonText = styled.span`
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.12rem;
    min-width: 0;
`

const SolverName = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const SolverSpeed = styled.span`
    overflow: hidden;
    color: var(--text-muted);
    font-size: 0.72rem;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const AutoSolverToggle = styled.button<{ $active: boolean }>`
    position: relative;
    flex: 0 0 auto;
    width: 2.45rem;
    height: 1.35rem;
    padding: 0;
    border: 1px solid ${props => props.$active ? 'rgb(81 214 194 / 70%)' : 'rgb(255 255 255 / 18%)'};
    border-radius: 999px;
    background: ${props => props.$active ? 'rgb(81 214 194 / 24%)' : 'rgb(255 255 255 / 7%)'};
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background 160ms ease;

    &::after {
        position: absolute;
        top: 50%;
        left: 0.16rem;
        width: 0.9rem;
        height: 0.9rem;
        border-radius: 999px;
        background: ${props => props.$active ? 'var(--accent-strong)' : 'rgb(255 255 255 / 44%)'};
        box-shadow: 0 2px 8px rgb(0 0 0 / 28%);
        content: "";
        transform: translate(${props => props.$active ? '1.05rem' : '0'}, -50%);
        transition:
            background 160ms ease,
            transform 160ms ease;
    }

    &:focus-visible {
        outline: 2px solid var(--accent-strong);
        outline-offset: 2px;
    }

    &:hover {
        border-color: rgb(81 214 194 / 78%);
    }
`

const SolverQueueBadge = styled.span`
    display: inline-grid;
    flex: 0 0 auto;
    min-width: 1.35rem;
    height: 1.35rem;
    place-items: center;
    border: 1px solid rgb(81 214 194 / 35%);
    border-radius: 999px;
    color: var(--accent-strong);
    font-size: 0.72rem;
    font-weight: 900;
    background: rgb(81 214 194 / 13%);
`

const QueueList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    height: 13rem;
    overflow: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`

const QueuedSolverRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 2rem;
    padding: 0 0.65rem;
    border: 1px solid rgb(81 214 194 / 16%);
    border-radius: 8px;
    color: var(--text-strong);
    font-size: 0.86rem;
    font-weight: 750;
    background: rgb(81 214 194 / 8%);
`

const QueuePosition = styled.span`
    display: inline-grid;
    flex: 0 0 auto;
    width: 1.25rem;
    height: 1.25rem;
    place-items: center;
    border-radius: 999px;
    color: rgb(7 10 14);
    font-size: 0.7rem;
    font-weight: 900;
    background: var(--accent-strong);
`

const QueueSolverName = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const EmptyState = styled.div`
    color: var(--text-muted);
    font-size: 0.92rem;
`

const DifficultyCard = styled(InfoCard)`
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.9rem 0.6rem;
`

const DifficultySelector = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.15rem;
    gap: 0.5rem;
`

const DifficultyArrowButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 1.65rem;
    height: 1.65rem;
    padding: 0;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 6px;
    background: rgb(255 255 255 / 4.5%);
    color: var(--text-strong);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 120ms ease;

    &:disabled {
        opacity: 0.2;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        border-color: rgb(81 214 194 / 60%);
        background: rgb(81 214 194 / 10%);
        color: var(--accent-strong);
    }
`

const DifficultyInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
`

const DifficultyValue = styled.div`
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-strong);
    width: 100%;
    text-align: center;

    @media (width <= 620px) {
        font-size: 1rem;
    }
`

const DifficultyMultiplier = styled.div`
    font-size: 0.78rem;
    font-weight: 900;
    color: var(--accent-strong);
    margin-top: 0.05rem;
`

const DifficultySubtext = styled.div`
    font-size: 0.65rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin-top: 0.4rem;
    text-align: center;
    width: 100%;
`

const App = (): JSX.Element => {
    const [confirmClear, setConfirmClear] = useState(false)
    const {
        sudoku,
        setSudoku,
        solution,
        draftMode,
        setDraftMode,
        selectedTile,
        setSelectedTile,
        solvers,
        autoSolvers,
        currentSolver,
        solverQueue,
        reset,
        money,
        difficultyTier,
        prestigeLevel,
        prestigePoints,
        prestigeGoal,
        selectedDifficultyIndex,
        changeDifficulty,
        prestigeReward,
        manualVeryEasySolvedCount,
        manualVeryEasySolvedGoal,
        manualOpeningComplete,
        canPrestige,
        prestige,
        draftHelpers,
        setCurrentSolver,
        queueSolver,
        runSolverManually,
        setAutoSolverActive,
        getSolverSpeedLevel,
        hasUpgradeFeature,
        isSolved,
        puzzleTransitionDelayMs,
        autoSolverQueueEnabled,
        autoSolverCooldownUntil,
        autoQueueCooldownDelayMs,
        setAutoSolverQueueEnabled,
        autoPrestigeUnlocked,
        autoPrestigeEnabled,
        setAutoPrestigeEnabled
    } = useSudoku()
    const canQueueSolvers = hasUpgradeFeature('solverQueue') || hasUpgradeFeature('autoSolverQueue')
    const hasAutoQueueUpgrade = hasUpgradeFeature('autoSolverQueue')
    const autoQueueSolvers = hasAutoQueueUpgrade && autoSolverQueueEnabled
    const autoSolverIdSet = new Set(autoSolvers.map(solver => solver.id))
    const puzzleTransitionDelay = formatPuzzleTransitionDelay(puzzleTransitionDelayMs)
    const nextGridLabel = `Next grid in ${puzzleTransitionDelay}`
    const showAutoQueueCooldownCircle = autoQueueCooldownDelayMs > 0
    const autoQueueCooldownActive = autoSolverCooldownUntil !== undefined &&
        autoSolverQueueEnabled &&
        autoSolverCooldownUntil > Date.now()
    const autoQueueCooldownDurationMs = autoQueueCooldownActive
        ? autoSolverCooldownUntil - Date.now()
        : autoQueueCooldownDelayMs
    const autoQueueLabel = `Auto queue: ${autoSolverQueueEnabled ? 'On' : 'Off'}`
    const prestigeProgress = prestigeGoal > 0 ? Math.min((money / prestigeGoal) * 100, 100) : 0

    const handleChangeDraftMode = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== ' ' && e.key !== '0') return
        if (e.key === ' ' && e.target instanceof HTMLButtonElement) return
        e.preventDefault()
        setDraftMode(current => !current)
    }

    const handleSelectedTileDisplacement = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (selectedTile === undefined) return
        if (!e.key.includes('Arrow')) return
        let newX = selectedTile % 9 + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)
        let newY = Math.floor(selectedTile / 9) + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)
        if (newX < 0) newX = 8
        if (newX > 8) newX = 0
        if (newY < 0) newY = 8
        if (newY > 8) newY = 0
        setSelectedTile(newX + newY * 9)
    }

    const handleChangeTileValue = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        const parsedKey = parseInt(e.key)
        if (isNaN(parsedKey) || parsedKey <= 0 || parsedKey > 9) return
        if (draftMode) {
            changeTileDraftMode(parsedKey)
        } else {
            changeTileNormalMode(parsedKey)
        }
    }

    const changeTileDraftMode = (value: number): void => {
        if (sudoku === undefined || selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = cloneSudoku(sudoku)
        newSudoku[selectedTile].draftNumbers[value - 1] = !newSudoku[selectedTile].draftNumbers[value - 1]
        newSudoku[selectedTile].value = undefined
        setSudoku(newSudoku)
    }

    const changeTileNormalMode = (value: number): void => {
        if (sudoku === undefined || selectedTile === undefined || sudoku[selectedTile].fixed) return
        const newSudoku = cloneSudoku(sudoku)
        if (newSudoku[selectedTile].value === value) {
            newSudoku[selectedTile].value = undefined
            setSudoku(newSudoku)
            return
        }

        newSudoku[selectedTile].value = value
        newSudoku[selectedTile].error = false

        if (solution !== undefined && value === solution[selectedTile]) {
            draftHelpers.forEach((helper) => {
                helper.help(newSudoku, selectedTile)
            })
        }

        setSudoku(newSudoku)
    }

    const handleBatchDraftChange = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (selectedTile === undefined || sudoku === undefined) return
        if (e.key === 'r') {
            const newSudoku = cloneSudoku(sudoku)
            const wipe = newSudoku[selectedTile].draftNumbers.every((draft) => draft)
            newSudoku[selectedTile].draftNumbers = Array(9).fill(!wipe)
            setSudoku(newSudoku)
        }
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        handleChangeDraftMode(e)
        handleSelectedTileDisplacement(e)
        handleChangeTileValue(e)
        handleBatchDraftChange(e)
    }

    return (
        <AppStyle
            onClick={() => { setSelectedTile(undefined) }}
            onKeyDown={handleOnKeyDown}
            tabIndex={0}
        >
            <Upgrades />

            <SudokuLayout>
                <Infos>
                    <InfoCard>
                        <InfoLabel>Credits</InfoLabel>

                        <InfoValue $accent>
                            {formatNumber(money)}

                            &euro;
                        </InfoValue>
                    </InfoCard>

                    <DifficultyCard>
                        <InfoLabel>Difficulty</InfoLabel>

                        <DifficultySelector>
                            <DifficultyArrowButton
                                disabled={selectedDifficultyIndex <= 0}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    changeDifficulty(selectedDifficultyIndex - 1)
                                }}
                                title="Previous difficulty"
                            >
                                ◀
                            </DifficultyArrowButton>
                            
                            <DifficultyInfo>
                                <DifficultyValue>
                                    {difficultyTier.label}
                                </DifficultyValue>

                                <DifficultyMultiplier>
                                    x
{formatNumber(difficultyTier.rewardMultiplier)}
                                </DifficultyMultiplier>
                            </DifficultyInfo>

                            <DifficultyArrowButton
                                disabled={selectedDifficultyIndex >= prestigeLevel}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    changeDifficulty(selectedDifficultyIndex + 1)
                                }}
                                title={selectedDifficultyIndex >= prestigeLevel ? `Unlock prestige to play harder grids` : "Next difficulty"}
                            >
                                {selectedDifficultyIndex >= prestigeLevel ? '🔒' : '▶'}
                            </DifficultyArrowButton>
                        </DifficultySelector>
                        
                        <DifficultySubtext>
                            {selectedDifficultyIndex < prestigeLevel ? (
                                `Next: ${getDifficultyTier(selectedDifficultyIndex + 1).label} (x${formatNumber(getDifficultyTier(selectedDifficultyIndex + 1).rewardMultiplier)})`
                            ) : (
                                `Next: ${getDifficultyTier(prestigeLevel + 1).label} (x${formatNumber(getDifficultyTier(prestigeLevel + 1).rewardMultiplier)}) at Prestige ${prestigeLevel + 1}`
                            )}
                        </DifficultySubtext>
                    </DifficultyCard>

                    <InfoCard>
                        <InfoLabel>Prestige</InfoLabel>

                        <InfoValue $accent={prestigePoints > 0}>
                            {`Level ${prestigeLevel}`}
                        </InfoValue>

                        <PrestigeSubtext>
                            {`${formatNumber(prestigePoints)} PP${autoPrestigeUnlocked && autoPrestigeEnabled ? ' (Auto)' : ''}`}
                        </PrestigeSubtext>
                    </InfoCard>

                    <InfoCard>
                        <InfoLabel>Drafts</InfoLabel>

                        <InfoValue>
                            <DraftStatus $active={draftMode}>
                                {draftMode ? 'active' : 'inactive'}
                            </DraftStatus>
                        </InfoValue>
                    </InfoCard>

                    {!manualOpeningComplete && (
                        <InfoCard>
                            <InfoLabel>Manual start</InfoLabel>

                            <InfoValue>
                                {`${manualVeryEasySolvedCount}/${manualVeryEasySolvedGoal}`}
                            </InfoValue>
                        </InfoCard>
                    )}

                    <PrestigeGoalCard>
                        <PrestigeGoalHeader>
                            <InfoLabel style={{ marginBottom: 0 }}>Prestige Goal</InfoLabel>

                            <GoalValue $accent={canPrestige}>
                                {`${formatNumber(money)} / ${formatNumber(prestigeGoal)} € (${prestigeProgress.toFixed(0)}%)`}
                            </GoalValue>
                        </PrestigeGoalHeader>

                        <ProgressBarContainer>
                            <ProgressBarFill
                                $canPrestige={canPrestige}
                                $progress={prestigeProgress}
                            />
                        </ProgressBarContainer>
                    </PrestigeGoalCard>
                </Infos>

                <BoardShell>
                    {sudoku === undefined
                        ? <LoadingState>Preparing...</LoadingState>
                        : (
                            <SudokuGrid />
                        )}

                    {isSolved && (
                        <SolvedOverlay>
                            <SolvedOverlayPanel>
                                <SolvedTitle>Solved</SolvedTitle>

                                <SolvedProgress $durationMs={puzzleTransitionDelayMs} />

                                <SolvedMeta>
                                    {nextGridLabel}
                                </SolvedMeta>
                            </SolvedOverlayPanel>
                        </SolvedOverlay>
                    )}
                </BoardShell>

                <ActionBar>
                    <TooltipAnchor>
                        <ActionButton
                            $active={draftMode}
                            aria-describedby="draft-mode-shortcut"
                            aria-pressed={draftMode}
                            onClick={(e) => {
                                e.stopPropagation()
                                setDraftMode(current => !current)
                            }}
                        >
                            Draft mode:

                            {draftMode ? 'On' : 'Off'}
                        </ActionButton>

                        <Tooltip
                            id="draft-mode-shortcut"
                            role="tooltip"
                        >
                            Keyboard

                            <kbd>Space</kbd>

                            <kbd>0</kbd>
                        </Tooltip>
                    </TooltipAnchor>

                    <TooltipAnchor>
                        <ActionButton onClick={() => {
                            reset()
                        }}
                        >
                            New puzzle
                        </ActionButton>

                        <Tooltip role="tooltip">
                            Generate a new Sudoku grid
                        </Tooltip>
                    </TooltipAnchor>

                    <TooltipAnchor>
                        <ActionButton
                            disabled={!canPrestige}
                            onClick={() => { prestige() }}
                        >
                            Prestige +

                            {formatNumber(prestigeReward)}

                            PP
                        </ActionButton>

                        <Tooltip role="tooltip">
                            {canPrestige
                                ? `Reset progress and earn ${formatNumber(prestigeReward)} PP`
                                : `Requires reaching ${formatNumber(prestigeGoal)} credits`}
                        </Tooltip>
                    </TooltipAnchor>

                    {autoPrestigeUnlocked && (
                        <TooltipAnchor>
                            <ActionButton
                                $active={autoPrestigeEnabled}
                                aria-pressed={autoPrestigeEnabled}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setAutoPrestigeEnabled(!autoPrestigeEnabled)
                                }}
                            >
                                Auto-prestige: 
{' '}

{autoPrestigeEnabled ? 'On' : 'Off'}
                            </ActionButton>

                            <Tooltip role="tooltip">
                                Automatically prestige when the prestige goal is reached
                            </Tooltip>
                        </TooltipAnchor>
                    )}

                    {confirmClear ? (
                        <>
                            <TooltipAnchor>
                                <ActionButton
                                    $danger
                                    onClick={() => {
                                        localStorage.clear()
                                        window.location.reload()
                                    }}
                                >
                                    Confirm clear
                                </ActionButton>

                                <Tooltip role="tooltip">
                                    This will permanently delete all your progress!
                                </Tooltip>
                            </TooltipAnchor>

                            <ActionButton
                                onClick={() => {
                                    setConfirmClear(false)
                                }}
                            >
                                Cancel
                            </ActionButton>
                        </>
                    ) : (
                        <TooltipAnchor>
                            <ActionButton onClick={() => { setConfirmClear(true) }}>Clear progress</ActionButton>

                            <Tooltip role="tooltip">
                                Reset all credits, upgrades, and prestige points
                            </Tooltip>
                        </TooltipAnchor>
                    )}
                </ActionBar>
            </SudokuLayout>

            <SolverPanel>
                {canQueueSolvers && (
                    <SolverSection>
                        <QueueHeader>
                            <QueueTitle>
                                Queued solvers
                            </QueueTitle>

                            {hasAutoQueueUpgrade && (
                                <QueueControls>
                                    {showAutoQueueCooldownCircle && (
                                        <AutoQueueCooldownCircle
                                            $active={autoQueueCooldownActive}
                                            $durationMs={autoQueueCooldownDurationMs}
                                            aria-hidden="true"
                                            key={autoSolverCooldownUntil ?? 'auto-queue-idle'}
                                            viewBox="0 0 28 28"
                                        >
                                            <circle
                                                className="track"
                                                cx="14"
                                                cy="14"
                                                fill="none"
                                                r="12"
                                            />

                                            <circle
                                                className="progress"
                                                cx="14"
                                                cy="14"
                                                fill="none"
                                                r="12"
                                            />
                                        </AutoQueueCooldownCircle>
                                    )}

                                    <TooltipAnchor>
                                        <QueueAutoButton
                                            $active={autoSolverQueueEnabled}
                                            aria-pressed={autoSolverQueueEnabled}
                                            onClick={() => { setAutoSolverQueueEnabled(!autoSolverQueueEnabled) }}
                                            type="button"
                                        >
                                            {autoQueueLabel}
                                        </QueueAutoButton>

                                        <Tooltip
data-align="right"
role="tooltip"
                                        >
                                            Automatically add selected solvers to queue when idle
                                        </Tooltip>
                                    </TooltipAnchor>
                                </QueueControls>
                            )}
                        </QueueHeader>

                        <QueueList>
                            {solverQueue.length > 0
                                ? solverQueue.map((solver, index) => (
                                    <QueuedSolverRow key={`${solver.id}-${index}`}>
                                        <QueuePosition>
                                            {index + 1}
                                        </QueuePosition>

                                        <QueueSolverName>
                                            {solver.name}
                                        </QueueSolverName>
                                    </QueuedSolverRow>
                                ))
                                : (
                                    <EmptyState>
                                        {autoQueueSolvers && autoSolvers.length === 0
                                            ? 'No auto solvers active'
                                            : 'Queue empty'}
                                    </EmptyState>
                                )}
                        </QueueList>
                    </SolverSection>
                )}

                <SolverSection $grow>
                    <SolverTitle>
                        Unlocked solvers
                    </SolverTitle>

                    <SolverList>
                        {solvers.length > 0
                            ? solvers.map((solver) => {
                                const queuedCount = solverQueue.filter(queuedSolver => queuedSolver.id === solver.id).length
                                const autoSolverActive = autoSolverIdSet.has(solver.id)
                                const speedLevel = getSolverSpeedLevel(solver)
                                const speed = getSolverSpeedLevelDetails(speedLevel)
                                const speedDescription = `Lv ${speedLevel + 1} - ${speed.label} - ${getSolverSpeedDescription(speed)}`

                                return (
                                    <SolverRow
                                        $active={solver.id === currentSolver?.id}
                                        key={solver.id}
                                    >
                                        <TooltipAnchor $flex>
                                            <SolverButton
                                                disabled={!canQueueSolvers && currentSolver !== undefined}
                                                onClick={() => {
                                                    if (canQueueSolvers) {
                                                        if (autoQueueSolvers) {
                                                            runSolverManually(solver)
                                                            return
                                                        }
                                                        queueSolver(solver)
                                                        return
                                                    }
                                                    setCurrentSolver(solver)
                                                }}
                                            >
                                                <SolverButtonText>
                                                    <SolverName>{solver.name}</SolverName>

                                                    <SolverSpeed>
                                                        {speedDescription}
                                                    </SolverSpeed>
                                                </SolverButtonText>

                                                {queuedCount > 0 && (
                                                    <SolverQueueBadge>
                                                        {queuedCount}
                                                    </SolverQueueBadge>
                                                )}
                                            </SolverButton>

                                            <Tooltip role="tooltip">
                                                {canQueueSolvers
                                                    ? (autoQueueSolvers ? 'Run solver immediately' : 'Add solver to queue')
                                                    : 'Set as active solver'}
                                            </Tooltip>
                                        </TooltipAnchor>

                                        {hasAutoQueueUpgrade && (
                                            <TooltipAnchor>
                                                <AutoSolverToggle
                                                    $active={autoSolverActive}
                                                    aria-label={`${autoSolverActive ? 'Disable' : 'Enable'} ${solver.name} in auto queue`}
                                                    aria-pressed={autoSolverActive}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setAutoSolverActive(solver, !autoSolverActive)
                                                    }}
                                                    type="button"
                                                />

                                                <Tooltip
data-align="right"
role="tooltip"
                                                >
                                                    {autoSolverActive
                                                        ? 'Disable solver in auto queue'
                                                        : 'Enable solver in auto queue'}
                                                </Tooltip>
                                            </TooltipAnchor>
                                        )}
                                    </SolverRow>
                                )
                            })
                            : <EmptyState>No solvers unlocked</EmptyState>}
                    </SolverList>
                </SolverSection>
            </SolverPanel>
        </AppStyle>
    )
}

export default App
