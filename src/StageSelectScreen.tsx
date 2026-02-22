import { motion } from 'framer-motion';
import { ChevronLeft, Lock, Unlock, Map as MapIcon } from 'lucide-react';
import { useI18n } from './i18n';
import { loadSaveData } from './saveSystem';

export default function StageSelectScreen({ onSelect, onBack }: { onSelect: (index: number) => void, onBack: () => void }) {
    const { t } = useI18n();
    const save = loadSaveData();
    const maxStages = 3;

    return (
        <div style={{
            width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
            background: `radial-gradient(circle at center, rgb(30, 27, 75), rgb(2, 6, 23))`,
            color: 'white'
        }}>
            <header style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} className="glass-panel" style={{
                    padding: '12px', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center'
                }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ margin: 0, textShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }}>
                    {t('manaCrystal') || 'Map Stages'}
                </h1>
            </header>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                {Array.from({ length: maxStages }).map((_, idx) => {
                    const isUnlocked = idx < save.unlockedStages;
                    return (
                        <motion.button
                            whileHover={isUnlocked ? { scale: 1.05 } : {}}
                            whileTap={isUnlocked ? { scale: 0.95 } : {}}
                            key={idx}
                            onClick={() => isUnlocked && onSelect(idx)}
                            className="glass-panel"
                            style={{
                                width: '300px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                border: isUnlocked ? '2px solid rgba(59, 130, 246, 0.5)' : '2px solid rgba(255,255,255,0.1)',
                                background: isUnlocked ? 'rgba(30, 58, 138, 0.2)' : 'rgba(0,0,0,0.5)',
                                cursor: isUnlocked ? 'pointer' : 'not-allowed', color: isUnlocked ? 'white' : 'gray',
                                fontSize: '1.2rem', fontWeight: 'bold'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapIcon />
                                <span>{t((`stage${idx + 1}`) as any) || `Stage ${idx + 1}`}</span>
                            </div>
                            {isUnlocked ? <Unlock size={20} color="#10b981" /> : <Lock size={20} color="#ef4444" />}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
}
