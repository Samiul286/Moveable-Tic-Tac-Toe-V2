import { ref, set, update, onValue, off, get } from 'firebase/database';
import { db } from './firebase';
import type { GameState, Player } from './gameLogic';

export interface OnlineRoom {
  board: string[];
  xMoves: number[];
  oMoves: number[];
  isXTurn: boolean;
  player1Score: number;
  player2Score: number;
  roundNumber: number;
  playerX: string;
  playerO: string;
  status: 'waiting' | 'playing' | 'ended';
  winner: string;
  winningPlayer: number;
  winningLine: number[];
  lastMoveTime: number;
}

/** Serialize arrays as objects for RTDB (RTDB doesn't accept JS arrays natively) */
function arrToObj(arr: (string | number)[]): Record<string, string | number> {
  const obj: Record<string, string | number> = {};
  arr.forEach((v, i) => { obj[i] = v; });
  return obj;
}

function objToArr<T>(obj: Record<string, T> | T[] | null | undefined, length: number, fallback: T): T[] {
  if (!obj) return Array(length).fill(fallback);
  if (Array.isArray(obj)) return obj;
  const result: T[] = Array(length).fill(fallback);
  Object.entries(obj).forEach(([k, v]) => { result[Number(k)] = v; });
  return result;
}

/* ── Raw snapshot → typed room ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function snapshotToRoom(raw: any): OnlineRoom {
  return {
    board:        objToArr<string>(raw.board, 9, ''),
    xMoves:       objToArr<number>(raw.xMoves, 0, 0).filter((v: unknown) => v !== undefined),
    oMoves:       objToArr<number>(raw.oMoves, 0, 0).filter((v: unknown) => v !== undefined),
    isXTurn:      Boolean(raw.isXTurn),
    player1Score: Number(raw.player1Score ?? 0),
    player2Score: Number(raw.player2Score ?? 0),
    roundNumber:  Number(raw.roundNumber ?? 1),
    playerX:      raw.playerX ?? '',
    playerO:      raw.playerO ?? '',
    status:       raw.status ?? 'waiting',
    winner:       raw.winner ?? '',
    winningPlayer: Number(raw.winningPlayer ?? 0),
    winningLine:  objToArr<number>(raw.winningLine, 0, 0).filter((v: unknown) => v !== undefined),
    lastMoveTime: Number(raw.lastMoveTime ?? 0),
  };
}

/* ── Create a new room ── */
export async function createRoom(roomId: string, playerId: string): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);
  await set(roomRef, {
    board:          arrToObj(Array(9).fill('')),
    xMoves:         {},
    oMoves:         {},
    isXTurn:        true,
    player1Score:   0,
    player2Score:   0,
    roundNumber:    1,
    playerX:        playerId,
    playerO:        '',
    status:         'waiting',
    winner:         '',
    winningPlayer:  0,
    winningLine:    {},
    lastMoveTime:   Date.now(),
  });
}

/* ── Join an existing room ── */
export async function joinRoom(roomId: string, playerId: string): Promise<boolean> {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return false;
  const data = snap.val();
  if (data.status !== 'waiting') return false; // room already has 2 players

  await update(roomRef, {
    playerO: playerId,
    status:  'playing',
  });
  return true;
}

/* ── Push a full game-state update ── */
export async function pushMove(
  roomId: string,
  state: Omit<GameState, 'oldestPiece'>
): Promise<void> {
  const roomRef = ref(db, `rooms/${roomId}`);
  await update(roomRef, {
    board:         arrToObj(state.board),
    xMoves:        state.xMoves.length ? arrToObj(state.xMoves) : {},
    oMoves:        state.oMoves.length ? arrToObj(state.oMoves) : {},
    isXTurn:       state.isXTurn,
    player1Score:  state.player1Score,
    player2Score:  state.player2Score,
    roundNumber:   state.roundNumber,
    winner:        state.winner ?? '',
    winningPlayer: state.winningPlayer ?? 0,
    winningLine:   state.winningLine?.length ? arrToObj(state.winningLine) : {},
    lastMoveTime:  Date.now(),
  });
}

/* ── Subscribe to room changes ── */
export function subscribeToRoom(
  roomId: string,
  callback: (room: OnlineRoom) => void
): () => void {
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snap) => {
    if (snap.exists()) {
      callback(snapshotToRoom(snap.val()));
    }
  });
  // Return unsubscribe function
  return () => off(roomRef);
}
