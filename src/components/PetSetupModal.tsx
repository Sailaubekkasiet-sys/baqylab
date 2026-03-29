'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaqyCat } from './BaqyCat';
import { Button } from '@/components/ui/Button';
import { useI18n } from './I18nProvider';

interface PetSetupModalProps {
    onCreated: () => void;
}

export function PetSetupModal({ onCreated }: PetSetupModalProps) {
    const { t } = useI18n();
    const [name, setName] = useState('BaqyCat');
    const [color, setColor] = useState<'BLACK' | 'GINGER'>('BLACK');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() || 'BaqyCat', color }),
            });
            if (res.ok) {
                onCreated();
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                {/* Modal */}
                <motion.div
                    className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl border"
                    style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-default)',
                    }}
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    <h2
                        className="text-xl font-bold text-center mb-6"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        🐱 {t('pet.title')}
                    </h2>

                    {/* Live Preview */}
                    <div className="flex justify-center mb-6">
                        <BaqyCat
                            color={color}
                            health={100}
                            happiness={100}
                            stage="KITTEN"
                            size={140}
                        />
                    </div>

                    {/* Name Input */}
                    <div className="mb-5">
                        <label
                            className="text-sm font-medium mb-1.5 block"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {t('pet.chooseName')}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('pet.namePlaceholder')}
                            maxLength={20}
                            className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderColor: 'var(--border-default)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="mb-6">
                        <label
                            className="text-sm font-medium mb-2 block"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {t('pet.chooseColor')}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['BLACK', 'GINGER'] as const).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                                        ${
                                            color === c
                                                ? 'border-brand-500 shadow-md'
                                                : 'border-transparent hover:border-[var(--border-default)]'
                                        }`}
                                    style={{ background: 'var(--bg-tertiary)' }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full border-2"
                                        style={{
                                            backgroundColor:
                                                c === 'GINGER' ? '#f97316' : '#1e293b',
                                            borderColor:
                                                c === 'GINGER' ? '#ea580c' : '#0f172a',
                                        }}
                                    />
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {c === 'BLACK'
                                            ? t('pet.colorBlack')
                                            : t('pet.colorGinger')}
                                    </span>
                                    {color === c && (
                                        <motion.div
                                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Create Button */}
                    <Button
                        className="w-full"
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? t('common.loading') : t('pet.create')}
                    </Button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
