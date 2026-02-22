import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Flame, Snowflake, Zap, ShieldPlus, Scan, Sparkles, Timer, Lock, Skull, Wind, Mountain, Sun, Moon, Droplet, Leaf, Shield, Heart, FastForward, Swords, CloudRain, CircleDot, Coins, Waves } from 'lucide-react';
import { loadSaveData, saveGameData, type SaveData } from './saveSystem';
import { useI18n } from './i18n';

interface UpgradesScreenProps {
    onBack: () => void;
}

export default function UpgradesScreen({ onBack }: UpgradesScreenProps) {
    const { t } = useI18n();

    const UPGRADE_INFO = [
        { id: 'fireDamage', nameKey: 'upgFireName', icon: Flame, color: '#ef4444', descKey: 'upgFireDesc', baseCost: 100, multiplier: 1, category: 'tower' },
        { id: 'iceSlow', nameKey: 'upgIceName', icon: Snowflake, color: '#3b82f6', descKey: 'upgIceDesc', baseCost: 100, multiplier: 1, category: 'tower' },
        { id: 'thunderDamage', nameKey: 'upgThunderName', icon: Zap, color: '#eab308', descKey: 'upgThunderDesc', baseCost: 150, multiplier: 1, category: 'tower' },
        { id: 'towerRange', nameKey: 'upgRangeName', icon: Scan, color: '#ec4899', descKey: 'upgRangeDesc', baseCost: 150, multiplier: 1, category: 'tower' },
        { id: 'baseHealth', nameKey: 'upgHealthName', icon: ShieldPlus, color: '#10b981', descKey: 'upgHealthDesc', baseCost: 200, multiplier: 1, category: 'other' },
        // SP Upgrades
        { id: 'unlockedSP', nameKey: 'upgUnlockedSPName', icon: Sparkles, color: '#a855f7', descKey: 'upgUnlockedSPDesc', baseCost: 300, multiplier: 1, maxLevel: 1, category: 'sp' },
        { id: 'spCap', nameKey: 'upgSpCapName', icon: Sparkles, color: '#38bdf8', descKey: 'upgSpCapDesc', baseCost: 200, multiplier: 1.5, requiresSP: true, category: 'sp' },
        { id: 'spGenRate', nameKey: 'upgSpGenRateName', icon: Timer, color: '#34d399', descKey: 'upgSpGenRateDesc', baseCost: 250, multiplier: 1.5, requiresSP: true, category: 'sp' },
        { id: 'unlockedFreeze', nameKey: 'upgUnlockedFreezeName', icon: Snowflake, color: '#60a5fa', descKey: 'upgUnlockedFreezeDesc', baseCost: 500, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedStorm', nameKey: 'upgUnlockedStormName', icon: Zap, color: '#facc15', descKey: 'upgUnlockedStormDesc', baseCost: 750, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },

        // New Towers
        { id: 'unlockedPoison', nameKey: 'upgPoisonName', icon: Skull, color: '#22c55e', descKey: 'upgPoisonDesc', baseCost: 500, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedWind', nameKey: 'upgWindName', icon: Wind, color: '#a8a29e', descKey: 'upgWindDesc', baseCost: 500, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedEarth', nameKey: 'upgEarthName', icon: Mountain, color: '#78350f', descKey: 'upgEarthDesc', baseCost: 750, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedLight', nameKey: 'upgLightName', icon: Sun, color: '#fde047', descKey: 'upgLightDesc', baseCost: 1000, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedDark', nameKey: 'upgDarkName', icon: Moon, color: '#4c1d95', descKey: 'upgDarkDesc', baseCost: 1000, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedWater', nameKey: 'upgWaterName', icon: Droplet, color: '#06b6d4', descKey: 'upgWaterDesc', baseCost: 750, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedNature', nameKey: 'upgNatureName', icon: Leaf, color: '#16a34a', descKey: 'upgNatureDesc', baseCost: 750, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedArcane', nameKey: 'upgArcaneName', icon: Sparkles, color: '#d946ef', descKey: 'upgArcaneDesc', baseCost: 1500, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedLava', nameKey: 'upgLavaName', icon: Flame, color: '#ea580c', descKey: 'upgLavaDesc', baseCost: 1200, multiplier: 1, maxLevel: 1, category: 'tower' },
        { id: 'unlockedMetal', nameKey: 'upgMetalName', icon: Shield, color: '#94a3b8', descKey: 'upgMetalDesc', baseCost: 300, multiplier: 1, maxLevel: 1, category: 'tower' },

        // New Skills
        { id: 'unlockedHeal', nameKey: 'upgHealName', icon: Heart, color: '#f43f5e', descKey: 'upgHealDesc', baseCost: 500, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedHaste', nameKey: 'upgHasteName', icon: FastForward, color: '#fcd34d', descKey: 'upgHasteDesc', baseCost: 750, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedEmpower', nameKey: 'upgEmpowerName', icon: Swords, color: '#dc2626', descKey: 'upgEmpowerDesc', baseCost: 750, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedPoisonCloud', nameKey: 'upgPoisonCloudName', icon: CloudRain, color: '#22c55e', descKey: 'upgPoisonCloudDesc', baseCost: 1000, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedBlackhole', nameKey: 'upgBlackholeName', icon: CircleDot, color: '#6d28d9', descKey: 'upgBlackholeDesc', baseCost: 1200, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedGoldRush', nameKey: 'upgGoldRushName', icon: Coins, color: '#fbbf24', descKey: 'upgGoldRushDesc', baseCost: 800, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedShockwave', nameKey: 'upgShockwaveName', icon: Waves, color: '#0ea5e9', descKey: 'upgShockwaveDesc', baseCost: 1000, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedBarrier', nameKey: 'upgBarrierName', icon: Shield, color: '#38bdf8', descKey: 'upgBarrierDesc', baseCost: 600, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedArmageddon', nameKey: 'upgArmageddonName', icon: Flame, color: '#b91c1c', descKey: 'upgArmageddonDesc', baseCost: 2000, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
        { id: 'unlockedTimeWarp', nameKey: 'upgTimeWarpName', icon: Timer, color: '#a855f7', descKey: 'upgTimeWarpDesc', baseCost: 1500, multiplier: 1, maxLevel: 1, requiresSP: true, category: 'sp' },
    ] as const;

    const [saveData, setSaveData] = useState<SaveData | null>(null);
    const [activeTab, setActiveTab] = useState<'tower' | 'sp' | 'other'>('tower');

    useEffect(() => {
        setSaveData(loadSaveData());
    }, []);

    const handleUpgrade = (id: keyof SaveData['upgrades'], cost: number) => {
        if (!saveData || saveData.points < cost) return;

        const newData = { ...saveData };
        newData.points -= cost;
        newData.upgrades[id] += 1;

        setSaveData(newData);
        saveGameData(newData);
    };

    if (!saveData) return null;

    return (
        <motion.div
            key="upgrades"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            style={{
                width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
                background: 'radial-gradient(circle at center, #1e1b4b, #020617)',
                color: 'white', padding: '24px', overflowY: 'auto'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', fontSize: '1.2rem',
                    }}
                >
                    <ChevronLeft size={32} /> {t('back')}
                </button>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6', textShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}>
                    {t('manaShards', saveData.points)}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', letterSpacing: '2px' }}>{t('forgeOfMagic')}</h1>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                    {(['tower', 'sp', 'other'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 24px', fontSize: '1.2rem', fontWeight: 'bold',
                                background: activeTab === tab ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                                color: activeTab === tab ? 'white' : '#94a3b8',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeTab === tab ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none'
                            }}
                        >
                            {tab === 'tower' ? t('tabTowers') : tab === 'sp' ? t('tabSP') : t('tabOther')}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gap: '24px' }}>
                    {UPGRADE_INFO.filter(ug => ug.category === activeTab).map(ug => {
                        const level = saveData.upgrades[ug.id as keyof SaveData['upgrades']];
                        const cost = Math.floor(ug.baseCost * Math.pow(ug.multiplier, level));
                        const isMaxLevel = 'maxLevel' in ug && level >= (ug as any).maxLevel;
                        const isLocked = ('requiresSP' in ug && ug.requiresSP) && saveData.upgrades.unlockedSP === 0;
                        const canAfford = saveData.points >= cost && !isMaxLevel && !isLocked;
                        const Icon = ug.icon;

                        return (
                            <div key={ug.id} className="glass-panel" style={{
                                padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderLeft: `4px solid ${isLocked ? '#475569' : ug.color}`,
                                opacity: isLocked ? 0.5 : 1, filter: isLocked ? 'grayscale(100%)' : 'none',
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', color: isLocked ? '#94a3b8' : ug.color }}>
                                        {isLocked ? <Lock size={32} /> : <Icon size={32} />}
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', color: isLocked ? '#94a3b8' : 'white' }}>
                                            {t(ug.nameKey as any)} {!isLocked && <span style={{ fontSize: '1rem', background: '#374151', padding: '2px 8px', borderRadius: '12px', color: 'white' }}>{isMaxLevel ? t('maxLevel') : t('upgradeLevel', level)}</span>}
                                        </h2>
                                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)' }}>
                                            {isLocked ? t('upgUnlockedSPDesc') + " Required" : t(ug.descKey as any)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleUpgrade(ug.id as keyof SaveData['upgrades'], cost)}
                                    disabled={!canAfford || isMaxLevel || isLocked}
                                    style={{
                                        padding: '12px 24px', fontSize: '1.2rem', fontWeight: 'bold',
                                        background: isMaxLevel ? '#10b981' : (canAfford ? ug.color : '#374151'),
                                        color: isMaxLevel || canAfford ? 'white' : 'rgba(255,255,255,0.4)',
                                        border: 'none', borderRadius: '8px',
                                        cursor: isMaxLevel || isLocked ? 'default' : (canAfford ? 'pointer' : 'not-allowed'),
                                        transition: 'all 0.2s',
                                        boxShadow: canAfford && !isMaxLevel ? `0 0 20px -5px ${ug.color}` : 'none'
                                    }}
                                >
                                    {isMaxLevel ? t('maxLevelReached') : (isLocked ? <Lock size={20} /> : t('upgradeCost', cost))}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
