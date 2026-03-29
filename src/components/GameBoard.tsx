'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/lib/gameLogic';

interface BoardProps {
  state: GameState;
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

/* ── Neon X Piece ──────────────────────────────────────────── */
function XPiece({ winning }: { winning: boolean }) {
  return (
    <svg
      className={`piece${winning ? ' winning-piece' : ''}`}
      viewBox="0 0 54 54"
      fill="none"
      style={{ color: 'var(--x-bright)' }}
    >
      {/* Shadow/glow blur layer */}
      <line x1="12" y1="12" x2="42" y2="42" stroke="rgba(99,102,241,0.3)" strokeWidth="12" strokeLinecap="round" />
      <line x1="42" y1="12" x2="12" y2="42" stroke="rgba(99,102,241,0.3)" strokeWidth="12" strokeLinecap="round" />
      {/* Main strokes */}
      <line x1="12" y1="12" x2="42" y2="42" stroke="#818cf8" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="42" y1="12" x2="12" y2="42" stroke="#818cf8" strokeWidth="5.5" strokeLinecap="round" />
      {/* Bright core */}
      <line x1="12" y1="12" x2="42" y2="42" stroke="rgba(199,203,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="12" x2="12" y2="42" stroke="rgba(199,203,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Neon O Piece ──────────────────────────────────────────── */
function OPiece({ winning }: { winning: boolean }) {
  return (
    <svg
      className={`piece${winning ? ' winning-piece' : ''}`}
      viewBox="0 0 54 54"
      fill="none"
      style={{ color: 'var(--o-bright)' }}
    >
      {/* Shadow/glow blur layer */}
      <circle cx="27" cy="27" r="15" stroke="rgba(232,121,249,0.3)" strokeWidth="12" />
      {/* Main ring */}
      <circle cx="27" cy="27" r="15" stroke="#f0abfc" strokeWidth="5.5" strokeLinecap="round" />
      {/* Bright core ring */}
      <circle cx="27" cy="27" r="15" stroke="rgba(255,220,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Shine dot */}
      <circle cx="19" cy="19" r="2.5" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

const pieceSpring = { type: 'spring', stiffness: 380, damping: 22 } as const;

export default function GameBoard({ state, onCellClick, disabled }: BoardProps) {
  const { board, xMoves, oMoves, winningLine, winner } = state;

  const oldestX = xMoves.length > 0 ? xMoves[0] : null;
  const oldestO = oMoves.length > 0 ? oMoves[0] : null;

  const aboutToRemove = !winner
    ? state.isXTurn
      ? xMoves.length >= 3 ? oldestX : null
      : oMoves.length >= 3 ? oldestO : null
    : null;

  return (
    <div className="board-container">
      <div className="board">
        {board.map((cell, idx) => {
          const isX        = cell === 'X';
          const isO        = cell === 'O';
          const isOccupied = cell !== '';
          const isWinning  = winningLine?.includes(idx) ?? false;
          const isOldest   = idx === aboutToRemove;

          let cellClass = 'cell';
          if (isX) cellClass += ' x-cell occupied';
          if (isO) cellClass += ' o-cell occupied';
          if (isWinning) cellClass += ' winning-cell';
          if (isOldest)  cellClass += ' oldest-cell';
          if (winner)    cellClass += ' winner-lock';

          return (
            <motion.div
              key={idx}
              id={`cell-${idx}`}
              className={cellClass}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.035, type: 'spring', stiffness: 280, damping: 22 }}
              whileTap={!isOccupied && !disabled ? { scale: 0.85 } : {}}
              onClick={() => !disabled && onCellClick(idx)}
              role="button"
              aria-label={`Cell ${idx + 1}${cell ? `, occupied by ${cell}` : ', empty'}`}
            >
              {isOldest && (
                <motion.span
                  className="oldest-label"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  NEXT
                </motion.span>
              )}

              <AnimatePresence mode="popLayout">
                {isX && (
                  <motion.div
                    key={`x-${idx}`}
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0,   opacity: 1 }}
                    exit={{    scale: 0, rotate:  20, opacity: 0 }}
                    transition={pieceSpring}
                  >
                    <XPiece winning={isWinning} />
                  </motion.div>
                )}
                {isO && (
                  <motion.div
                    key={`o-${idx}`}
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0,   opacity: 1 }}
                    exit={{    scale: 0, rotate:  20, opacity: 0 }}
                    transition={pieceSpring}
                  >
                    <OPiece winning={isWinning} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
