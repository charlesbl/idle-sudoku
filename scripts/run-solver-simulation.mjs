import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: {
    middlewareMode: true
  }
})

try {
  const simulationModule = await server.ssrLoadModule('/src/model/solvers/solverSimulation.ts')
  const result = simulationModule.runSolverSimulation()

  console.log(`Checked ${result.checkedPuzzles} generated puzzles.`)

  if (result.failures.length > 0) {
    console.error('Solver simulation failures:')
    result.failures.forEach((failure) => {
      console.error(`- ${failure.difficulty} #${failure.puzzleIndex + 1}: ${failure.filledCells}/81 filled`)
    })
    process.exitCode = 1
  } else {
    console.log('All simulated puzzles were solved.')
  }
} finally {
  await server.close()
}
