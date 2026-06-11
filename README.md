# 🧩 Idle Sudoku

An incremental, automation-focused Sudoku game built with React, Vite, and Styled Components. Upgrade your solvers, automate the logic, prestige to unlock higher difficulties, and build the ultimate self-solving Sudoku machine!

🎮 **Play it live here:** [https://charlesbl.github.io/idle-sudoku/](https://charlesbl.github.io/idle-sudoku/)

---

## 🚀 Game Features

*   **Sudoku Automation:** Unlock incremental solvers that auto-fill drafts, clean up invalid pencil marks, and scan rows, columns, and blocks for solutions.
*   **Solver Queueing:** Queue multiple solvers to run sequentially, and eventually automate the entire queue loop.
*   **Prestige System:** Reach the credit milestone to prestige and earn **Prestige Points (PP)**. Reset your grid speeds and basic upgrades to advance to harder Sudoku difficulty tiers.
*   **Super Prestige & Permanent Upgrades:** Spend Prestige Points to unlock permanent solvers, automatic cleanup helpers, permanent speed multipliers, and even Auto-Prestige.
*   **Clean, Modern UI:** High-contrast grid visualizer showing live solver steps, queue timers, and styled upgrade panels.

---

## 🛠️ Local Development

This project uses `pnpm` for package management.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Setup and Running

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

2.  **Start Development Server:**
    ```bash
    pnpm dev
    ```
    This launches the local Vite development server (usually at `http://localhost:5173`).

3.  **Build for Production:**
    ```bash
    pnpm build
    ```

4.  **Lint Code:**
    ```bash
    pnpm lint:ts
    pnpm lint:css
    ```

---

## 🧪 Cheats & Testing Commands

To help with testing and development, you can open your browser developer console (`F12`) and run these global commands:

*   `giveCredits(amount)`: Adds the specified number of standard credits/money.
*   `givePoints(amount)`: Adds the specified number of Prestige Points (PP).
*   `cheatSolve()`: Instantly solves the current Sudoku board (internal context method).

---

## 📂 Project Structure

```text
idle-sudoku/
├── scripts/              # Simulation scripts for balancing solvers
├── src/
│   ├── model/            # Core models, difficulties, solvers, & upgrade definitions
│   │   ├── solvers/      # Sudoku solver algorithms (single drafts, cleanup, solution assist)
│   │   ├── upgrades/     # Speed, unlock, and permanent upgrade definitions
│   │   └── drafts.ts     # Draft (pencil mark) generation logic
│   ├── utils/            # Helper functions
│   └── views/            # Styled components and React views
│       ├── hooks/        # Context providers, solver engines, and currency states
│       ├── App.tsx       # Main page container and dashboard layout
│       └── Upgrades.tsx  # Upgrades UI panel (basic and permanent tabs)
└── index.html            # App entry page
```

---

*Enjoy automating Sudoku! If you find any issues or have feedback, feel free to open a PR or raise an issue.*
