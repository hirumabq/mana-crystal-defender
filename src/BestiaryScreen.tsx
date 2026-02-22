import { motion } from 'framer-motion';
import { useI18n } from './i18n';
import { ArrowLeft } from 'lucide-react';

interface BestiaryScreenProps {
    onBack: () => void;
}

export default function BestiaryScreen({ onBack }: BestiaryScreenProps) {
    const { t } = useI18n();

    const enemies = [
        {
            id: 'goblin',
            name: t('bestiaryGoblin'),
            desc: t('bestiaryGoblinDesc'),
            color: '#cbd5e1', // Default grey/silver
            size: 20
        },
        {
            id: 'orc',
            name: t('bestiaryOrc'),
            desc: t('bestiaryOrcDesc'),
            color: '#65a30d', // Green
            size: 28
        },
        {
            id: 'boss',
            name: t('bestiaryBoss'),
            desc: t('bestiaryBossDesc'),
            color: '#b91c1c', // Dark Red
            size: 48
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1e1b4b, #020617)',
                position: 'relative',
                color: 'white',
            }}
        >
            <div className="glass-panel" style={{
                width: '80%',
                maxWidth: '600px',
                maxHeight: '80vh',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="title-display" style={{ fontSize: '2rem', color: '#8b5cf6', textShadow: '0 0 10px rgba(139, 92, 246, 0.5)', margin: 0 }}>
                        {t('bestiaryTitle')}
                    </h2>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '8px 16px', borderRadius: '50px',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <ArrowLeft size={18} /> {t('back')}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {enemies.map((enemy) => (
                        <div key={enemy.id} style={{
                            display: 'flex',
                            gap: '24px',
                            padding: '24px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: `1px solid ${enemy.color}44`,
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px'
                            }}>
                                <div style={{
                                    width: `${enemy.size}px`,
                                    height: `${enemy.size}px`,
                                    background: enemy.color,
                                    borderRadius: '50%',
                                    boxShadow: `0 0 15px ${enemy.color}`
                                }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: enemy.color, textShadow: `0 0 10px ${enemy.color}55` }}>
                                    {enemy.name}
                                </h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                                    {enemy.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
