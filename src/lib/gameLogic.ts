export type Player = 'X' | 'O';
export type Board = string[];

export interface GameState {
  board: Board;
  xMoves: number[];
  oMoves: number[];
  isXTurn: boolean;
  // Scores track per PLAYER (not per symbol).
  // Player 1 uses X in odd rounds, O in even rounds.
  // Player 2 uses O in odd rounds, X in even rounds.
  player1Score: number;
  player2Score: number;
  roundNumber: number;
  winner: Player | null;       // which SYMBOL won this round
  winningPlayer: 1 | 2 | null; // which PLAYER won (derived from symbol + round)
  winningLine: number[] | null;
  oldestPiece: number | null;
}

export const WINNING_PATTERNS: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * In ODD  rounds → Player 1 = X, Player 2 = O
 * In EVEN rounds → Player 1 = O, Player 2 = X
 */
export function getPlayer1Symbol(roundNumber: number): Player {
  return roundNumber % 2 !== 0 ? 'X' : 'O';
}

export function getPlayer2Symbol(roundNumber: number): Player {
  return roundNumber % 2 !== 0 ? 'O' : 'X';
}

/** Which player number owns a given symbol in the given round? */
export function symbolToPlayer(symbol: Player, roundNumber: number): 1 | 2 {
  return getPlayer1Symbol(roundNumber) === symbol ? 1 : 2;
}

export function checkWinner(moves: number[]): { winner: boolean; line: number[] | null } {
  if (moves.length < 3) return { winner: false, line: null };
  for (const pattern of WINNING_PATTERNS) {
    if (pattern.every((idx) => moves.includes(idx))) {
      return { winner: true, line: pattern };
    }
  }
  return { winner: false, line: null };
}

export function createInitialState(): GameState {
  return {
    board: Array(9).fill(''),
    xMoves: [],
    oMoves: [],
    isXTurn: true,
    player1Score: 0,
    player2Score: 0,
    roundNumber: 1,
    winner: null,
    winningPlayer: null,
    winningLine: null,
    oldestPiece: null,
  };
}

export function makeMove(state: GameState, cellIndex: number): GameState {
  if (state.board[cellIndex] !== '' || state.winner) return state;

  const currentPlayer: Player = state.isXTurn ? 'X' : 'O';
  const playerMoves = state.isXTurn ? [...state.xMoves] : [...state.oMoves];
  const newBoard = [...state.board];

  if (playerMoves.length >= 3) {
    const oldest = playerMoves.shift()!;
    newBoard[oldest] = '';
  }

  playerMoves.push(cellIndex);
  newBoard[cellIndex] = currentPlayer;

  const newXMoves = state.isXTurn ? playerMoves : state.xMoves;
  const newOMoves = state.isXTurn ? state.oMoves : playerMoves;

  const { winner: hasWon, line } = checkWinner(playerMoves);

  let newP1Score = state.player1Score;
  let newP2Score = state.player2Score;
  let newRound = state.roundNumber;
  let winnerResult: Player | null = null;
  let winningPlayer: 1 | 2 | null = null;
  let winningLine: number[] | null = null;

  if (hasWon) {
    winnerResult = currentPlayer;
    winningLine = line;
    winningPlayer = symbolToPlayer(currentPlayer, state.roundNumber);
    if (winningPlayer === 1) newP1Score++;
    else newP2Score++;
    newRound = state.roundNumber + 1;
  }

  return {
    board: newBoard,
    xMoves: newXMoves,
    oMoves: newOMoves,
    isXTurn: !state.isXTurn,
    player1Score: newP1Score,
    player2Score: newP2Score,
    roundNumber: newRound,
    winner: winnerResult,
    winningPlayer,
    winningLine,
    oldestPiece: null,
  };
}

export function startNewRound(state: GameState): GameState {
  const newRound = state.roundNumber;
  // Odd rounds: X starts first | Even rounds: O starts first
  const newIsXTurn = newRound % 2 !== 0;
  return {
    ...state,
    board: Array(9).fill(''),
    xMoves: [],
    oMoves: [],
    isXTurn: newIsXTurn,
    winner: null,
    winningPlayer: null,
    winningLine: null,
    oldestPiece: null,
  };
}

export function resetAll(): GameState {
  return createInitialState();
}

/** Returns index that will be removed on the next move */
export function getOldestIfFull(state: GameState): number | null {
  const moves = state.isXTurn ? state.xMoves : state.oMoves;
  if (moves.length >= 3) return moves[0];
  return null;
}
