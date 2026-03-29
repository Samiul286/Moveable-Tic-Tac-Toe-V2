'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/lib/gameLogic';
import { getPlayer1Symbol } from '@/lib/gameLogic';

interface TurnBannerProps {
  state: GameState;
}

export default function TurnBanner({ state }: TurnBannerProps) {
  const { winner, winningPlayer, isXTurn, xMoves, oMoves, roundNumber } = state;

  const p1Symbol        = getPlayer1Symbol(roundNumber);
  const currentPlayerNum =
    (isXTurn && p1Symbol === 'X') || (!isXTurn && p1Symbol === 'O') ? 1 : 2;
  const currentSymbol = isXTurn ? 'X' : 'O';
  const willRemove    = (isXTurn ? xMoves : oMoves).length >= 3;

  const bannerKey   = winner ? 'winner' : currentSymbol;
  const bannerClass = winner ? 'winner-banner' : isXTurn ? 'x-turn' : 'o-turn';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={bannerKey}
        className={`turn-banner ${bannerClass}`}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y:  0, scale: 1    }}
        exit={{    opacity: 0, y:  8, scale: 0.96  }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        <span className="turn-dot" />

        {winner ? (
          <>🎉 P{winningPlayer} wins</>
        ) : (
          <>
            P{currentPlayerNum}
            <span style={{ opacity: 0.6, fontWeight: 400, fontSize: '0.85em' }}>
              ({currentSymbol})
            </span>
            &apos;s turn

            {willRemove && (
              <motion.span
                className="move-hint"
                style={{ marginLeft: 4 }}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x:  0 }}
                transition={{ delay: 0.1 }}
              >
                · oldest removes
              </motion.span>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
