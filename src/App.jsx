
import { useReducer } from 'react'
import './App.css'

const initialState = {
  board: ['', '', '', '', '', '', '', '', ''],
  currentPlayer: 'X',
  winner: '',
  isDraw: false,
  history: [['', '', '', '', '', '', '', '', '']],
  stepNumber: 0,
  xWins: 0,
  oWins: 0,
  draws: 0,
  roundScored: false,
}

// Check whether X or O has won
function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const line of lines) {
    const [a, b, c] = line

    if (
      board[a] !== '' &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return board[a]
    }
  }

  return ''
}

// Find the winning squares
function getWinningLine(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const line of lines) {
    const [a, b, c] = line

    if (
      board[a] !== '' &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return line
    }
  }

  return []
}

// Check whether the game is a draw
function checkDraw(board) {
  return board.every(square => square !== '') &&
    checkWinner(board) === ''
}

// Game reducer
function gameReducer(state, action) {
  if (action.type === 'MAKE_MOVE') {
    if (state.board[action.index] !== '') return state

    if (state.winner !== '' || state.isDraw === true) {
      return state
    }

    const newBoard = [...state.board]
    newBoard[action.index] = state.currentPlayer

    const newHistory = state.history.slice(0, state.stepNumber + 1)
    newHistory.push(newBoard)

    const theWinner = checkWinner(newBoard)
    const draw = checkDraw(newBoard)

    const nextPlayer = state.currentPlayer === 'X' ? 'O' : 'X'

    let newXWins = state.xWins
    let newOWins = state.oWins
    let newDraws = state.draws
    let scored = state.roundScored

    if (scored === false) {
      if (theWinner === 'X') {
        newXWins++
        scored = true
      } else if (theWinner === 'O') {
        newOWins++
        scored = true
      } else if (draw === true) {
        newDraws++
        scored = true
      }
    }

    return {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: theWinner,
      isDraw: draw,
      history: newHistory,
      stepNumber: state.stepNumber + 1,
      xWins: newXWins,
      oWins: newOWins,
      draws: newDraws,
      roundScored: scored,
    }
  }

  if (action.type === 'JUMP_TO') {
    const oldBoard = state.history[action.step]

    const player = action.step % 2 === 1 ? 'O' : 'X'

    return {
      ...state,
      board: oldBoard,
      stepNumber: action.step,
      currentPlayer: player,
      winner: checkWinner(oldBoard),
      isDraw: checkDraw(oldBoard),
    }
  }

  if (action.type === 'RESTART') {
    return {
      ...initialState,
      xWins: state.xWins,
      oWins: state.oWins,
      draws: state.draws,
    }
  }

  return state
}

// Main App component
function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const winLine = getWinningLine(state.board)

  function handleClick(index) {
    if (state.winner !== '' || state.isDraw === true) {
      alert('The game is over! Press Restart to play again.')
      return
    }

    if (state.board[index] !== '') {
      alert('That square is already taken!')
      return
    }

    dispatch({ type: 'MAKE_MOVE', index: index })
  }

  function getSquareClass(index) {
    let c = 'square'

    if (state.board[index] === 'X') c += ' x-square'
    if (state.board[index] === 'O') c += ' o-square'

    if (
      state.board[index] === '' &&
      state.winner === '' &&
      state.isDraw === false
    ) {
      c += ' empty'
    }

    if (winLine.includes(index)) c += ' winning'

    return c
  }

  let statusText = ''
  let statusColor = '#2c3e50'

  if (state.winner !== '') {
    statusText = 'Winner: ' + state.winner
    statusColor = 'green'
  } else if (state.isDraw === true) {
    statusText = 'Draw!'
    statusColor = '#e67e22'
  } else {
    statusText = 'Next Player: ' + state.currentPlayer
  }

  return (
    <div className="app">
      <h1 className="title">Tic Tac Toe</h1>

      <div className="scoreboard">
        <div className="score-box" style={{ borderTop: '4px solid #e74c3c' }}>
          <p className="score-label">X Wins</p>
          <p className="score-number">{state.xWins}</p>
        </div>

        <div className="score-box" style={{ borderTop: '4px solid #95a5a6' }}>
          <p className="score-label">Draws</p>
          <p className="score-number">{state.draws}</p>
        </div>

        <div className="score-box" style={{ borderTop: '4px solid #3498db' }}>
          <p className="score-label">O Wins</p>
          <p className="score-number">{state.oWins}</p>
        </div>
      </div>

      <h2 className="status" style={{ color: statusColor }}>
        {statusText}
      </h2>

      <div className="game-area">
        <div>
          <div className="board">
            {state.board.map((square, index) => (
              <button
                key={index}
                className={getSquareClass(index)}
                onClick={() => handleClick(index)}
              >
                {square}
              </button>
            ))}
          </div>

          <button
            className="restart-button"
            onClick={() => dispatch({ type: 'RESTART' })}
          >
            Restart
          </button>
        </div>

        <div className="history">
          <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>
            Move History
          </h3>

          <ol className="history-list">
            {state.history.map((b, step) => {
              const text = step === 0
                ? 'Go to game start'
                : 'Go to move #' + step

              return (
                <li key={step}>
                  <button
                    className={
                      step === state.stepNumber
                        ? 'history-button current'
                        : 'history-button'
                    }
                    onClick={() =>
                      dispatch({ type: 'JUMP_TO', step: step })
                    }
                  >
                    {text}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default App
