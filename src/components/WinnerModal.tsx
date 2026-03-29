'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/lib/gameLogic';
import { getPlayer1Symbol, getPlayer2Symbol } from '@/lib/gameLogic';

interface WinnerModalProps {
  state: GameState;
  onNextRound: () => void;
  onResetAll:  () => void;
}

/* Confetti particle */
function ConfettiDot({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left:  `${x}%`,
        top:   `${y}%`,
        width:  4,
        height: 4,
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
      }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [-20, -60] }}
      transition={{ delay, duration: 1.2, ease: 'easeOut' }}
    />
  );
}

const CONFETTI = [
  { x: 20, y: 80, color: '#818cf8', delay: 0.1 },
  { x: 50, y: 85, color: '#f0abfc', delay: 0.2 },
  { x: 80, y: 78, color: '#fbbf24', delay: 0.15 },
  { x: 30, y: 75, color: '#f0abfc', delay: 0.3 },
  { x: 70, y: 82, color: '#818cf8', delay: 0.05 },
  { x: 15, y: 90, color: '#fbbf24', delay: 0.25 },
  { x: 85, y: 88, color: '#818cf8', delay: 0.35 },
  { x: 45, y: 92, color: '#f0abfc', delay: 0.1 },
];

export default function WinnerModal({ state, onNextRound, onResetAll }: WinnerModalProps) {
  const { winner, winningPlayer, player1Score, player2Score, roundNumber } = state;

  const nextRound    = roundNumber;
  const nextP1Symbol = nextRound % 2 !== 0 ? 'X' : 'O';
  const nextP2Symbol = nextRound % 2 !== 0 ? 'O' : 'X';

  const isX = winner === 'X';

  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          className="winner-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="Winner announcement"
        >
          <motion.div
            className={`winner-modal ${isX ? 'x-win' : 'o-win'}`}
            initial={{ scale: 0.6, opacity: 0, y: 40 }}
            animate={{ scale: 1,   opacity: 1, y:  0  }}
            exit={{    scale: 0.7, opacity: 0, y: 20  }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            {/* Confetti burst */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}>
              {CONFETTI.map((c, i) => <ConfettiDot key={i} {...c} />)}
            </div>

            {/* Trophy / symbol */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0   }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 400, damping: 18 }}
              style={{ marginBottom: 14, position: 'relative' }}
            >
              {/* Big glowing piece */}
              <svg viewBox="0 0 80 80" fill="none" style={{ width: 72, height: 72 }}>
                {isX ? (
                  <>
                    <circle cx="40" cy="40" r="36" stroke="rgba(99,102,241,0.15)" strokeWidth="2" />
                    <line x1="22" y1="22" x2="58" y2="58" stroke="rgba(99,102,241,0.3)"  strokeWidth="18" strokeLinecap="round" />
                    <line x1="58" y1="22" x2="22" y2="58" stroke="rgba(99,102,241,0.3)"  strokeWidth="18" strokeLinecap="round" />
                    <line x1="22" y1="22" x2="58" y2="58" stroke="#818cf8" strokeWidth="7"  strokeLinecap="round" />
                    <line x1="58" y1="22" x2="22" y2="58" stroke="#818cf8" strokeWidth="7"  strokeLinecap="round" />
                    <line x1="22" y1="22" x2="58" y2="58" stroke="rgba(200,205,255,0.7)" strokeWidth="2"  strokeLinecap="round" />
                    <line x1="58" y1="22" x2="22" y2="58" stroke="rgba(200,205,255,0.7)" strokeWidth="2"  strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <circle cx="40" cy="40" r="36" stroke="rgba(232,121,249,0.15)" strokeWidth="2" />
                    <circle cx="40" cy="40" r="22" stroke="rgba(232,121,249,0.3)"  strokeWidth="18" />
                    <circle cx="40" cy="40" r="22" stroke="#f0abfc" strokeWidth="7" />
                    <circle cx="40" cy="40" r="22" stroke="rgba(255,220,255,0.6)"  strokeWidth="2" />
                    <circle cx="28" cy="28" r="4"  fill="rgba(255,255,255,0.5)"   />
                  </>
                )}
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ delay: 0.2 }}
            >
              <div className="winner-label">🏆 Round {roundNumber - 1} Winner</div>

              <div className={`winner-text ${isX ? 'x-text' : 'o-text'}`}>
                Player {winningPlayer}
              </div>

              <div className="winner-sub">
                Score — P1: <strong style={{ color: '#818cf8' }}>{player1Score}</strong>
                {' '}&nbsp;|&nbsp;{' '}
                P2: <strong style={{ color: '#f0abfc' }}>{player2Score}</strong>
              </div>

              {/* Symbol swap notice */}
              <motion.div
                className="swap-notice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1    }}
                transition={{ delay: 0.3 }}
              >
                <div style={{ marginBottom: 4, fontWeight: 800, letterSpacing: '0.04em' }}>
                  🔀 Symbols Swap — Round {nextRound}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span>
                    P1 →{' '}
                    <strong style={{ color: nextP1Symbol === 'X' ? '#818cf8' : '#f0abfc' }}>
                      {nextP1Symbol}
                    </strong>
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
                  <span>
                    P2 →{' '}
                    <strong style={{ color: nextP2Symbol === 'X' ? '#818cf8' : '#f0abfc' }}>
                      {nextP2Symbol}
                    </strong>
                  </span>
                </div>
              </motion.div>

              <div className="btns-row">
                <motion.button
                  id="btn-next-round"
                  className="btn primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  onClick={onNextRound}
                >
                  ▶ Next Round
                </motion.button>
                <motion.button
                  id="btn-reset-all"
                  className="btn danger"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  onClick={onResetAll}
                >
                  ↺ Reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
