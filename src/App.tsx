import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Coins, Play, Flame, Snowflake, Zap, Gem, Pause, FastForward, X, Volume2, VolumeX, Skull, Wind, Mountain, Sun, Moon, Droplet, Leaf, Sparkles, Shield, Crosshair, Timer, CloudLightning, Heart, Swords, CloudRain, CircleDot, Waves } from 'lucide-react';
import { useGameLoop, type TowerType, type TargetPriority, type ActiveSkillType, MAP_STAGES, GRID_COLS, GRID_ROWS, isPathCell } from './useGameLoop';
import { toggleMuted, getMuted } from './soundUtils';
import TitleScreen from './TitleScreen';
import HowToPlayScreen from './HowToPlayScreen';
import UpgradesScreen from './UpgradesScreen';
import BestiaryScreen from './BestiaryScreen';
import StageSelectScreen from './StageSelectScreen';
import { DeckScreen } from './DeckScreen';
import { LanguageProvider, useI18n } from './i18n';

const TOWER_INFO: Record<TowerType, { name: string, color: string, icon: any }> = {
  fire: { name: 'Fire', color: '#ef4444', icon: Flame },
  volcano: { name: 'Volcano', color: '#f97316', icon: Flame },
  magma: { name: 'Magma', color: '#b91c1c', icon: Flame },
  ice: { name: 'Ice', color: '#3b82f6', icon: Snowflake },
  blizzard: { name: 'Blizzard', color: '#60a5fa', icon: Snowflake },
  frostbite: { name: 'Frostbite', color: '#1e3a8a', icon: Snowflake },
  thunder: { name: 'Thunder', color: '#eab308', icon: Zap },
  chain: { name: 'Chain', color: '#fde047', icon: Zap },
  sniper: { name: 'Sniper', color: '#ca8a04', icon: Zap },
  poison: { name: 'Poison', color: '#22c55e', icon: Skull },
  wind: { name: 'Wind', color: '#a8a29e', icon: Wind },
  earth: { name: 'Earth', color: '#78350f', icon: Mountain },
  light: { name: 'Light', color: '#fde047', icon: Sun },
  dark: { name: 'Dark', color: '#4c1d95', icon: Moon },
  water: { name: 'Water', color: '#06b6d4', icon: Droplet },
  nature: { name: 'Nature', color: '#16a34a', icon: Leaf },
  arcane: { name: 'Arcane', color: '#d946ef', icon: Sparkles },
  lava: { name: 'Lava', color: '#ea580c', icon: Flame },
  metal: { name: 'Metal', color: '#94a3b8', icon: Shield },
};

const SKILL_INFO: Record<ActiveSkillType, { name: string, color: string, icon: any }> = {
  meteor: { name: 'Meteor', color: '#ef4444', icon: Crosshair },
  freeze: { name: 'Freeze', color: '#3b82f6', icon: Timer },
  storm: { name: 'Storm', color: '#eab308', icon: CloudLightning },
  heal: { name: 'Heal', color: '#f43f5e', icon: Heart },
  haste: { name: 'Haste', color: '#fcd34d', icon: FastForward },
  empower: { name: 'Empower', color: '#dc2626', icon: Swords },
  poisonCloud: { name: 'Poison Cloud', color: '#22c55e', icon: CloudRain },
  blackhole: { name: 'Black Hole', color: '#6d28d9', icon: CircleDot },
  goldRush: { name: 'Gold Rush', color: '#fbbf24', icon: Coins },
  shockwave: { name: 'Shockwave', color: '#0ea5e9', icon: Waves },
  barrier: { name: 'Barrier', color: '#38bdf8', icon: Shield },
  armageddon: { name: 'Armageddon', color: '#b91c1c', icon: Flame },
  timeWarp: { name: 'Time Warp', color: '#a855f7', icon: Timer },
};

function GameScreen({ stageIndex, onBack }: { stageIndex: number, onBack: () => void }) {
  const [selectedType, setSelectedType] = useState<TowerType>('fire');
  const [hoverCell, setHoverCell] = useState<{ x: number, y: number } | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(getMuted());
  const [selectedSkill, setSelectedSkill] = useState<ActiveSkillType | null>(null);
  const { gameState, enemies, towers, attackEffects, gameSpeed, skillCooldownsRef, globalFreezeTimerRef, setGameSpeed, startWave, placeTower, sellTower, upgradeTower, evolveTower, setTowerTargeting, useSkill, getPointOnPath, saveDataRef, waveRewards, selectReward, globalBuffs } = useGameLoop(stageIndex);
  const { t, lang } = useI18n();
  const PATH_POINTS = MAP_STAGES[stageIndex];

  const handleGridClick = (x: number, y: number) => {
    if (selectedSkill === 'meteor') {
      const cx = (x + 0.5) / GRID_COLS;
      const cy = (y + 0.5) / GRID_ROWS;
      const success = useSkill('meteor', cx, cy);
      if (success) setSelectedSkill(null);
      return;
    }

    const existing = towers.find(t => t.x === x && t.y === y);
    if (existing) {
      setSelectedTowerId(existing.id);
    } else {
      placeTower(x, y, selectedType);
      setSelectedTowerId(null);
    }
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column',
      background: `radial-gradient(circle at center, #1a0505, #050505)`,
    }}>

      {/* HEADER HUD */}
      <header className="glass-panel game-header" style={{
        margin: '16px', padding: '12px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 10
      }}>
        <div className="game-header-top" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', flexShrink: 0 }}>
          <button onClick={onBack} title="Back to Title" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <X size={24} />
          </button>
          <Gem size={24} style={{ marginLeft: '4px' }} className="hide-on-mobile" />
          <span className="title-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t('manaCrystal')}</span>

          <button onClick={() => setIsMuted(toggleMuted())} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        <div className="game-header-stats" style={{ display: 'flex', gap: '12px', fontWeight: 600, flexWrap: 'wrap', justifyContent: 'flex-end', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308' }}>
            <Coins size={16} /> {gameState.mana}
          </div>
          {saveDataRef.current.upgrades.unlockedSP > 0 && (
            <div title="Skill Points" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
              ✨ {Math.floor(gameState.sp)} / {gameState.maxSp}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
            <ShieldCheck size={16} /> {gameState.crystalHp}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.2)', padding: '2px 6px', borderRadius: '12px', fontSize: '0.8rem' }}>
            {t('enemies')}: {gameState.isPlaying ? `${gameState.remainingEnemies} / ${gameState.totalEnemies}` : gameState.totalEnemies}
          </div>
        </div>
      </header>

      {/* TOWER SELECTOR */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', padding: '0 16px', zIndex: 10, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {(saveDataRef.current.customDecks[saveDataRef.current.activeDeckIndex]?.towers as TowerType[] || [])
          .filter(type => {
            if (['fire', 'ice', 'thunder'].includes(type)) return true;
            const key = `unlocked${type.charAt(0).toUpperCase() + type.slice(1)}`;
            return (saveDataRef.current.upgrades as any)[key] > 0;
          })
          .map(type => {
            const Icon = TOWER_INFO[type].icon;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="glass-panel"
                style={{
                  flex: '0 0 auto', padding: '10px', border: 'none', cursor: 'pointer',
                  color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center',
                  background: selectedType === type ? 'rgba(255,255,255,0.1)' : 'var(--glass-bg)',
                  boxShadow: selectedType === type ? `0 0 15px ${TOWER_INFO[type].color}55` : 'none',
                  borderBottom: `4px solid ${selectedType === type ? TOWER_INFO[type].color : 'transparent'}`,
                  transition: 'all 0.2s ease',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  minWidth: '80px'
                }}
              >
                <Icon size={20} color={TOWER_INFO[type].color} /> {t(type)}
              </button>
            )
          })}
      </div>

      {/* GAME BOARD BATTLEFIELD */}
      <div style={{
        flex: 1, position: 'relative', margin: '8px 16px', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', border: '1px solid rgba(185, 28, 28, 0.4)',
        background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(8px)',
        minHeight: '200px', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key="board"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* GLOBAL FREEZE VISUAL OVERLAY */}
            {globalFreezeTimerRef.current > 0 && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(59, 130, 246, 0.15)',
                pointerEvents: 'none', zIndex: 9,
                boxShadow: 'inset 0 0 100px rgba(59, 130, 246, 0.4)'
              }} />
            )}

            {/* Draw Path SVG overlay */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <defs>
                <style>
                  {`
                    @keyframes dashFlow {
                      from { stroke-dashoffset: 0; }
                      to { stroke-dashoffset: -50; }
                    }
                  `}
                </style>
                <radialGradient id="fireSplash">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Base Path Shadow */}
              {PATH_POINTS.slice(0, -1).map((p, i) => (
                <line
                  key={`base-${i}`}
                  x1={`${p.x * 100}%`} y1={`${p.y * 100}%`}
                  x2={`${PATH_POINTS[i + 1].x * 100}%`} y2={`${PATH_POINTS[i + 1].y * 100}%`}
                  className="path-trench"
                />
              ))}

              {/* Inner Path Core */}
              {PATH_POINTS.slice(0, -1).map((p, i) => (
                <line
                  key={`core-${i}`}
                  x1={`${p.x * 100}%`} y1={`${p.y * 100}%`}
                  x2={`${PATH_POINTS[i + 1].x * 100}%`} y2={`${PATH_POINTS[i + 1].y * 100}%`}
                  className="path-core"
                />
              ))}

              {/* White Dashed Flow Line */}
              {PATH_POINTS.slice(0, -1).map((p, i) => (
                <line
                  key={`dash-${i}`}
                  x1={`${p.x * 100}%`} y1={`${p.y * 100}%`}
                  x2={`${PATH_POINTS[i + 1].x * 100}%`} y2={`${PATH_POINTS[i + 1].y * 100}%`}
                  className="path-energy"
                />
              ))}

              {/* Red Line Indicating Enemy Route Before Wave Starts */}
              {!gameState.isPlaying && PATH_POINTS.slice(0, -1).map((p, i) => (
                <line
                  key={`red-${i}`}
                  x1={`${p.x * 100}%`} y1={`${p.y * 100}%`}
                  x2={`${PATH_POINTS[i + 1].x * 100}%`} y2={`${PATH_POINTS[i + 1].y * 100}%`}
                  stroke="#991b1b" strokeWidth="8" strokeLinejoin="miter" strokeLinecap="square"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(185, 28, 28, 0.8))' }}
                />
              ))}


              {/* Tower Attack Ranges */}
              {towers.map(t => {
                const isHovered = hoverCell && hoverCell.x === t.x && hoverCell.y === t.y;
                if (t.id !== selectedTowerId && !isHovered) return null;
                return (
                  <circle
                    key={`range-${t.id}`}
                    cx={`${(t.x + 0.5) / GRID_COLS * 100}%`}
                    cy={`${(t.y + 0.5) / GRID_ROWS * 100}%`}
                    r={`${t.range * 100}%`}
                    fill={TOWER_INFO[t.type].color}
                    fillOpacity="0.05"
                    stroke={TOWER_INFO[t.type].color}
                    strokeOpacity="0.3"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Attack Beams/Projectiles */}
              {attackEffects.map(fx => {
                if (fx.type === 'fire') {
                  return (
                    <circle
                      key={fx.id}
                      cx={`${fx.endX * 100}%`}
                      cy={`${fx.endY * 100}%`}
                      r="8%"
                      fill="url(#fireSplash)"
                    />
                  );
                }
                return (
                  <line
                    key={fx.id}
                    x1={`${fx.startX * 100}%`}
                    y1={`${fx.startY * 100}%`}
                    x2={`${fx.endX * 100}%`}
                    y2={`${fx.endY * 100}%`}
                    stroke={TOWER_INFO[fx.type].color}
                    strokeWidth={fx.type === 'thunder' ? 6 : 3}
                    strokeOpacity={0.8}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {/* Grid for Towers */}
            <div style={{
              position: 'absolute', inset: 0, display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}>
              {Array.from({ length: GRID_ROWS }).map((_, y) => (
                Array.from({ length: GRID_COLS }).map((_, x) => {
                  const isPath = isPathCell(x, y, stageIndex);
                  const isHover = hoverCell?.x === x && hoverCell?.y === y;

                  let isMeteorTarget = false;
                  if (selectedSkill === 'meteor' && hoverCell) {
                    const cx = (hoverCell.x + 0.5) / GRID_COLS;
                    const cy = (hoverCell.y + 0.5) / GRID_ROWS;
                    const cellX = (x + 0.5) / GRID_COLS;
                    const cellY = (y + 0.5) / GRID_ROWS;
                    if (Math.hypot(cellX - cx, cellY - cy) <= 0.25) {
                      isMeteorTarget = true;
                    }
                  }

                  return (
                    <div key={`${x}-${y}`}
                      onClick={() => handleGridClick(x, y)}
                      onMouseEnter={() => setHoverCell({ x, y })}
                      onMouseLeave={() => setHoverCell(null)}
                      style={{
                        border: '1px solid rgba(255,255,255,0.02)',
                        background: isMeteorTarget ? 'rgba(239, 68, 68, 0.3)' : (isHover && selectedSkill !== 'meteor' ? (isPath ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)') : 'transparent'),
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: selectedSkill === 'meteor' ? 'crosshair' : 'pointer',
                        zIndex: 2
                      }}
                    >
                      {/* Show Tower if exists */}
                      {(() => {
                        const tower = towers.find(t => t.x === x && t.y === y);
                        if (!tower) return null;
                        const Icon = TOWER_INFO[tower.type].icon;
                        const tColor = TOWER_INFO[tower.type].color;
                        return (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              width: '70%', height: '70%',
                              position: 'relative',
                              display: 'flex', justifyContent: 'center', alignItems: 'center',
                              opacity: selectedTowerId ? (selectedTowerId === tower.id ? 1 : 0.5) : 1
                            }}
                          >
                            <div className="tower-base" />
                            {tower.level >= 2 && <div className="tower-ring" style={{ color: tColor }} />}
                            {tower.level >= 3 && <div className="tower-ring-reverse" style={{ color: tColor }} />}
                            <div className="tower-core" style={{
                              width: '80%', height: '80%',
                              color: tColor,
                              background: `radial-gradient(circle at 30% 30%, ${tColor}ff, ${tColor}44)`
                            }}>
                              <Icon size={20} color="white" style={{ filter: 'drop-shadow(0 0 2px black)' }} />
                            </div>
                          </motion.div>
                        );
                      })()}
                    </div>
                  );
                })
              ))}
            </div>

            {/* Enemies */}
            {enemies.map(e => {
              const pos = getPointOnPath(e.progress, stageIndex);

              let eColor = '#cbd5e1';
              let eSize = 20;
              if (e.type === 'orc') {
                eColor = '#65a30d'; // Green
                eSize = 28;
              } else if (e.type === 'boss') {
                eColor = '#b91c1c'; // Dark Red
                eSize = 48;
              }

              const isSlowed = e.debuffs.some(d => d.type === 'slow');
              const isDead = e.hp <= 0;

              return !isDead ? (
                <div key={e.id} style={{
                  position: 'absolute',
                  zIndex: 10,
                  left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${eSize}px`, height: `${eSize}px`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center',
                  color: isSlowed ? '#60a5fa' : eColor
                }}>
                  <div className="enemy-core" style={{
                    background: `radial-gradient(circle at 30% 30%, ${isSlowed ? '#60a5fa' : eColor}, #000)`,
                    border: isSlowed ? '2px solid white' : 'none'
                  }} />
                  {/* HP Bar */}
                  <div style={{
                    position: 'absolute', top: '-10px', width: '30px', height: '4px',
                    background: 'rgba(0,0,0,0.8)', borderRadius: '2px',
                    border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(e.hp / e.maxHp) * 100}%`, height: '100%',
                      background: `linear-gradient(90deg, ${isSlowed ? '#3b82f6' : '#10b981'}, #34d399)`,
                      boxShadow: '0 0 5px #10b981'
                    }} />
                  </div>
                </div>
              ) : null;
            })}

            {/* Dark Crystal at End */}
            <div style={{
              position: 'absolute', right: '0%', bottom: '25%', transform: 'translate(50%, 50%)',
              width: '60px', height: '100px', background: 'rgba(153, 27, 27, 0.4)',
              border: '2px solid #b91c1c', boxShadow: '0 0 30px #991b1b',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              zIndex: 5
            }}>
              <div style={{ position: 'absolute', inset: '10%', background: 'linear-gradient(to bottom, #7f1d1d, #450a0a)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            </div>

            {/* Win/Loss Screen */}



            {(gameState.isGameOver || gameState.isVictory) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.85)', zIndex: 100,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <h1 className="title-display" style={{
                  fontSize: '5rem', color: gameState.isVictory ? '#fbbf24' : '#b91c1c',
                  textShadow: `0 0 20px ${gameState.isVictory ? '#fbbf24' : '#ef4444'}`,
                  marginBottom: '20px', letterSpacing: '8px', textAlign: 'center',
                  background: `linear-gradient(to bottom, ${gameState.isVictory ? '#fef3c7, #f59e0b' : '#fca5a5, #7f1d1d'})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {gameState.isVictory ? t('victory') : t('crystalShattered')}
                </h1>
                <p className="title-display" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center', letterSpacing: '4px' }}>
                  {gameState.isVictory ? t('victoryDesc') : t('defeatDesc')}
                  <br /><br />
                  <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{t('shardsAcquired', gameState.sessionPoints)}</span>
                </p>
                <button onClick={() => window.location.reload()} className="glass-panel title-display" style={{
                  padding: '16px 32px', fontSize: '1.2rem',
                  border: '1px solid rgba(185, 28, 28, 0.5)',
                  color: 'white', cursor: 'pointer',
                  fontWeight: 'bold', letterSpacing: '2px',
                  background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.4), rgba(69, 10, 10, 0.6))'
                }}>
                  {t('returnToForge')}
                </button>
              </motion.div>
            )}

            {/* WAVE REWARDS MODAL */}
            {waveRewards && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.85)', zIndex: 110,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center',
                  backdropFilter: 'blur(10px)',
                  padding: '24px'
                }}
              >
                <h2 className="title-display" style={{ color: '#fbbf24', fontSize: '2rem', marginBottom: '8px', textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>
                  {t('reward_select')}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>Choose a blessing for the battles ahead.</p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {waveRewards.map((reward, i) => (
                    <motion.button
                      key={reward.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => selectReward(reward)}
                      className="glass-panel"
                      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(251, 191, 36, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        padding: '24px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                        width: '220px',
                        cursor: 'pointer',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.9), rgba(10, 10, 10, 0.95))'
                      }}
                    >
                      <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fbbf24', fontSize: '2rem'
                      }}>
                        {reward.type.includes('crystal') ? <Gem size={32} /> : reward.type.includes('coin') || reward.type.includes('income') ? <Coins size={32} /> : reward.type.includes('sp') ? <Sparkles size={32} /> : <Swords size={32} />}
                      </div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', minHeight: '48px', display: 'flex', alignItems: 'center' }}>
                        {/* We can use translation by mapping the description key */}
                        {t(reward.descriptionKey as any, reward.value)}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Tower Selection UI (Moved outside battlefield to prevent clipping) */}
      <AnimatePresence>
        {selectedTowerId && (
          <motion.div
            key={`stats-${selectedTowerId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel"
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '320px', padding: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '16px',
              pointerEvents: 'auto', maxHeight: '90dvh', overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
            }}
          >
            {(() => {
              const st = towers.find(t => t.id === selectedTowerId);
              if (!st) {
                return null;
              }
              const Icon = TOWER_INFO[st.type].icon;

              const maxLevel = 3;
              const canEvolve = st.level >= maxLevel && ['fire', 'ice', 'thunder'].includes(st.type);
              const upgCost = 50 * Math.pow(2, st.level - 1);
              const canAffordUpg = gameState.mana >= upgCost;
              const evoCost = 250;
              const canAffordEvo = gameState.mana >= evoCost;

              const getEvolutions = (type: TowerType): TowerType[] => {
                if (type === 'fire') return ['volcano', 'magma'];
                if (type === 'ice') return ['blizzard', 'frostbite'];
                if (type === 'thunder') return ['chain', 'sniper'];
                return [];
              };

              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: TOWER_INFO[st.type].color, fontWeight: 'bold', fontSize: '1.2rem' }}>
                      <Icon size={24} /> {t(st.type)}
                    </div>
                    <button onClick={() => setSelectedTowerId(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                      <X size={24} />
                    </button>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <p style={{ margin: 0 }}>{st.level >= maxLevel && !canEvolve ? t('maxLevelReached') : t('level', st.level)}</p>
                    </div>
                    <p style={{ margin: '0 0 4px 0' }}>{t('damage', st.damage)}</p>
                    <p style={{ margin: '0 0 4px 0' }}>{t('range', (st.range * 100).toFixed(0))}</p>
                    <p style={{ margin: '0 0 0 0' }}>{t('fireRate', (1000 / st.fireRate).toFixed(1))}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t('targetPriority')}:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['first', 'last', 'strongest', 'weakest'] as TargetPriority[]).map(p => (
                        <button
                          key={p}
                          onClick={() => setTowerTargeting(st.id, p)}
                          style={{
                            flex: 1, padding: '4px 2px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: 'bold',
                            background: st.targeting === p ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                            color: st.targeting === p ? 'white' : '#94a3b8',
                            transition: 'background 0.2s'
                          }}
                        >
                          {t(`target_${p}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {canEvolve ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', background: 'rgba(255,215,0,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,215,0,0.3)' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#fde047', textAlign: 'center' }}>{t('evolutionChoose')} ({evoCost} Mana)</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {getEvolutions(st.type).map(evo => (
                          <button
                            key={evo}
                            onClick={() => evolveTower(st.id, evo)}
                            disabled={!canAffordEvo}
                            style={{
                              flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: canAffordEvo ? 'pointer' : 'not-allowed',
                              background: canAffordEvo ? TOWER_INFO[evo].color : '#374151', color: canAffordEvo ? 'white' : 'rgba(255,255,255,0.4)',
                              fontWeight: 'bold', fontSize: '0.8rem', transition: 'all 0.2s'
                            }}
                          >
                            {t(evo)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => { upgradeTower(st.id); }}
                        disabled={!canAffordUpg || st.level >= maxLevel}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                          background: (canAffordUpg && st.level < maxLevel) ? '#3b82f6' : '#374151',
                          color: (canAffordUpg && st.level < maxLevel) ? 'white' : 'rgba(255,255,255,0.4)',
                          fontWeight: 'bold', cursor: (canAffordUpg && st.level < maxLevel) ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
                        }}
                      >
                        {st.level >= maxLevel ? t('maxLevel') : `${t('upgrade')} (${upgCost})`}
                      </button>

                      <button
                        onClick={() => { sellTower(st.x, st.y); setSelectedTowerId(null); }}
                        style={{
                          flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                          background: '#ef4444', color: 'white',
                          fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {t('sell', 50)}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SKILL BAR */}
      <div className="hide-scrollbar" style={{ padding: '0 16px', display: 'flex', gap: '12px', zIndex: 10, marginBottom: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {saveDataRef.current.upgrades.unlockedSP > 0 && (saveDataRef.current.customDecks[saveDataRef.current.activeDeckIndex]?.skills as ActiveSkillType[] || [])
          .filter(skill => {
            if (skill === 'meteor') return saveDataRef.current.upgrades.unlockedSP > 0;
            if (skill === 'freeze') return saveDataRef.current.upgrades.unlockedFreeze > 0;
            if (skill === 'storm') return saveDataRef.current.upgrades.unlockedStorm > 0;
            const key = `unlocked${skill.charAt(0).toUpperCase() + skill.slice(1)}`;
            return (saveDataRef.current.upgrades as any)[key] > 0;
          })
          .map(skill => {
            const cd = skillCooldownsRef.current[skill];

            const costs: Record<string, number> = {
              meteor: 100, freeze: 150, storm: 200,
              heal: 100, haste: 150, empower: 150, poisonCloud: 200,
              blackhole: 250, goldRush: 150, shockwave: 200,
              barrier: 150, armageddon: 300, timeWarp: 250
            };
            const cooldowns: Record<string, number> = {
              meteor: 30000, freeze: 45000, storm: 45000,
              heal: 30000, haste: 45000, empower: 45000, poisonCloud: 45000,
              blackhole: 60000, goldRush: 45000, shockwave: 45000,
              barrier: 30000, armageddon: 90000, timeWarp: 60000
            };

            const maxCd = cooldowns[skill] || 45000;
            const cost = costs[skill] || 150;
            const isReady = cd <= 0;
            const canAfford = gameState.sp >= cost;
            const SkillIcon = SKILL_INFO[skill].icon;

            const handleSkillClick = () => {
              if (!isReady || !canAfford) return;
              if (skill === 'meteor') {
                setSelectedSkill(prev => prev === 'meteor' ? null : 'meteor');
              } else {
                useSkill(skill);
              }
            };

            return (
              <div key={skill} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={handleSkillClick}
                  title={t(skill)}
                  className="glass-panel"
                  style={{
                    flex: '0 0 auto',
                    width: '46px', height: '46px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${selectedSkill === skill ? '#ef4444' : (isReady && canAfford ? '#3b82f6' : '#475569')}`,
                    background: isReady ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.8)',
                    color: isReady && canAfford ? 'white' : '#64748b',
                    cursor: isReady && canAfford ? 'pointer' : 'not-allowed',
                    position: 'relative', overflow: 'hidden', padding: 0
                  }}
                >
                  {!isReady && (
                    <>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%',
                        height: `${(cd / maxCd) * 100}%`,
                        background: 'rgba(239, 68, 68, 0.4)', zIndex: 1
                      }} />
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.6)', zIndex: 2,
                        color: 'white', fontWeight: 'bold', fontSize: '1rem',
                        textShadow: '0 0 4px black'
                      }}>
                        {Math.ceil(cd / 1000)}s
                      </div>
                    </>
                  )}
                  <div style={{ zIndex: 1, opacity: isReady ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SkillIcon size={24} color={SKILL_INFO[skill].color} />
                  </div>
                </button>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: canAfford ? '#38bdf8' : '#ef4444', fontWeight: 'bold' }}>
                  {cost} SP
                </div>
              </div>
            )
          })}
      </div>

      {/* FOOTER CONTROLS */}
      <footer className="glass-panel" style={{
        margin: '8px 16px 16px 16px', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 10
      }}>
        {!gameState.isPlaying && !waveRewards ? (
          <button onClick={startWave} className="title-display" style={{
            padding: '12px 24px', borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(to right, #7f1d1d, #450a0a)', color: 'white', border: '1px solid #b91c1c',
            fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '2px',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(153, 27, 27, 0.5)'
          }}>
            <Play fill="white" /> {t('summonWave', gameState.wave + 1, gameState.totalEnemies)}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <button onClick={() => setGameSpeed(0)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                background: gameSpeed === 0 ? '#ef4444' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem'
              }}>
                <Pause size={14} /> {t('pause')}
              </button>
              <button onClick={() => setGameSpeed(1)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                background: gameSpeed === 1 ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem'
              }}>
                <Play size={14} /> 1x
              </button>
              <button onClick={() => setGameSpeed(2)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                background: gameSpeed === 2 ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem'
              }}>
                <FastForward size={14} /> 2x
              </button>
              <button onClick={() => setGameSpeed(3)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                background: gameSpeed === 3 ? '#ec4899' : 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem'
              }}>
                <FastForward size={14} fill="white" /> 3x
              </button>
            </div>

            <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem', textAlign: 'center' }}>
              {t('defendingWave', gameState.wave)} {t('remaining', enemies.length)}
              {gameState.wave % 5 === 0 && <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: '#ef4444' }}>{t('bossWarning')}</span>}
            </div>
          </div>
        )}
      </footer>

    </div >
  );
}

function MainApp() {
  const [view, setView] = useState<'title' | 'stage-select' | 'game' | 'how-to-play' | 'upgrades' | 'bestiary' | 'deck'>('title');
  const [stageIndex, setStageIndex] = useState(0);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {view === 'title' ? (
          <TitleScreen key="title" onStart={() => setView('stage-select')} onHowToPlay={() => setView('how-to-play')} onUpgrades={() => setView('upgrades')} onBestiary={() => setView('bestiary')} onDeck={() => setView('deck')} />
        ) : view === 'stage-select' ? (
          <StageSelectScreen key="stage-select" onBack={() => setView('title')} onSelect={(idx) => { setStageIndex(idx); setView('game'); }} />
        ) : view === 'how-to-play' ? (
          <HowToPlayScreen key="how-to-play" onBack={() => setView('title')} />
        ) : view === 'upgrades' ? (
          <UpgradesScreen key="upgrades" onBack={() => setView('title')} />
        ) : view === 'bestiary' ? (
          <BestiaryScreen key="bestiary" onBack={() => setView('title')} />
        ) : view === 'deck' ? (
          <DeckScreen key="deck" onBack={() => setView('title')} />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          >
            <GameScreen stageIndex={stageIndex} onBack={() => setView('title')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
