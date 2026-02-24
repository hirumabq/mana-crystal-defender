import { motion } from 'framer-motion';
import { Play, Globe } from 'lucide-react';
import { useI18n } from './i18n';

interface TitleScreenProps {
    onStart: () => void;
    onUpgrades: () => void;
    onHowToPlay: () => void;
    onBestiary: () => void;
    onDeck: () => void;
}

export default function TitleScreen({ onStart, onUpgrades, onHowToPlay, onBestiary, onDeck }: TitleScreenProps) {
    const { t, lang, setLang } = useI18n();
    return (
        <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            style={{
                width: '100vw',
                height: '100dvh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'radial-gradient(circle at center, #1a0505, #050505)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Language Toggle */}
            <button
                onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
                className="glass-panel"
                style={{
                    position: 'absolute', top: '24px', right: '24px', zIndex: 100,
                    background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none',
                    padding: '8px 16px', borderRadius: '50px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                }}
            >
                <Globe size={18} /> {lang.toUpperCase()}
            </button>

            {/* Background Magic Elements */}
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', width: '80vw', height: '80vw', borderRadius: '50%',
                    border: '1px dashed rgba(185, 28, 28, 0.15)', top: '-20%', left: '-20%',
                }}
            />
            <motion.div
                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', width: '90vw', height: '90vw', borderRadius: '50%',
                    border: '1px solid rgba(153, 27, 27, 0.1)', bottom: '-30%', right: '-20%',
                }}
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', width: '100vw', height: '100dvh',
                    background: 'radial-gradient(circle at center, rgba(185, 28, 28, 0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Main Content */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
                style={{ zIndex: 10, textAlign: 'center', marginBottom: '60px' }}
            >
                <motion.div
                    animate={{
                        textShadow: [
                            '0 0 10px rgba(185, 28, 28, 0.5)',
                            '0 0 20px rgba(220, 38, 38, 0.8)',
                            '0 0 10px rgba(153, 27, 27, 0.5)'
                        ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="title-display"
                    style={{
                        fontSize: '4.5rem', fontWeight: 900, color: '#fff', letterSpacing: '6px',
                        marginBottom: '16px',
                        background: 'linear-gradient(to bottom, #fca5a5, #b91c1c, #7f1d1d)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        display: 'inline-block', lineHeight: '1.2'
                    }}
                >
                    {t('title')}
                </motion.div>
                <div className="title-display" style={{ fontSize: '1.2rem', color: '#dc2626', letterSpacing: '12px' }}>
                    {t('subtitle')}
                </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(185, 28, 28, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    onClick={onStart}
                    className="glass-panel"
                    style={{
                        padding: '16px 48px', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff',
                        border: '1px solid rgba(185, 28, 28, 0.5)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.6), rgba(69, 10, 10, 0.8))',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                    }}
                >
                    <Play size={24} fill="white" />
                    {t('start')}
                </motion.button>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        onClick={onUpgrades}
                        className="title-display"
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.3)', cursor: 'pointer',
                            background: 'rgba(0,0,0,0.5)',
                            letterSpacing: '2px'
                        }}
                    >
                        {t('upgrades')}
                    </motion.button>

                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        onClick={onDeck}
                        className="title-display"
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: '#a8a29e',
                            border: '1px solid rgba(168, 162, 158, 0.3)', cursor: 'pointer',
                            background: 'rgba(0,0,0,0.5)',
                            letterSpacing: '2px'
                        }}
                    >
                        {/* @ts-ignore */}
                        {t('deckBuilding')}
                    </motion.button>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>

                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        onClick={onHowToPlay}
                        className="title-display"
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.2)', cursor: 'pointer',
                            background: 'rgba(0,0,0,0.5)',
                            letterSpacing: '2px'
                        }}
                    >
                        {t('howToPlay')}
                    </motion.button>

                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                        onClick={onBestiary}
                        className="title-display"
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: '#f87171',
                            border: '1px solid rgba(248, 113, 113, 0.3)', cursor: 'pointer',
                            background: 'rgba(0,0,0,0.5)',
                            letterSpacing: '2px'
                        }}
                    >
                        {t('bestiary')}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
