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
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'radial-gradient(circle at center, #1e1b4b, #020617)',
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
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', width: '80vw', height: '80vw', borderRadius: '50%',
                    border: '2px solid rgba(59, 130, 246, 0.1)', top: '-20%', left: '-20%',
                }}
            />
            <motion.div
                animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', width: '90vw', height: '90vw', borderRadius: '50%',
                    border: '1px solid rgba(239, 68, 68, 0.05)', bottom: '-30%', right: '-20%',
                }}
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', width: '100vw', height: '100vh',
                    background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
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
                            '0 0 10px rgba(59, 130, 246, 0.5)',
                            '0 0 20px rgba(139, 92, 246, 0.8)',
                            '0 0 10px rgba(239, 68, 68, 0.5)',
                            '0 0 10px rgba(59, 130, 246, 0.5)'
                        ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="title-display"
                    style={{
                        fontSize: '3.5rem', fontWeight: 800, color: '#fff', letterSpacing: '2px',
                        marginBottom: '16px',
                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ef4444)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}
                >
                    {t('title')}
                </motion.div>
                <div style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '8px', textTransform: 'uppercase' }}>
                    {t('subtitle')}
                </div>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    onClick={onStart}
                    className="glass-panel"
                    style={{
                        padding: '16px 48px', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '50px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4))',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <Play size={24} fill="white" />
                    {t('start')}
                </motion.button>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        onClick={onUpgrades}
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '50px', cursor: 'pointer',
                            background: 'transparent',
                        }}
                    >
                        {t('upgrades')}
                    </motion.button>

                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        onClick={onDeck}
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: '#8b5cf6',
                            border: '1px solid rgba(139, 92, 246, 0.5)', borderRadius: '50px', cursor: 'pointer',
                            background: 'transparent',
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
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        onClick={onHowToPlay}
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '50px', cursor: 'pointer',
                            background: 'transparent',
                        }}
                    >
                        {t('howToPlay')}
                    </motion.button>

                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                        onClick={onBestiary}
                        style={{
                            flex: 1,
                            padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '50px', cursor: 'pointer',
                            background: 'transparent',
                        }}
                    >
                        {t('bestiary')}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
