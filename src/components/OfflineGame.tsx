'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  getPlayer2Symbol,
  type GameState,
  type Player,
} from '@/lib/gameLogic';
import { getBestMove } from '@/lib/aiLogic';

interface OfflineGameProps {
  mode: '2p' | 'ai';
}

const slideIn = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

export default function OfflineGame({ mode }: OfflineGameProps) {
  const router  = useRouter();
  const [state, setState] = useState<GameState>(createInitialState());
  const [aiThinking, setAiThinking] = useState(false);

  const isAI = mode === 'ai';

  const aiSymbol: Player    = getPlayer2Symbol(state.roundNumber);
  const humanSymbol: Player = aiSymbol === 'X' ? 'O' : 'X';

  const handleCellClick = useCallback(
    (idx: number) => {
      if (state.board[idx] !== '' || state.winner || aiThinking) return;
      const isHumanTurn =
        (humanSymbol === 'X' && state.isXTurn) ||
        (humanSymbol === 'O' && !state.isXTurn);
      if (isAI && !isHumanTurn) return;
      setState((prev) => makeMove(prev, idx));
    },
    [state, isAI, aiThinking, humanSymbol]
  );

  useEffect(() => {
    if (!isAI || state.winner || aiThinking) return;
    const currentAiSymbol: Player = getPlayer2Symbol(state.roundNumber);
    const aisTurn =
      (currentAiSymbol === 'X' && state.isXTurn) ||
      (currentAiSymbol === 'O' && !state.isXTurn);
    if (!aisTurn) return;

    setAiThinking(true);
    const timer = setTimeout(() => {
      const best = getBestMove(state, currentAiSymbol);
      if (best !== -1) setState((prev) => makeMove(prev, best));
      setAiThinking(false);
    }, 520);
    return () => clearTimeout(timer);
  }, [state, isAI]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNextRound = () => setState((prev) => startNewRound(prev));
  const handleResetAll  = () => setState(createInitialState());

  const boardDisabled =
    !!state.winner ||
    aiThinking ||
    (isAI &&
      ((aiSymbol === 'X' && state.isXTurn) ||
       (aiSymbol === 'O' && !state.isXTurn)));

  const aiTurnClass = aiSymbol === 'X' ? 'x-turn' : 'o-turn';

  return (
    <div className="wrapper">
      <motion.div
        className="container"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Top row: Back + Badge ─────────────── */}
        <motion.div
          variants={slideIn}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <motion.button
            id="btn-back"
            className="btn back"
            whileHover={{ scale: 1.04, x: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← Back
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAI ? (
              <span className="ai-badge">🤖 vs AI</span>
            ) : (
              <span className="ai-badge violet">👥 2 Players</span>
            )}

            {/* AI thinking micro-indicator */}
            <AnimatePresence>
              {aiThinking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1   }}
                  exit={{    opacity: 0, scale: 0.7  }}
                  transition={{ duration: 0.15 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, margin: 0 }} />
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 9,
                    color: 'var(--text-3)',
                    letterSpacing: '0.08em',
                  }}>
                    THINKING
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Score Board ───────────────────────── */}
        <motion.div variants={slideIn} style={{ width: '100%' }}>
          <ScoreBoard state={state} />
        </motion.div>

        {/* ── Turn Banner ───────────────────────── */}
        <motion.div variants={slideIn} style={{ width: '100%' }}>
          <TurnBanner state={state} />
        </motion.div>

        {/* ── Board ─────────────────────────────── */}
        <motion.div variants={slideIn}>
          <GameBoard state={state} onCellClick={handleCellClick} disabled={boardDisabled} />
        </motion.div>

        {/* ── Piece Tracker ─────────────────────── */}
        <motion.div variants={slideIn} style={{ width: '100%' }}>
          <PieceTracker state={state} isAI={isAI} aiSymbol={aiSymbol} humanSymbol={humanSymbol} />
        </motion.div>

        {/* ── Action Buttons ────────────────────── */}
        <motion.div className="btns-row" variants={slideIn}>
          <motion.button
            id="btn-restart-board"
            className="btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={() =>
              setState((prev) =>
                startNewRound({ ...prev, winner: null, winningPlayer: null, winningLine: null })
              )
            }
          >
            ↺ Restart
          </motion.button>

          <motion.button
            id="btn-reset-score"
            className="btn danger"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            onClick={handleResetAll}
          >
            ✕ Reset Score
          </motion.button>
        </motion.div>

        <WinnerModal state={state} onNextRound={handleNextRound} onResetAll={handleResetAll} />
      </motion.div>
    </div>
  );
}

/* ── Piece Tracker ──────────────────────────────────────────── */
interface PieceTrackerProps {
  state: GameState;
  isAI: boolean;
  aiSymbol: Player;
  humanSymbol: Player;
}

function PieceTracker({ state, isAI, aiSymbol, humanSymbol }: PieceTrackerProps) {
  const { xMoves, oMoves } = state;

  if (isAI) {
    const humanCount = humanSymbol === 'X' ? xMoves.length : oMoves.length;
    const aiCount    = aiSymbol   === 'X' ? xMoves.length : oMoves.length;
    return (
      <div className="piece-tracker">
        <PiecePips
          label={`You (${humanSymbol})`}
          count={humanCount}
          color={humanSymbol === 'X' ? 'var(--x-bright)' : 'var(--o-bright)'}
          glow={humanSymbol  === 'X' ? 'var(--x-glow)'   : 'var(--o-glow)'}
        />
        <PiecePips
          label={`AI (${aiSymbol})`}
          count={aiCount}
          color={aiSymbol === 'X' ? 'var(--x-bright)' : 'var(--o-bright)'}
          glow={aiSymbol  === 'X' ? 'var(--x-glow)'   : 'var(--o-glow)'}
        />
      </div>
    );
  }

  return (
    <div className="piece-tracker">
      <PiecePips label="Player X" count={xMoves.length} color="var(--x-bright)" glow="var(--x-glow)" />
      <PiecePips label="Player O" count={oMoves.length} color="var(--o-bright)" glow="var(--o-glow)" />
    </div>
  );
}

function PiecePips({
  label, count, color, glow,
}: {
  label: string; count: number; color: string; glow: string;
}) {
  return (
    <div className="piece-pip-card">
      <span className="pip-label">{label}</span>
      <div className="pips">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="pip"
            animate={{
              background:  i < count ? color : 'var(--bg-input)',
              border:      `2px solid ${i < count ? color : 'rgba(255,255,255,0.08)'}`,
              boxShadow:   i < count ? `0 0 8px ${glow}` : 'none',
              scale:       i < count ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          />
        ))}
      </div>
      <span className="pip-count">{count}/3</span>
    </div>
  );
}
