'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from '@/components/GameBoard';
import ScoreBoard from '@/components/ScoreBoard';
import TurnBanner from '@/components/TurnBanner';
import WinnerModal from '@/components/WinnerModal';
import {
  createInitialState,
  makeMove,
  startNewRound,
  type GameState,
} from '@/lib/gameLogic';
import {
  createRoom,
  joinRoom,
  pushMove,
  subscribeToRoom,
  type OnlineRoom,
} from '@/lib/firestore';

type Phase = 'menu' | 'creating' | 'waiting' | 'joining' | 'playing' | 'error';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).slice(2, 9);
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
};

const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function OnlineGame() {
  const router = useRouter();
  const [phase, setPhase]       = useState<Phase>('menu');
  const [roomId, setRoomId]     = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [playerId]              = useState(() => generatePlayerId());
  const [myRole, setMyRole]     = useState<'X' | 'O' | null>(null);
  const [state, setState]       = useState<GameState>(createInitialState());
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied]     = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const roomToState = useCallback((room: OnlineRoom): GameState => ({
    board: room.board,
    xMoves: room.xMoves,
    oMoves: room.oMoves,
    isXTurn: room.isXTurn,
    player1Score: room.player1Score,
    player2Score: room.player2Score,
    roundNumber: room.roundNumber,
    winner: (room.winner as 'X' | 'O' | null) || null,
    winningPlayer: (room.winningPlayer as 1 | 2 | null) || null,
    winningLine: room.winningLine?.length ? room.winningLine : null,
    oldestPiece: null,
  }), []);

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'waiting') return;
    const unsub = subscribeToRoom(roomId, (room) => {
      if (phase === 'waiting' && room.playerO && room.status === 'playing') setPhase('playing');
      setState(roomToState(room));
      if (room.status === 'ended' && !room.winner) setOpponentLeft(true);
    });
    unsubRef.current = unsub;
    return () => unsub();
  }, [phase, roomId, roomToState]);

  useEffect(() => () => { unsubRef.current?.(); }, []);

  const handleCreate = async () => {
    setPhase('creating');
    const id = generateRoomId();
    setRoomId(id);
    setMyRole('X');
    try {
      await createRoom(id, playerId);
      setPhase('waiting');
    } catch {
      setErrorMsg('Failed to create room. Check your Firebase config.');
      setPhase('error');
    }
  };

  const handleJoin = async () => {
    const id = joinInput.trim().toUpperCase();
    if (id.length < 4) { setErrorMsg('Enter a valid room code.'); return; }
    setPhase('joining');
    setRoomId(id);
    setMyRole('O');
    try {
      const ok = await joinRoom(id, playerId);
      if (!ok) throw new Error('Room not found');
      setPhase('playing');
    } catch {
      setErrorMsg('Could not join room. Check the code and try again.');
      setPhase('menu');
    }
  };

  const handleCellClick = useCallback(async (idx: number) => {
    if (!myRole) return;
    if (state.board[idx] !== '' || state.winner) return;
    const isMyTurn = (myRole === 'X' && state.isXTurn) || (myRole === 'O' && !state.isXTurn);
    if (!isMyTurn) return;
    const newState = makeMove(state, idx);
    setState(newState);
    await pushMove(roomId, newState);
  }, [myRole, state, roomId]);

  const handleNextRound = useCallback(async () => {
    const next = startNewRound(state);
    setState(next);
    await pushMove(roomId, next);
  }, [state, roomId]);

  const handleResetAll = useCallback(async () => {
    const fresh = createInitialState();
    setState(fresh);
    await pushMove(roomId, fresh);
  }, [roomId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isMyTurn =
    myRole !== null &&
    ((myRole === 'X' && state.isXTurn) || (myRole === 'O' && !state.isXTurn));

  /* ── Menu ── */
  if (phase === 'menu') {
    return (
      <div className="wrapper">
        <motion.div className="container" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} style={{ width: '100%' }}>
            <motion.button
              id="btn-back-online"
              className="btn back"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/')}
            >
              ← Back
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} className="header" style={{ textAlign: 'left', width: '100%' }}>
            <div className="logo-badge">🌐 Online Multiplayer</div>
            <h1 className="title" style={{ fontSize: 'clamp(22px,6vw,30px)' }}>Play with a Friend</h1>
            <p className="subtitle">Create a room and share the code, or join with an existing code.</p>
          </motion.div>

          {/* Create Room */}
          <motion.div variants={fadeUp} className="card">
            <h2>🎮 Create Room</h2>
            <p>Start a new game and share the room code with your friend.</p>
            <motion.button
              id="btn-create-room"
              className="btn emerald"
              style={{ width: '100%' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
            >
              + Create Room
            </motion.button>
          </motion.div>

          {/* Join Room */}
          <motion.div variants={fadeUp} className="card">
            <h2>🔗 Join Room</h2>
            <p>Enter the room code shared by your friend to jump into the game.</p>
            <div className="input-group">
              <label htmlFor="input-room-code">Room Code</label>
              <input
                id="input-room-code"
                className="input-field"
                placeholder="e.g. ABC123"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', fontSize: 18 }}
              />
            </div>
            {errorMsg && <div className="error-text">{errorMsg}</div>}
            <motion.button
              id="btn-join-room"
              className="btn primary"
              style={{ width: '100%', marginTop: 4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleJoin}
            >
              Join Room →
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Creating / Joining spinner ── */
  if (phase === 'creating' || phase === 'joining') {
    return (
      <div className="wrapper">
        <div className="container">
          <motion.div
            className="waiting-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <div className="spinner" />
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
              {phase === 'creating' ? 'Creating room…' : 'Joining room…'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Waiting for opponent ── */
  if (phase === 'waiting') {
    return (
      <div className="wrapper">
        <motion.div className="container" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} style={{ width: '100%' }}>
            <button className="btn back" onClick={() => { unsubRef.current?.(); router.push('/'); }}>
              ← Cancel
            </button>
          </motion.div>

          <motion.div variants={fadeUp} className="card" style={{ textAlign: 'center' }}>
            <motion.div
              className="logo-badge"
              style={{ margin: '0 auto 16px' }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              You are Player X
            </motion.div>
            <h2 style={{ marginBottom: 12 }}>Waiting for opponent…</h2>
            <p>Share this code with your friend:</p>

            <div className="room-code-display">
              <span className="room-code-value">{roomId}</span>
              <motion.button
                className="copy-btn"
                whileTap={{ scale: 0.94 }}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </motion.button>
            </div>

            <div className="status-row" style={{ justifyContent: 'center' }}>
              <div className="status-dot" />
              Waiting for Player O to join…
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ── Error ── */
  if (phase === 'error') {
    return (
      <div className="wrapper">
        <motion.div
          className="container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          <div className="card" style={{ textAlign: 'center' }}>
            <motion.span
              style={{ fontSize: 44, display: 'block', marginBottom: 12 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ⚠️
            </motion.span>
            <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
            <div className="error-text" style={{ marginBottom: 18 }}>{errorMsg}</div>
            <p style={{ marginBottom: 18, fontSize: 13, color: 'var(--text-2)' }}>
              Make sure your Firebase config is set in{' '}
              <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>.env.local</code>.
            </p>
            <motion.button
              className="btn primary"
              style={{ width: '100%' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/')}
            >
              ← Go Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Playing ── */
  return (
    <div className="wrapper">
      <motion.div className="container" variants={stagger} initial="hidden" animate="show">

        {/* Header row */}
        <motion.div
          variants={fadeUp}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
        >
          <motion.button
            className="btn back"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { unsubRef.current?.(); router.push('/'); }}
          >
            ← Exit
          </motion.button>
          <span
            className="ai-badge"
            style={{
              background: 'var(--emerald-dim)',
              borderColor: 'rgba(16,185,129,0.25)',
              color: 'var(--emerald)',
            }}
          >
            🌐 Room: <span style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em' }}>{roomId}</span>
          </span>
          <span
            className="ai-badge"
            style={{ marginLeft: 'auto', background: 'var(--violet-dim)', borderColor: 'rgba(139,92,246,0.25)', color: '#a78bfa' }}
          >
            You: {myRole}
          </span>
        </motion.div>

        {/* Disconnect warning */}
        <AnimatePresence>
          {opponentLeft && (
            <motion.div
              className="disconnect-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0 }}
            >
              ⚠️ Your opponent may have left the room.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected status */}
        <motion.div variants={fadeUp} className="status-row" style={{ alignSelf: 'flex-start' }}>
          <div className="status-dot connected" />
          Connected — You are Player {myRole}
        </motion.div>

        <motion.div variants={fadeUp} style={{ width: '100%' }}>
          <ScoreBoard state={state} />
        </motion.div>

        <motion.div variants={fadeUp} style={{ width: '100%' }}>
          <TurnBanner state={state} />
        </motion.div>

        {/* Waiting for opponent's move */}
        <AnimatePresence>
          {!isMyTurn && !state.winner && (
            <motion.div
              className="turn-banner"
              style={{
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'var(--border)',
                color: 'var(--text-3)',
              }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y:  4 }}
            >
              <span className="turn-dot" style={{ background: 'var(--text-3)', animation: 'none' }} />
              Waiting for opponent&apos;s move…
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={fadeUp}>
          <GameBoard
            state={state}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || !!state.winner}
          />
        </motion.div>

        <motion.div className="btns-row" variants={fadeUp}>
          <motion.button
            className="btn danger"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { unsubRef.current?.(); router.push('/'); }}
          >
            ⏻ Leave Room
          </motion.button>
        </motion.div>

        <WinnerModal state={state} onNextRound={handleNextRound} onResetAll={handleResetAll} />
      </motion.div>
    </div>
  );
}
