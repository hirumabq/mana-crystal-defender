import { motion } from 'framer-motion';
import { ChevronLeft, Flame, Snowflake, Zap, Wand2 } from 'lucide-react';
import { useI18n } from './i18n';

interface HowToPlayScreenProps {
    onBack: () => void;
}

export default function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
    const { t } = useI18n();

    return (
        <motion.div
            key="how-to-play"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            style={{
                width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column',
                background: '#020617', color: 'white', overflowY: 'auto'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', fontSize: '1.2rem',
                    }}
                >
                    <ChevronLeft size={32} /> {t('back')}
                </button>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', color: '#8b5cf6' }}>{t('howToPlayTitle')}</h1>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#3b82f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wand2 /> {t('htpDefend')}
                    </h2>
                    <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-line' }}>
                        {t('htpDefendDesc')}
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>{t('htpRunes')}</h2>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: '#ef4444', padding: '12px', borderRadius: '12px' }}><Flame size={24} /></div>
                            <div>
                                <h3 style={{ margin: 0, color: '#ef4444' }}>{t('htpFire')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{t('htpFireDesc')}</p>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: '#3b82f6', padding: '12px', borderRadius: '12px' }}><Snowflake size={24} /></div>
                            <div>
                                <h3 style={{ margin: 0, color: '#3b82f6' }}>{t('htpIce')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{t('htpIceDesc')}</p>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: '#eab308', padding: '12px', borderRadius: '12px' }}><Zap size={24} color="black" /></div>
                            <div>
                                <h3 style={{ margin: 0, color: '#eab308' }}>{t('htpThunder')}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{t('htpThunderDesc')}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}
