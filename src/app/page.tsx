'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 26 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

/* ── Floating neon particles ───────────────────────────────── */
function Particle({ x, y, size, delay, color }: { x: number; y: number; size: number; delay: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'fixed',
        left:  `${x}%`,
        top:   `${y}%`,
        width:  size,
        height: size,
        borderRadius: '50%',
        background: color,
        pointerEvents: 'none',
        zIndex: 0,
        filter: `blur(${size / 2}px)`,
      }}
      animate={{
        y:       [0, -30, 0],
        opacity: [0.3, 0.7, 0.3],
        scale:   [1, 1.3, 1],
      }}
      transition={{
        duration:  4 + Math.random() * 3,
        delay,
        repeat:    Infinity,
        ease:      'easeInOut',
      }}
    />
  );
}

const PARTICLES = [
  { x: 12, y: 22, size: 6,  delay: 0,   color: 'rgba(99,102,241,0.8)'  },
  { x: 85, y: 15, size: 4,  delay: 1,   color: 'rgba(232,121,249,0.8)' },
  { x: 70, y: 70, size: 5,  delay: 2,   color: 'rgba(99,102,241,0.6)'  },
  { x: 25, y: 80, size: 3,  delay: 0.5, color: 'rgba(232,121,249,0.6)' },
  { x: 50, y: 10, size: 4,  delay: 1.5, color: 'rgba(124,58,237,0.7)'  },
  { x: 90, y: 55, size: 5,  delay: 2.5, color: 'rgba(6,182,212,0.6)'   },
  { x: 5,  y: 55, size: 3,  delay: 3,   color: 'rgba(232,121,249,0.5)' },
  { x: 60, y: 88, size: 4,  delay: 0.8, color: 'rgba(99,102,241,0.5)'  },
];

/* ── Mini animated board preview ──────────────────────────── */
function MiniBoard() {
  const [tick, setTick] = useState(0);
  const frames = [
    ['X','','','','O','','X','',''],
    ['X','','','','O','','X','O',''],
    ['X','X','','','O','','X','O',''],
    ['X','X','','O','O','','X','O',''],
    ['X','X','X','O','O','','X','O',''],
  ];

  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % frames.length), 1200);
    return () => clearInterval(id);
  }, []);

  const board = frames[tick];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 5,
      width: 70,
      height: 70,
    }}>
      {board.map((cell, i) => (
        <div key={i} style={{
          background: cell ? (cell === 'X' ? 'rgba(99,102,241,0.2)' : 'rgba(232,121,249,0.2)') : 'rgba(255,255,255,0.03)',
          border: `1px solid ${cell === 'X' ? 'rgba(99,102,241,0.4)' : cell === 'O' ? 'rgba(232,121,249,0.4)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 900,
          color: cell === 'X' ? '#818cf8' : '#f0abfc',
          fontFamily: "'Orbitron', sans-serif",
          transition: 'all 0.3s',
        }}>
          {cell}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  const modes = [
    {
      id:        'btn-mode-2player',
      key:       'cyan',
      icon:      '👥',
      iconClass: 'cyan-icon',
      label:     '2 Players',
      desc:      'Local multiplayer. Alternate turns & battle on a shared screen.',
      href:      '/2player',
      accent:    '#06b6d4',
    },
    {
      id:        'btn-mode-ai',
      key:       'violet',
      icon:      '🤖',
      iconClass: 'violet-icon',
      label:     'vs AI',
      desc:      'Face the minimax engine. Survive 3-piece strategy.',
      href:      '/ai',
      accent:    '#7c3aed',
    },
    {
      id:        'btn-mode-online',
      key:       'emerald',
      icon:      '🌐',
      iconClass: 'emerald-icon',
      label:     'Online',
      desc:      'Create or join a room. Real-time Firebase sync.',
      href:      '/online',
      accent:    '#10b981',
    },
  ];

  return (
    <div className="wrapper">
      {/* Floating particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      <motion.div
        className="container"
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* ── Header ──────────────────────────────── */}
        <motion.header className="header" variants={fadeUp}>
          <motion.div
            className="logo-badge"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 320, damping: 20 }}
          >
            ◈ &nbsp;Arcade Strategy
          </motion.div>

          <h1 className="title">
            <span className="x-col">MOVE</span>
            <span className="title-sep">·</span>
            <span className="o-col">ABLE</span>
            <br />
            <span style={{ fontSize: '0.7em', opacity: 0.85, letterSpacing: '-0.01em' }}>
              Tic · Tac · Toe
            </span>
          </h1>

          <p className="subtitle">
            3 pieces each · oldest auto‑removes · symbols swap each round
          </p>
        </motion.header>

        {/* ── Live preview + rules grid ──────────── */}
        <motion.div variants={fadeUp} style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            {/* Animated board preview */}
            <div style={{
              background: 'rgba(10,10,30,0.6)',
              border: '1px solid rgba(99,102,241,0.18)',
              borderRadius: 14,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backdropFilter: 'blur(12px)',
              flexShrink: 0,
            }}>
              <MiniBoard />
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 8,
                color: 'var(--text-3)',
                letterSpacing: '0.12em',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>Live Preview</span>
            </div>
            <HowItWorks />
          </div>
        </motion.div>

        {/* ── Mode selection ─────────────────────── */}
        <motion.nav
          className="mode-menu"
          aria-label="Game mode selection"
          variants={stagger}
        >
          {modes.map((m) => (
            <motion.button
              key={m.key}
              id={m.id}
              className={`mode-card ${m.key}-mode`}
              variants={fadeUp}
              whileHover={{ scale: 1.012, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              onClick={() => router.push(m.href)}
            >
              <div className={`mode-icon ${m.iconClass}`}>{m.icon}</div>
              <div className="mode-info">
                <h3 style={{ color: m.accent }}>{m.label}</h3>
                <p>{m.desc}</p>
              </div>
              <span className="mode-arrow">›</span>
            </motion.button>
          ))}
        </motion.nav>

        {/* ── Footer note ────────────────────────── */}
        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 9,
            color: 'var(--text-4)',
            textAlign: 'center',
            letterSpacing: '0.08em',
          }}
        >
          ONLINE MODE REQUIRES FIREBASE .env.local
        </motion.p>
      </motion.div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: '🎯', text: '3 pieces max per player' },
    { icon: '♻', text: 'Oldest piece auto-removes' },
    { icon: '🏆', text: 'Score across endless rounds' },
    { icon: '🔀', text: 'Symbols swap each round' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 7,
      flex: 1,
    }}>
      {steps.map((s, i) => (
        <motion.div
          key={i}
          className="how-item"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <span className="how-icon">{s.icon}</span>
          <span className="how-text">{s.text}</span>
        </motion.div>
      ))}
    </div>
  );
}
