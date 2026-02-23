import React, { useState, useEffect } from 'react';
import { loadSaveData, saveGameData, type SaveData } from './saveSystem';
import { useI18n } from './i18n';
import {
    Flame, Snowflake, Zap, Skull, Wind, Mountain, Sun, Moon, Droplet, Leaf, Sparkles, Shield,
    Crosshair, Timer, CloudLightning, Heart, FastForward, Swords, CloudRain, CircleDot, Coins, Waves,
    ArrowLeft, Check
} from 'lucide-react';

interface DeckScreenProps {
    onBack: () => void;
}

const BASE_TOWERS = [
    { id: 'fire', icon: Flame, color: '#ef4444' },
    { id: 'ice', icon: Snowflake, color: '#3b82f6' },
    { id: 'thunder', icon: Zap, color: '#eab308' },
    { id: 'poison', icon: Skull, color: '#22c55e' },
    { id: 'wind', icon: Wind, color: '#a8a29e' },
    { id: 'earth', icon: Mountain, color: '#78350f' },
    { id: 'light', icon: Sun, color: '#fde047' },
    { id: 'dark', icon: Moon, color: '#4c1d95' },
    { id: 'water', icon: Droplet, color: '#06b6d4' },
    { id: 'nature', icon: Leaf, color: '#16a34a' },
    { id: 'arcane', icon: Sparkles, color: '#d946ef' },
    { id: 'lava', icon: Flame, color: '#ea580c' },
    { id: 'metal', icon: Shield, color: '#94a3b8' },
];

const BASE_SKILLS = [
    { id: 'meteor', icon: Crosshair, color: '#ef4444' },
    { id: 'freeze', icon: Timer, color: '#3b82f6' },
    { id: 'storm', icon: CloudLightning, color: '#eab308' },
    { id: 'heal', icon: Heart, color: '#f43f5e' },
    { id: 'haste', icon: FastForward, color: '#fcd34d' },
    { id: 'empower', icon: Swords, color: '#dc2626' },
    { id: 'poisonCloud', icon: CloudRain, color: '#22c55e' },
    { id: 'blackhole', icon: CircleDot, color: '#6d28d9' },
    { id: 'goldRush', icon: Coins, color: '#fbbf24' },
    { id: 'shockwave', icon: Waves, color: '#0ea5e9' },
    { id: 'barrier', icon: Shield, color: '#38bdf8' },
    { id: 'armageddon', icon: Flame, color: '#b91c1c' },
    { id: 'timeWarp', icon: Timer, color: '#a855f7' },
];

export const DeckScreen: React.FC<DeckScreenProps> = ({ onBack }) => {
    const { t } = useI18n();
    const [saveData, setSaveData] = useState<SaveData | null>(null);
    const [activeDeckIndex, setActiveDeckIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'towers' | 'skills'>('towers');

    useEffect(() => {
        const data = loadSaveData();
        setSaveData(data);
        setActiveDeckIndex(data.activeDeckIndex || 0);
    }, []);

    if (!saveData) return null;

    const upgrades = saveData.upgrades;

    const isTowerUnlocked = (id: string) => {
        if (['fire', 'ice', 'thunder'].includes(id)) return true;
        const key = `unlocked${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof upgrades;
        return (upgrades[key] as number) > 0;
    };

    const isSkillUnlocked = (id: string) => {
        if (id === 'meteor') return upgrades.unlockedSP > 0;
        if (id === 'freeze') return upgrades.unlockedFreeze > 0;
        if (id === 'storm') return upgrades.unlockedStorm > 0;
        const key = `unlocked${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof typeof upgrades;
        return (upgrades[key] as number) > 0;
    };

    const selectedTowers = (saveData?.customDecks[activeDeckIndex]?.towers || []).filter(isTowerUnlocked);
    const selectedSkills = (saveData?.customDecks[activeDeckIndex]?.skills || []).filter(isSkillUnlocked);

    const toggleTower = (id: string) => {
        setSaveData(prev => {
            if (!prev) return prev;

            const checkUnlocked = (tId: string) => {
                if (['fire', 'ice', 'thunder'].includes(tId)) return true;
                const key = `unlocked${tId.charAt(0).toUpperCase() + tId.slice(1)}` as keyof typeof prev.upgrades;
                return (prev.upgrades[key] as number) > 0;
            };

            const next = { ...prev };
            // Deep clone the array to prevent mutating the original state
            next.customDecks = [...prev.customDecks];
            const deck = { ...next.customDecks[activeDeckIndex] };

            let currentTowers = deck.towers.filter(checkUnlocked);

            if (currentTowers.includes(id)) {
                currentTowers = currentTowers.filter(t => t !== id);
            } else if (currentTowers.length < 5) {
                currentTowers = [...currentTowers, id];
            }
            deck.towers = currentTowers;
            next.customDecks[activeDeckIndex] = deck;
            return next;
        });
    };

    const toggleSkill = (id: string) => {
        setSaveData(prev => {
            if (!prev) return prev;

            const checkUnlocked = (sId: string) => {
                if (sId === 'meteor') return prev.upgrades.unlockedSP > 0;
                if (sId === 'freeze') return prev.upgrades.unlockedFreeze > 0;
                if (sId === 'storm') return prev.upgrades.unlockedStorm > 0;
                const key = `unlocked${sId.charAt(0).toUpperCase() + sId.slice(1)}` as keyof typeof prev.upgrades;
                return (prev.upgrades[key] as number) > 0;
            };

            const next = { ...prev };
            next.customDecks = [...prev.customDecks];
            const deck = { ...next.customDecks[activeDeckIndex] };

            let currentSkills = deck.skills.filter(checkUnlocked);

            if (currentSkills.includes(id)) {
                currentSkills = currentSkills.filter(s => s !== id);
            } else if (currentSkills.length < 3) {
                currentSkills = [...currentSkills, id];
            }
            deck.skills = currentSkills;
            next.customDecks[activeDeckIndex] = deck;
            return next;
        });
    };

    const visibleTowers = BASE_TOWERS.filter(t => isTowerUnlocked(t.id));
    const visibleSkills = BASE_SKILLS.filter(s => isSkillUnlocked(s.id));

    const canSave = selectedTowers.length > 0;

    const handleSave = () => {
        if (!canSave) return;
        const nextSave = { ...saveData, activeDeckIndex };
        const deck = { ...nextSave.customDecks[activeDeckIndex] };
        deck.towers = selectedTowers;
        deck.skills = selectedSkills;
        nextSave.customDecks[activeDeckIndex] = deck;
        saveGameData(nextSave);
        onBack();
    };

    return (
        <div className="screen-padding" style={{
            minHeight: '100vh', background: '#0f172a', color: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto'
        }}>
            <h1 className="title-display" style={{ color: '#8b5cf6', margin: '0 0 20px 0', textShadow: '0 0 20px #8b5cf6' }}>
                {t('deckBuilding' as any)}
            </h1>

            {/* Deck Slots */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[0, 1, 2].map(idx => (
                    <button
                        key={idx}
                        onClick={() => setActiveDeckIndex(idx)}
                        style={{
                            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                            background: activeDeckIndex === idx ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                            border: `2px solid ${activeDeckIndex === idx ? '#c4b5fd' : 'rgba(139,92,246,0.3)'}`,
                            color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                            boxShadow: activeDeckIndex === idx ? '0 0 15px rgba(139,92,246,0.5)' : 'none'
                        }}
                    >
                        {t(`deck${idx + 1}` as any)}
                    </button>
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                    <button
                        onClick={() => setActiveTab('towers')}
                        style={{
                            padding: '12px 24px', background: 'transparent', cursor: 'pointer',
                            border: 'none', color: activeTab === 'towers' ? '#10b981' : '#64748b',
                            borderBottom: activeTab === 'towers' ? '3px solid #10b981' : '3px solid transparent',
                            fontSize: '1.2rem', fontWeight: 'bold'
                        }}
                    >
                        {t('tabTowers')} ({selectedTowers.length}/5)
                    </button>
                    <button
                        onClick={() => setActiveTab('skills')}
                        style={{
                            padding: '12px 24px', background: 'transparent', cursor: 'pointer',
                            border: 'none', color: activeTab === 'skills' ? '#38bdf8' : '#64748b',
                            borderBottom: activeTab === 'skills' ? '3px solid #38bdf8' : '3px solid transparent',
                            fontSize: '1.2rem', fontWeight: 'bold'
                        }}
                    >
                        {t('tabSP')} ({selectedSkills.length}/3)
                    </button>
                </div>

                {/* Towers Section */}
                {activeTab === 'towers' && (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginTop: 0, color: selectedTowers.length === 5 ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {t('deckTowers' as any, selectedTowers.length)}
                            {selectedTowers.length === 5 && <Check color="#10b981" />}
                        </h2>
                        <div className="deck-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {visibleTowers.map(tower => {
                                const isSelected = selectedTowers.includes(tower.id);
                                const Icon = tower.icon;
                                const tName = t(tower.id as any);
                                const tDesc = t(`desc_${tower.id}` as any);

                                return (
                                    <div
                                        key={tower.id}
                                        onClick={() => toggleTower(tower.id)}
                                        style={{
                                            background: isSelected ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${isSelected ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '8px', padding: '12px', cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', gap: '8px',
                                            transition: 'all 0.2s',
                                            opacity: (!isSelected && selectedTowers.length >= 5) ? 0.5 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: tower.color, fontWeight: 'bold' }}>
                                            <Icon size={20} /> {tName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{tDesc}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Skills Section */}
                {activeTab === 'skills' && (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h2 style={{ marginTop: 0, color: selectedSkills.length === 3 ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {t('deckSkills' as any, selectedSkills.length)}
                            {selectedSkills.length === 3 && <Check color="#10b981" />}
                        </h2>
                        <div className="deck-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {visibleSkills.length === 0 && (
                                <div style={{ color: '#94a3b8' }}>No skills unlocked yet.</div>
                            )}
                            {visibleSkills.map(skill => {
                                const isSelected = selectedSkills.includes(skill.id);
                                const Icon = skill.icon;
                                const tName = t(skill.id as any);
                                const tDesc = t(`desc_${skill.id}` as any);

                                return (
                                    <div
                                        key={skill.id}
                                        onClick={() => toggleSkill(skill.id)}
                                        style={{
                                            background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '8px', padding: '12px', cursor: 'pointer',
                                            display: 'flex', flexDirection: 'column', gap: '8px',
                                            transition: 'all 0.2s',
                                            opacity: (!isSelected && selectedSkills.length >= 3) ? 0.5 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: skill.color, fontWeight: 'bold' }}>
                                            <Icon size={20} /> {tName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{tDesc}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px', paddingBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={onBack} style={{
                    padding: '12px 24px', borderRadius: '8px', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                    fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <ArrowLeft size={20} /> <span className="hide-on-mobile">{t('back')}</span>
                </button>
                <button
                    onClick={handleSave}
                    disabled={!canSave}
                    style={{
                        padding: '12px 24px', borderRadius: '8px',
                        background: canSave ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)',
                        border: 'none', color: 'white', fontWeight: 'bold',
                        fontSize: '1.2rem', cursor: canSave ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: canSave ? '0 0 20px rgba(139, 92, 246, 0.6)' : 'none'
                    }}
                >
                    <Check size={20} /> {t('saveDeck' as any)}
                </button>
            </div>
        </div>
    );
};
