import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { loadSaveData, saveGameData } from './saveSystem';

export type TowerType = 'fire' | 'ice' | 'thunder' | 'volcano' | 'magma' | 'blizzard' | 'frostbite' | 'chain' | 'sniper' | 'poison' | 'wind' | 'earth' | 'light' | 'dark' | 'water' | 'nature' | 'arcane' | 'lava' | 'metal';
export type EnemyType = 'goblin' | 'orc' | 'boss';
export type ActiveSkillType = 'meteor' | 'freeze' | 'storm' | 'heal' | 'haste' | 'empower' | 'poisonCloud' | 'blackhole' | 'goldRush' | 'shockwave' | 'barrier' | 'armageddon' | 'timeWarp';

export type Debuff = {
    type: 'slow' | 'dot' | 'root';
    value: number; // multiplier of speed OR damage per second
    duration: number; // ms left
};

export type TargetPriority = 'first' | 'last' | 'strongest' | 'weakest';

export type Enemy = {
    id: string;
    type: EnemyType;
    progress: number;
    hp: number;
    maxHp: number;
    speed: number;
    baseSpeed: number;
    worth: number;
    debuffs: Debuff[];
};

export type Tower = {
    id: string;
    x: number;
    y: number;
    type: TowerType;
    level: number;
    damage: number;
    range: number;
    fireRate: number;
    lastFire: number;
    targeting: TargetPriority;
};

export type AttackEffect = {
    id: string;
    type: TowerType;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    timestamp: number;
};

export const MAP_STAGES = [
    [ // Stage 1 (Classic)
        { x: 0.08, y: 0.2 }, { x: 0.75, y: 0.2 }, { x: 0.75, y: 0.6 },
        { x: 0.15, y: 0.6 }, { x: 0.15, y: 0.75 }, { x: 1.0, y: 0.75 }
    ],
    [ // Stage 2 (Serpent)
        { x: 0.15, y: 0.15 }, { x: 0.85, y: 0.15 }, { x: 0.85, y: 0.4 },
        { x: 0.15, y: 0.4 }, { x: 0.15, y: 0.65 }, { x: 0.85, y: 0.65 },
        { x: 0.85, y: 0.9 }, { x: 1.0, y: 0.9 }
    ],
    [ // Stage 3 (ZigZag)
        { x: 0.05, y: 0.8 }, { x: 0.25, y: 0.2 }, { x: 0.45, y: 0.8 },
        { x: 0.65, y: 0.2 }, { x: 0.85, y: 0.8 }, { x: 1.0, y: 0.5 }
    ]
];

export const GRID_COLS = 12;
export const GRID_ROWS = 12;

export const ALL_PATH_SEGMENTS = MAP_STAGES.map(path => {
    let total = 0;
    const segs = [];
    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        segs.push({ len, p1, p2 });
        total += len;
    }
    return { segs, total };
});

export function getPointOnPath(progress: number, stageIndex: number) {
    const segments = ALL_PATH_SEGMENTS[stageIndex];
    let currentLen = progress * segments.total;

    for (let i = 0; i < segments.segs.length; i++) {
        const seg = segments.segs[i];
        if (currentLen <= seg.len || i === segments.segs.length - 1) {
            const ratio = seg.len === 0 ? 1 : Math.max(0, Math.min(1, currentLen / seg.len));
            return {
                x: seg.p1.x + (seg.p2.x - seg.p1.x) * ratio,
                y: seg.p1.y + (seg.p2.y - seg.p1.y) * ratio,
            };
        }
        currentLen -= seg.len;
    }
    return MAP_STAGES[stageIndex][MAP_STAGES[stageIndex].length - 1]; // safety
}

export function isPathCell(gridX: number, gridY: number, stageIndex: number): boolean {
    const cx = (gridX + 0.5) / GRID_COLS;
    const cy = (gridY + 0.5) / GRID_ROWS;
    const path = MAP_STAGES[stageIndex];

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        let t = 0;
        if (l2 !== 0) {
            t = Math.max(0, Math.min(1, ((cx - p1.x) * (p2.x - p1.x) + (cy - p1.y) * (p2.y - p1.y)) / l2));
        }
        const projX = p1.x + t * (p2.x - p1.x);
        const projY = p1.y + t * (p2.y - p1.y);
        const dist = Math.sqrt(Math.pow(cx - projX, 2) + Math.pow(cy - projY, 2));

        if (dist < 0.055) return true; // Slightly larger than path width
    }
    return false;
}

export function useGameLoop(stageIndex: number = 0) {
    const saveDataRef = useRef(loadSaveData());

    const [gameState, setGameState] = useState({
        mana: 150,
        sp: 0,
        maxSp: 100 + (saveDataRef.current.upgrades.spCap * 50),
        crystalHp: 20 + saveDataRef.current.upgrades.baseHealth * 5,
        wave: 0,
        totalEnemies: 10,
        remainingEnemies: 10,
        sessionPoints: 0,
        isPlaying: false,
        isGameOver: false,
        isVictory: false
    });

    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [towers, setTowers] = useState<Tower[]>([]);
    const [attackEffects, setAttackEffects] = useState<AttackEffect[]>([]);
    const [gameSpeed, setGameSpeed] = useState<number>(1);

    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const gameTimeRef = useRef<number>(0);

    const gameSpeedRef = useRef(gameSpeed);
    useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);

    const globalFreezeTimerRef = useRef(0);
    const skillCooldownsRef = useRef<Record<ActiveSkillType, number>>({
        meteor: 0, freeze: 0, storm: 0, heal: 0, haste: 0, empower: 0,
        poisonCloud: 0, blackhole: 0, goldRush: 0, shockwave: 0, barrier: 0, armageddon: 0, timeWarp: 0
    });
    const activeBuffsRef = useRef({ haste: 0, empower: 0, goldRush: 0, barrier: 0 });

    const waveSpawningRef = useRef(false);
    const enemiesToSpawnRef = useRef(0);
    const lastSpawnTimeRef = useRef(0);
    const enemiesRef = useRef(enemies);
    const towersRef = useRef(towers);
    const manaRef = useRef(gameState.mana);
    const spRef = useRef(gameState.sp);
    const spAccumulatorRef = useRef(0);
    const crystalHpRef = useRef(gameState.crystalHp);

    useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
    useEffect(() => { towersRef.current = towers; }, [towers]);
    useEffect(() => { manaRef.current = gameState.mana; }, [gameState.mana]);
    useEffect(() => { spRef.current = gameState.sp; }, [gameState.sp]);
    useEffect(() => { crystalHpRef.current = gameState.crystalHp; }, [gameState.crystalHp]);

    const tick = useCallback((time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const realDt = time - lastTimeRef.current;
        lastTimeRef.current = time;

        // Update real-time skill cooldowns regardless of game pause state
        for (const key of Object.keys(skillCooldownsRef.current) as ActiveSkillType[]) {
            if (skillCooldownsRef.current[key] > 0) {
                skillCooldownsRef.current[key] = Math.max(0, skillCooldownsRef.current[key] - realDt);
            }
        }

        if (!gameState.isPlaying || gameState.isGameOver || gameState.isVictory) {
            requestRef.current = requestAnimationFrame(tick);
            return;
        }

        if (gameSpeedRef.current === 0) {
            requestRef.current = requestAnimationFrame(tick);
            return;
        }

        const dt = realDt * gameSpeedRef.current;
        gameTimeRef.current += dt;
        const tNow = gameTimeRef.current;

        if (globalFreezeTimerRef.current > 0) {
            globalFreezeTimerRef.current -= dt;
        }

        // Update buffs
        for (const buff of ['haste', 'empower', 'goldRush'] as const) {
            if (activeBuffsRef.current[buff] > 0) {
                activeBuffsRef.current[buff] -= dt;
            }
        }

        let updatedEnemies = [...enemiesRef.current];
        let hpLost = 0;
        let earnedMana = 0;
        let earnedPoints = 0;
        let currentEarnedSp = 0;
        let newEffects: AttackEffect[] = [];

        if (waveSpawningRef.current || updatedEnemies.length > 0) {
            const genRate = 1.5 + (saveDataRef.current.upgrades.spGenRate * 0.5);
            spAccumulatorRef.current += (genRate * dt) / 1000;
            if (spAccumulatorRef.current >= 1) {
                currentEarnedSp = Math.floor(spAccumulatorRef.current);
                spAccumulatorRef.current -= currentEarnedSp;
            }
        }

        // 1. Spawning
        if (waveSpawningRef.current && tNow - lastSpawnTimeRef.current > 1200) {
            if (enemiesToSpawnRef.current > 0) {
                let eType: EnemyType = 'goblin'; // base
                let hpMult = 1;
                let spdMult = 1;

                const waveScale = 1 + Math.floor((gameState.wave - 1) / 5) * 0.5;

                if (gameState.wave > 0 && gameState.wave % 5 === 0 && enemiesToSpawnRef.current === 1) {
                    eType = 'boss';
                    hpMult = 40 * waveScale;
                    spdMult = 0.4;
                } else if (Math.random() < 0.3) {
                    eType = 'orc'; // slow but tanky
                    hpMult = 3 * waveScale;
                    spdMult = 0.6;
                } else {
                    hpMult = 1 * waveScale;
                }

                const maxHp = (40 + (gameState.wave * 12)) * hpMult;
                const baseSpeed = (0.04 + Math.random() * 0.01) * spdMult;

                updatedEnemies.push({
                    id: uuidv4(),
                    type: eType,
                    progress: 0,
                    hp: maxHp,
                    maxHp,
                    speed: baseSpeed,
                    baseSpeed,
                    worth: eType === 'boss' ? 50 : (eType === 'orc' ? 10 : 5),
                    debuffs: []
                });

                enemiesToSpawnRef.current--;
                lastSpawnTimeRef.current = tNow;
            } else {
                waveSpawningRef.current = false;
            }
        }

        // 2. Process Debuffs and Move Enemies
        for (let i = updatedEnemies.length - 1; i >= 0; i--) {
            let e = updatedEnemies[i];

            // apply debuffs
            let currentSpeedMult = 1;
            let isRooted = false;
            for (let j = e.debuffs.length - 1; j >= 0; j--) {
                const db = e.debuffs[j];
                db.duration -= dt;

                if (db.type === 'dot') {
                    // db.value is damage per second
                    e.hp -= (db.value * dt) / 1000;
                }

                if (db.duration <= 0) {
                    e.debuffs.splice(j, 1);
                } else if (db.type === 'slow') {
                    currentSpeedMult = Math.min(currentSpeedMult, db.value);
                } else if (db.type === 'root') {
                    isRooted = true;
                }
            }
            e.speed = isRooted ? 0 : e.baseSpeed * currentSpeedMult;

            // move
            if (globalFreezeTimerRef.current <= 0) {
                e.progress += (e.speed * dt) / 1000;
            }

            if (e.hp <= 0) {
                let manaEarned = e.worth;
                if (activeBuffsRef.current.goldRush > 0) manaEarned *= 2;
                earnedMana += manaEarned;
                earnedPoints += (e.type === 'boss' ? 50 : 10);
                updatedEnemies.splice(i, 1);
                setGameState(prev => ({ ...prev, remainingEnemies: prev.remainingEnemies - 1 }));
            } else if (e.progress >= 1) {
                if (activeBuffsRef.current.barrier > 0) {
                    activeBuffsRef.current.barrier -= 1; // consume 1 charge
                    hpLost += 0;
                } else {
                    hpLost += (e.type === 'boss' ? 5 : 1);
                }
                updatedEnemies.splice(i, 1);
                setGameState(prev => ({ ...prev, remainingEnemies: prev.remainingEnemies - 1 }));
            }
        }

        // 3. Towers Attack
        const tUpdates = [...towersRef.current];
        let towersChanged = false;

        tUpdates.forEach(t => {
            let actualFireRate = t.fireRate;
            if (activeBuffsRef.current.haste > 0) actualFireRate /= 2;

            if (tNow - t.lastFire > actualFireRate) {
                const tGridX = (t.x + 0.5) / GRID_COLS;
                const tGridY = (t.y + 0.5) / GRID_ROWS;

                const inRange = updatedEnemies.filter(e => {
                    const pos = getPointOnPath(e.progress, stageIndex);
                    const dist = Math.hypot(pos.x - tGridX, pos.y - tGridY);
                    return dist <= t.range;
                });

                if (inRange.length > 0) {
                    // Sort based on targeting priority
                    if (t.targeting === 'first') {
                        inRange.sort((a, b) => b.progress - a.progress);
                    } else if (t.targeting === 'last') {
                        inRange.sort((a, b) => a.progress - b.progress);
                    } else if (t.targeting === 'strongest') {
                        inRange.sort((a, b) => b.hp - a.hp);
                    } else if (t.targeting === 'weakest') {
                        inRange.sort((a, b) => a.hp - b.hp);
                    }

                    const target = inRange[0];
                    const targetPos = getPointOnPath(target.progress, stageIndex);

                    let finalDamage = t.damage;
                    if (activeBuffsRef.current.empower > 0) finalDamage *= 2;

                    // Apply Attack Logic
                    if (t.type === 'fire' || t.type === 'volcano' || t.type === 'magma') {
                        const splashRadius = t.type === 'volcano' ? 0.30 : (t.type === 'magma' ? 0.05 : 0.15);
                        inRange.forEach(e => {
                            const p = getPointOnPath(e.progress, stageIndex);
                            if (Math.hypot(p.x - targetPos.x, p.y - targetPos.y) <= splashRadius) {
                                e.hp -= finalDamage;
                                if (t.type === 'magma') {
                                    // Burn damage simulation by double hit or just high initial damage
                                    e.hp -= finalDamage * 0.5; // Magma hits ultra hard
                                }
                            }
                        });
                        import('./soundUtils').then(m => m.playSound('fire'));
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'ice' || t.type === 'blizzard' || t.type === 'frostbite') {
                        const slowValue = 0.5 - (saveDataRef.current.upgrades.iceSlow * 0.05);

                        if (t.type === 'frostbite') {
                            // AoE Slow
                            inRange.forEach(e => {
                                const p = getPointOnPath(e.progress, stageIndex);
                                if (Math.hypot(p.x - targetPos.x, p.y - targetPos.y) <= 0.20) {
                                    e.hp -= finalDamage * 0.5;
                                    e.debuffs.push({ type: 'slow', value: Math.max(0.1, slowValue), duration: 2500 });
                                }
                            });
                        } else if (t.type === 'blizzard') {
                            target.hp -= finalDamage;
                            target.debuffs.push({ type: 'slow', value: 0.1, duration: 1500 }); // Heavy stun/freeze
                        } else {
                            target.hp -= finalDamage;
                            target.debuffs.push({ type: 'slow', value: Math.max(0.1, slowValue), duration: 2000 });
                        }

                        import('./soundUtils').then(m => m.playSound('ice'));
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'thunder' || t.type === 'chain' || t.type === 'sniper') {
                        target.hp -= finalDamage;
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });

                        if (t.type === 'chain') {
                            // Hit up to 3 more enemies
                            let chainTargets = inRange.filter(e => e.id !== target.id).slice(0, 3);
                            chainTargets.forEach(e => {
                                e.hp -= finalDamage * 0.5; // less bounce damage
                                const p = getPointOnPath(e.progress, stageIndex);
                                newEffects.push({ id: uuidv4(), type: t.type, startX: targetPos.x, startY: targetPos.y, endX: p.x, endY: p.y, timestamp: tNow });
                            });
                        }

                        import('./soundUtils').then(m => m.playSound('thunder'));
                    } else if (t.type === 'poison') {
                        target.hp -= finalDamage;
                        target.debuffs.push({ type: 'dot', value: finalDamage * 0.5, duration: 3000 });
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'wind') {
                        target.hp -= finalDamage;
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'earth') {
                        inRange.forEach(e => {
                            const p = getPointOnPath(e.progress, stageIndex);
                            if (Math.hypot(p.x - targetPos.x, p.y - targetPos.y) <= 0.25) {
                                e.hp -= finalDamage;
                            }
                        });
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'light') {
                        target.hp -= finalDamage;
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'dark') {
                        target.hp -= finalDamage + (target.hp * 0.05); // 5% current HP
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'water') {
                        target.hp -= finalDamage;
                        inRange.forEach(e => {
                            const p = getPointOnPath(e.progress, stageIndex);
                            if (Math.hypot(p.x - targetPos.x, p.y - targetPos.y) <= 0.20) {
                                e.debuffs.push({ type: 'slow', value: 0.5, duration: 2000 });
                                newEffects.push({ id: uuidv4(), type: 'water', startX: targetPos.x, startY: targetPos.y, endX: p.x, endY: p.y, timestamp: tNow });
                            }
                        });
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'nature') {
                        target.hp -= finalDamage;
                        if (Math.random() < 0.2) {
                            target.debuffs.push({ type: 'root', value: 0, duration: 1000 });
                        }
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'arcane') {
                        target.hp -= finalDamage;
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'lava') {
                        inRange.forEach(e => {
                            const p = getPointOnPath(e.progress, stageIndex);
                            if (Math.hypot(p.x - targetPos.x, p.y - targetPos.y) <= 0.15) {
                                e.hp -= finalDamage;
                                e.debuffs.push({ type: 'dot', value: finalDamage * 0.5, duration: 2000 });
                            }
                        });
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    } else if (t.type === 'metal') {
                        target.hp -= finalDamage;
                        newEffects.push({ id: uuidv4(), type: t.type, startX: tGridX, startY: tGridY, endX: targetPos.x, endY: targetPos.y, timestamp: tNow });
                    }

                    t.lastFire = tNow;
                    towersChanged = true;
                }
            }
        });

        if (towersChanged) {
            setTowers(tUpdates);
        }

        // Cleanup attack effects
        setAttackEffects(prev => {
            const active = prev.filter(e => tNow - e.timestamp < 150);
            return newEffects.length > 0 ? [...active, ...newEffects] : active;
        });

        // Frame updates
        setEnemies(updatedEnemies);

        let waveEnded = !waveSpawningRef.current && updatedEnemies.length === 0;

        if (hpLost > 0 || earnedMana > 0 || currentEarnedSp > 0 || waveEnded) {
            if (waveEnded) {
                setAttackEffects([]);
            }
            setGameState(prev => {
                const currentHealth = prev.crystalHp - hpLost;
                const end = currentHealth <= 0;
                const win = waveEnded && prev.wave >= 10;

                if ((end || win) && !prev.isGameOver && !prev.isVictory) {
                    const currentSave = loadSaveData();
                    currentSave.points += prev.sessionPoints + earnedPoints;

                    if (win && stageIndex === currentSave.unlockedStages - 1) {
                        currentSave.unlockedStages = Math.min(3, currentSave.unlockedStages + 1);
                    }

                    saveGameData(currentSave);
                }

                return {
                    ...prev,
                    crystalHp: currentHealth,
                    sessionPoints: prev.sessionPoints + earnedPoints,
                    mana: prev.mana + earnedMana,
                    sp: Math.min(prev.maxSp, prev.sp + currentEarnedSp),
                    isPlaying: (end || waveEnded) ? false : prev.isPlaying,
                    isGameOver: end,
                    isVictory: win
                };
            });
        }

        requestRef.current = requestAnimationFrame(tick);
    }, [gameState.isPlaying, gameState.isGameOver, gameState.isVictory, gameState.crystalHp, gameState.wave]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [tick]);

    const startWave = () => {
        if (waveSpawningRef.current || enemies.length > 0) return;

        const nextWave = gameState.wave + 1;
        const isBossWave = nextWave % 5 === 0;
        const enemyCount = isBossWave ? 1 : 10 + (nextWave * 3);

        setGameState(prev => ({
            ...prev,
            wave: nextWave,
            isPlaying: true,
            totalEnemies: enemyCount,
            remainingEnemies: enemyCount
        }));

        waveSpawningRef.current = true;
        enemiesToSpawnRef.current = enemyCount;
    };

    const placeTower = (x: number, y: number, type: TowerType) => {
        if (isPathCell(x, y, stageIndex)) return;

        let cost = 50;
        if (type === 'arcane') cost = 150;
        if (type === 'metal') cost = 25;

        if (manaRef.current < cost) return;

        if (towersRef.current.some(t => t.x === x && t.y === y)) return;

        let attrs = { damage: 10, range: 0.25, fireRate: 1000 };
        const rangeUpgrade = saveDataRef.current.upgrades.towerRange * 0.05;

        if (type === 'fire') {
            attrs = { damage: 15 + saveDataRef.current.upgrades.fireDamage * 3, range: 0.15 + rangeUpgrade, fireRate: 1200 };
        } else if (type === 'ice') {
            attrs = { damage: 5, range: 0.20 + rangeUpgrade, fireRate: 800 };
        } else if (type === 'thunder') {
            attrs = { damage: 35 + saveDataRef.current.upgrades.thunderDamage * 5, range: 0.25 + rangeUpgrade, fireRate: 2500 };
        } else if (type === 'poison') {
            attrs = { damage: 2, range: 0.20 + rangeUpgrade, fireRate: 800 };
        } else if (type === 'wind') {
            attrs = { damage: 3, range: 0.20 + rangeUpgrade, fireRate: 300 };
        } else if (type === 'earth') {
            attrs = { damage: 40, range: 0.15 + rangeUpgrade, fireRate: 3000 };
        } else if (type === 'light') {
            attrs = { damage: 15, range: 0.60 + rangeUpgrade, fireRate: 1500 };
        } else if (type === 'dark') {
            attrs = { damage: 0, range: 0.25 + rangeUpgrade, fireRate: 1500 };
        } else if (type === 'water') {
            attrs = { damage: 5, range: 0.25 + rangeUpgrade, fireRate: 1200 };
        } else if (type === 'nature') {
            attrs = { damage: 10, range: 0.20 + rangeUpgrade, fireRate: 1000 };
        } else if (type === 'arcane') {
            attrs = { damage: 50, range: 0.25 + rangeUpgrade, fireRate: 1200 };
        } else if (type === 'lava') {
            attrs = { damage: 20, range: 0.15 + rangeUpgrade, fireRate: 2000 };
        } else if (type === 'metal') {
            attrs = { damage: 15, range: 0.10 + rangeUpgrade, fireRate: 800 };
        }

        setGameState(prev => ({ ...prev, mana: prev.mana - cost }));
        setTowers(prev => [...prev, {
            id: uuidv4(),
            x, y,
            type,
            level: 1,
            damage: attrs.damage,
            range: attrs.range,
            fireRate: attrs.fireRate,
            lastFire: gameTimeRef.current,
            targeting: 'first'
        }]);
    };

    const sellTower = (x: number, y: number) => {
        if (gameState.isPlaying) return;

        const towerIndex = towersRef.current.findIndex(t => t.x === x && t.y === y);
        if (towerIndex === -1) return;

        setTowers(prev => {
            const next = [...prev];
            next.splice(towerIndex, 1);
            return next;
        });
        setGameState(prev => ({ ...prev, mana: prev.mana + 50 }));
        import('./soundUtils').then(m => m.playSound('sell'));
    };

    const upgradeTower = (id: string) => {
        const towerIndex = towersRef.current.findIndex(t => t.id === id);
        if (towerIndex === -1) return;
        const tower = towersRef.current[towerIndex];

        const cost = 50 * Math.pow(2, tower.level - 1);
        if (manaRef.current < cost) return;

        setGameState(prev => ({ ...prev, mana: prev.mana - cost }));
        setTowers(prev => {
            const next = [...prev];
            const t = { ...next[towerIndex] };
            t.level += 1;
            t.damage = Math.floor(t.damage * 1.5);
            t.range *= 1.1;
            t.fireRate *= 0.9;
            next[towerIndex] = t;
            return next;
        });
        import('./soundUtils').then(m => m.playSound('uiClick')); // Maybe add an upgrade sound later
    };

    const evolveTower = (id: string, newType: TowerType) => {
        const cost = 250; // evolution cost
        if (manaRef.current < cost) return;

        setGameState(prev => ({ ...prev, mana: prev.mana - cost }));
        setTowers(prev => {
            const next = [...prev];
            const towerIndex = next.findIndex(t => t.id === id);
            if (towerIndex === -1) return next;
            const t = { ...next[towerIndex] };

            t.type = newType;
            t.level = 4; // Max or Evo level

            // Adjust stats based on evolution
            if (newType === 'volcano') {
                t.damage = Math.floor(t.damage * 1.5);
                t.fireRate *= 1.5; // attacks slower
                t.range *= 1.2;
            } else if (newType === 'magma') {
                t.damage = Math.floor(t.damage * 3);
                t.fireRate *= 1.0;
                t.range *= 0.8; // shorter range
            } else if (newType === 'blizzard') {
                t.damage = Math.floor(t.damage * 1.2);
                t.fireRate *= 1.2;
            } else if (newType === 'frostbite') {
                t.damage = Math.floor(t.damage * 2.0);
                t.range *= 1.3;
            } else if (newType === 'chain') {
                t.damage = Math.floor(t.damage * 1.5);
                t.fireRate *= 1.1;
                t.range *= 1.1;
            } else if (newType === 'sniper') {
                t.damage = Math.floor(t.damage * 4.0);
                t.fireRate *= 2.0; // very slow
                t.range = 2.0; // covers whole map basically
            }

            next[towerIndex] = t;
            return next;
        });
        import('./soundUtils').then(m => m.playSound('uiClick'));
    };

    const setTowerTargeting = (id: string, targeting: TargetPriority) => {
        setTowers(prev => {
            const next = [...prev];
            const towerIndex = next.findIndex(t => t.id === id);
            if (towerIndex === -1) return next;
            const t = { ...next[towerIndex] };
            t.targeting = targeting;
            next[towerIndex] = t;
            return next;
        });
    };

    const useSkill = useCallback((skill: ActiveSkillType, cx?: number, cy?: number) => {
        const costs: Record<ActiveSkillType, number> = {
            meteor: 100, freeze: 150, storm: 200,
            heal: 100, haste: 150, empower: 150, poisonCloud: 200,
            blackhole: 250, goldRush: 150, shockwave: 200,
            barrier: 150, armageddon: 300, timeWarp: 250
        };
        const cooldowns: Record<ActiveSkillType, number> = {
            meteor: 30000, freeze: 45000, storm: 45000,
            heal: 30000, haste: 45000, empower: 45000, poisonCloud: 45000,
            blackhole: 60000, goldRush: 45000, shockwave: 45000,
            barrier: 30000, armageddon: 90000, timeWarp: 60000
        };

        if (skillCooldownsRef.current[skill] > 0) return false;
        if (spRef.current < costs[skill]) return false;

        setGameState(prev => ({ ...prev, sp: prev.sp - costs[skill] }));
        skillCooldownsRef.current[skill] = cooldowns[skill];

        const now = Date.now();

        if (skill === 'meteor' && cx !== undefined && cy !== undefined) {
            const radius = 0.25;
            enemiesRef.current.forEach(e => {
                const p = getPointOnPath(e.progress, stageIndex);
                if (Math.hypot(p.x - cx, p.y - cy) <= radius) {
                    e.hp -= 300;
                }
            });
            setAttackEffects(prev => [...prev, {
                id: uuidv4(), type: 'volcano',
                startX: cx, startY: cy - 0.5, endX: cx, endY: cy,
                timestamp: now
            }]);
            setEnemies([...enemiesRef.current]);
            import('./soundUtils').then(m => m.playSound('uiClick')); // Fallback sound
        } else if (skill === 'freeze') {
            globalFreezeTimerRef.current = 5000;
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'storm') {
            enemiesRef.current.forEach(e => {
                e.hp -= 100;
            });
            const effects: AttackEffect[] = enemiesRef.current.map(e => {
                const p = getPointOnPath(e.progress, stageIndex);
                return {
                    id: uuidv4(), type: 'thunder',
                    startX: p.x, startY: p.y - 0.5, endX: p.x, endY: p.y,
                    timestamp: now
                };
            });
            setAttackEffects(prev => [...prev, ...effects]);
            setEnemies([...enemiesRef.current]);
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'heal') {
            setGameState(prev => ({ ...prev, crystalHp: prev.crystalHp + 30 }));
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'haste') {
            activeBuffsRef.current.haste = 8000;
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'empower') {
            activeBuffsRef.current.empower = 8000;
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'poisonCloud') {
            enemiesRef.current.forEach(e => {
                e.debuffs.push({ type: 'dot', value: 20, duration: 10000 }); // 20 dps for 10s
            });
            import('./soundUtils').then(m => m.playSound('fire'));
        } else if (skill === 'blackhole') {
            enemiesRef.current.forEach(e => {
                e.progress = Math.max(0, e.progress - 0.1); // Pull back 10%
            });
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'goldRush') {
            activeBuffsRef.current.goldRush = 10000;
            import('./soundUtils').then(m => m.playSound('sell'));
        } else if (skill === 'shockwave') {
            enemiesRef.current.forEach(e => {
                e.hp -= 50;
                e.progress = Math.max(0, e.progress - 0.05);
            });
            import('./soundUtils').then(m => m.playSound('thunder'));
        } else if (skill === 'barrier') {
            activeBuffsRef.current.barrier += 1;
            import('./soundUtils').then(m => m.playSound('uiClick'));
        } else if (skill === 'armageddon') {
            enemiesRef.current.forEach(e => {
                if (e.type !== 'boss') {
                    e.hp = e.hp / 2;
                }
            });
            import('./soundUtils').then(m => m.playSound('fire'));
        } else if (skill === 'timeWarp') {
            enemiesRef.current.forEach(e => {
                e.debuffs.push({ type: 'slow', value: 0.1, duration: 5000 }); // 90% slow for 5s
            });
            import('./soundUtils').then(m => m.playSound('ice'));
        }
        return true;
    }, []);

    return {
        gameState,
        enemies,
        towers,
        attackEffects,
        gameSpeed,
        skillCooldownsRef,
        globalFreezeTimerRef,
        setGameSpeed,
        startWave,
        placeTower,
        sellTower,
        upgradeTower,
        evolveTower,
        setTowerTargeting,
        useSkill,
        getPointOnPath,
        saveDataRef
    };
}
