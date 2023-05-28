import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './views/App.tsx'
import './index.css'
import { SudokuProvider } from './views/hooks/sudoku.context.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SudokuProvider>
            <App />
        </SudokuProvider>
    </React.StrictMode>
)
