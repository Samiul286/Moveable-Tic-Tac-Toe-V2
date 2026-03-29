'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/lib/gameLogic';
import { getPlayer1Symbol, getPlayer2Symbol } from '@/lib/gameLogic';

interface ScoreBoardProps {
  state: GameState;
}

/* Tiny inline SVG for the symbol */
function SymbolIcon({ sym, size = 18 }: { sym: string; size?: number }) {
  const isX = sym === 'X';
  return (
    <svg viewBox="0 0 36 36" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      {isX ? (
        <>
          <line x1="8" y1="8" x2="28" y2="28" stroke="#818cf8" strokeWidth="5" strokeLinecap="round" />
          <line x1="28" y1="8" x2="8"  y2="28" stroke="#818cf8" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <circle cx="18" cy="18" r="11" stroke="#f0abfc" strokeWidth="5" />
      )}
    </svg>
  );
}

export default function ScoreBoard({ state }: ScoreBoardProps) {
  const { player1Score, player2Score, roundNumber, isXTurn, winner } = state;

  const p1Symbol = getPlayer1Symbol(roundNumber);
  const p2Symbol = getPlayer2Symbol(roundNumber);

  const p1Active = !winner && ((p1Symbol === 'X' && isXTurn) || (p1Symbol === 'O' && !isXTurn));
  const p2Active = !winner && !p1Active;

  return (
    <div className="scoreboard">
      {/* ── Player 1 ──────────────────────────── */}
      <motion.div
        className={`score-card ${p1Symbol === 'X' ? 'x-card' : 'o-card'}${p1Active ? ' active' : ''}`}
        animate={{ scale: p1Active ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <div className="score-label">Player 1</div>
        <div className="score-symbol">
          <SymbolIcon sym={p1Symbol} size={20} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={player1Score}
            className="score-number"
            initial={{ y: -16, opacity: 0, scale: 0.8 }}
            animate={{ y: 0,   opacity: 1, scale: 1   }}
            exit={{    y:  16, opacity: 0, scale: 0.8  }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          >
            {player1Score}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Middle: Round + VS ────────────────── */}
      <div className="score-mid">
        <div className="round-label">RND</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={roundNumber}
            className="round-number"
            initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
            animate={{ scale: 1,   opacity: 1, rotate:   0 }}
            exit={{    scale: 1.4, opacity: 0, rotate:  10 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          >
            {roundNumber}
          </motion.div>
        </AnimatePresence>
        <div className="vs-text">VS</div>
      </div>

      {/* ── Player 2 ──────────────────────────── */}
      <motion.div
        className={`score-card ${p2Symbol === 'X' ? 'x-card' : 'o-card'}${p2Active ? ' active' : ''}`}
        animate={{ scale: p2Active ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <div className="score-label">Player 2</div>
        <div className="score-symbol">
          <SymbolIcon sym={p2Symbol} size={20} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={player2Score}
            className="score-number"
            initial={{ y: -16, opacity: 0, scale: 0.8 }}
            animate={{ y: 0,   opacity: 1, scale: 1   }}
            exit={{    y:  16, opacity: 0, scale: 0.8  }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          >
            {player2Score}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
