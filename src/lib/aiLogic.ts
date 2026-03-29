import type { GameState, Player } from './gameLogic';
import { checkWinner } from './gameLogic';

/**
 * Minimax AI with alpha-beta pruning for 3-piece moveable rules.
 * aiSymbol is passed in so the AI adapts when symbols swap each round.
 */

type BoardArr = string[];

function getAvailableMoves(board: BoardArr): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (cell === '') acc.push(i);
    return acc;
  }, []);
}

function simulateMove(
  board: BoardArr,
  xMoves: number[],
  oMoves: number[],
  cellIndex: number,
  player: Player
): { board: BoardArr; xMoves: number[]; oMoves: number[] } {
  const newBoard = [...board];
  const px = [...xMoves];
  const po = [...oMoves];
  const playerMoves = player === 'X' ? px : po;

  if (playerMoves.length >= 3) {
    const oldest = playerMoves.shift()!;
    newBoard[oldest] = '';
  }
  playerMoves.push(cellIndex);
  newBoard[cellIndex] = player;

  return { board: newBoard, xMoves: px, oMoves: po };
}

function evaluate(
  xMoves: number[],
  oMoves: number[],
  aiSymbol: Player  // AI's symbol this round
): number {
  const aiMoves   = aiSymbol === 'O' ? oMoves : xMoves;
  const humMoves  = aiSymbol === 'O' ? xMoves : oMoves;
  if (checkWinner(aiMoves).winner)  return  10;
  if (checkWinner(humMoves).winner) return -10;
  return 0;
}

function minimax(
  board: BoardArr,
  xMoves: number[],
  oMoves: number[],
  isMaximizing: boolean,
  depth: number,
  alpha: number,
  beta: number,
  aiSymbol: Player,
  humanSymbol: Player
): number {
  const score = evaluate(xMoves, oMoves, aiSymbol);
  if (score !== 0 || depth === 0) return score;

  const available = getAvailableMoves(board);
  if (available.length === 0) return 0;

  if (isMaximizing) {
    // AI's turn
    let best = -Infinity;
    for (const move of available) {
      const { board: nb, xMoves: nx, oMoves: no } = simulateMove(
        board, xMoves, oMoves, move, aiSymbol
      );
      const val = minimax(nb, nx, no, false, depth - 1, alpha, beta, aiSymbol, humanSymbol);
      best = Math.max(best, val);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    // Human's turn
    let best = Infinity;
    for (const move of available) {
      const { board: nb, xMoves: nx, oMoves: no } = simulateMove(
        board, xMoves, oMoves, move, humanSymbol
      );
      const val = minimax(nb, nx, no, true, depth - 1, alpha, beta, aiSymbol, humanSymbol);
      best = Math.min(best, val);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

/**
 * Returns the best cell index for the AI to play.
 * @param state  current game state
 * @param aiSymbol  the symbol the AI is using THIS round ('X' or 'O')
 */
export function getBestMove(state: GameState, aiSymbol: Player): number {
  const humanSymbol: Player = aiSymbol === 'O' ? 'X' : 'O';
  const { board, xMoves, oMoves } = state;
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  let bestVal = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    const { board: nb, xMoves: nx, oMoves: no } = simulateMove(
      board, xMoves, oMoves, move, aiSymbol
    );
    const val = minimax(nb, nx, no, false, 5, -Infinity, Infinity, aiSymbol, humanSymbol);
    if (val > bestVal) {
      bestVal = val;
      bestMove = move;
    }
  }

  return bestMove;
}
