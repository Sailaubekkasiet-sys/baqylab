'use client';

import { motion } from 'framer-motion';

interface BaqyCatProps {
    color: 'BLACK' | 'GINGER';
    health: number;
    happiness: number;
    stage: 'KITTEN' | 'ADULT' | 'MASTER';
    size?: number;
}

export function BaqyCat({
    color,
    health,
    happiness,
    stage,
    size = 120,
}: BaqyCatProps) {
    const bodyColor = color === 'GINGER' ? '#f97316' : '#1e293b';
    const darkShade = color === 'GINGER' ? '#ea580c' : '#0f172a';
    const lightShade = color === 'GINGER' ? '#fdba74' : '#475569';
    const noseColor = color === 'GINGER' ? '#c2410c' : '#334155';

    const isSleeping = health < 15;
    const isSad = health < 30 && !isSleeping;
    const isHappy = happiness >= 70 && !isSad && !isSleeping;

    // Scale factor based on stage
    const stageScale = stage === 'KITTEN' ? 0.85 : stage === 'MASTER' ? 1.1 : 1;
    const sadOpacity = isSad ? 0.6 : 1;

    return (
        <motion.div
            className="baqycat-container relative inline-flex items-center justify-center"
            style={{ width: size, height: size }}
            aria-label={`BaqyCat pet — ${isSleeping ? 'sleeping' : isSad ? 'sad' : isHappy ? 'happy' : 'neutral'}`}
            role="img"
        >
            <motion.svg
                viewBox="0 0 200 200"
                width={size}
                height={size}
                xmlns="http://www.w3.org/2000/svg"
                initial={{ scale: stageScale }}
                animate={
                    isHappy
                        ? {
                              scale: [stageScale, stageScale * 1.03, stageScale],
                              rotate: [0, 1, -1, 0],
                          }
                        : { scale: stageScale }
                }
                transition={
                    isHappy
                        ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.3 }
                }
                className="high-contrast-outline"
                style={{ opacity: sadOpacity }}
            >
                {/* Ears */}
                <motion.path
                    d="M55 75 L70 30 L90 70 Z"
                    fill={bodyColor}
                    stroke={darkShade}
                    strokeWidth="2"
                    animate={
                        isSad
                            ? { d: 'M55 75 L60 45 L90 70 Z' }
                            : { d: 'M55 75 L70 30 L90 70 Z' }
                    }
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M145 75 L130 30 L110 70 Z"
                    fill={bodyColor}
                    stroke={darkShade}
                    strokeWidth="2"
                    animate={
                        isSad
                            ? { d: 'M145 75 L140 45 L110 70 Z' }
                            : { d: 'M145 75 L130 30 L110 70 Z' }
                    }
                    transition={{ duration: 0.5 }}
                />
                {/* Inner ears */}
                <motion.path
                    d="M62 72 L70 40 L82 68 Z"
                    fill={lightShade}
                    animate={
                        isSad
                            ? { d: 'M62 72 L64 50 L82 68 Z' }
                            : { d: 'M62 72 L70 40 L82 68 Z' }
                    }
                    transition={{ duration: 0.5 }}
                />
                <motion.path
                    d="M138 72 L130 40 L118 68 Z"
                    fill={lightShade}
                    animate={
                        isSad
                            ? { d: 'M138 72 L136 50 L118 68 Z' }
                            : { d: 'M138 72 L130 40 L118 68 Z' }
                    }
                    transition={{ duration: 0.5 }}
                />

                {/* Head / body (round) */}
                <circle cx="100" cy="110" r="55" fill={bodyColor} stroke={darkShade} strokeWidth="2" />

                {/* Belly patch */}
                <ellipse cx="100" cy="125" rx="30" ry="25" fill={lightShade} opacity="0.3" />

                {/* Eyes */}
                {isSleeping ? (
                    /* Sleeping: horizontal slits */
                    <>
                        <line x1="72" y1="100" x2="88" y2="100" stroke={lightShade} strokeWidth="3" strokeLinecap="round" />
                        <line x1="112" y1="100" x2="128" y2="100" stroke={lightShade} strokeWidth="3" strokeLinecap="round" />
                    </>
                ) : isHappy ? (
                    /* Happy: arc eyes (^‿^) */
                    <>
                        <path d="M72 105 Q80 92 88 105" fill="none" stroke={lightShade} strokeWidth="3" strokeLinecap="round" />
                        <path d="M112 105 Q120 92 128 105" fill="none" stroke={lightShade} strokeWidth="3" strokeLinecap="round" />
                    </>
                ) : (
                    /* Normal / sad: round eyes */
                    <>
                        <circle cx="80" cy="100" r="6" fill="white" />
                        <circle cx="80" cy="100" r="3" fill={darkShade} />
                        <circle cx="120" cy="100" r="6" fill="white" />
                        <circle cx="120" cy="100" r="3" fill={darkShade} />
                        {isSad && (
                            <>
                                {/* Sad eyebrows */}
                                <line x1="72" y1="88" x2="88" y2="92" stroke={darkShade} strokeWidth="2" strokeLinecap="round" />
                                <line x1="128" y1="88" x2="112" y2="92" stroke={darkShade} strokeWidth="2" strokeLinecap="round" />
                            </>
                        )}
                    </>
                )}

                {/* Nose */}
                <ellipse cx="100" cy="115" rx="4" ry="3" fill={noseColor} />

                {/* Mouth */}
                {isHappy ? (
                    <path d="M92 120 Q100 130 108 120" fill="none" stroke={noseColor} strokeWidth="2" strokeLinecap="round" />
                ) : isSad ? (
                    <path d="M92 125 Q100 118 108 125" fill="none" stroke={noseColor} strokeWidth="2" strokeLinecap="round" />
                ) : (
                    <line x1="95" y1="122" x2="105" y2="122" stroke={noseColor} strokeWidth="2" strokeLinecap="round" />
                )}

                {/* Whiskers */}
                <g stroke={lightShade} strokeWidth="1.5" opacity="0.5">
                    <line x1="60" y1="108" x2="78" y2="112" />
                    <line x1="58" y1="115" x2="78" y2="115" />
                    <line x1="60" y1="122" x2="78" y2="118" />
                    <line x1="140" y1="108" x2="122" y2="112" />
                    <line x1="142" y1="115" x2="122" y2="115" />
                    <line x1="140" y1="122" x2="122" y2="118" />
                </g>

                {/* Tail */}
                <motion.path
                    d="M148 145 Q170 130 165 100"
                    fill="none"
                    stroke={bodyColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    animate={
                        isHappy
                            ? {
                                  d: [
                                      'M148 145 Q170 130 165 100',
                                      'M148 145 Q175 125 160 95',
                                      'M148 145 Q170 130 165 100',
                                  ],
                              }
                            : {}
                    }
                    transition={
                        isHappy
                            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            : {}
                    }
                />

                {/* Paws */}
                <ellipse cx="78" cy="158" rx="12" ry="8" fill={darkShade} />
                <ellipse cx="122" cy="158" rx="12" ry="8" fill={darkShade} />

                {/* Stage crown for MASTER */}
                {stage === 'MASTER' && (
                    <g>
                        <polygon
                            points="82,32 88,18 94,28 100,14 106,28 112,18 118,32"
                            fill="#fbbf24"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                        />
                    </g>
                )}
            </motion.svg>

            {/* Sleeping "Zzz" */}
            {isSleeping && (
                <div className="absolute -top-1 -right-1">
                    <motion.span
                        className="text-xs font-bold block"
                        style={{ color: 'var(--text-tertiary)' }}
                        animate={{ opacity: [0, 1, 0], y: [0, -8, -16] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    >
                        Z
                    </motion.span>
                    <motion.span
                        className="text-[10px] font-bold block -mt-2"
                        style={{ color: 'var(--text-tertiary)' }}
                        animate={{ opacity: [0, 1, 0], y: [0, -6, -12] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                    >
                        z
                    </motion.span>
                    <motion.span
                        className="text-[8px] font-bold block -mt-1"
                        style={{ color: 'var(--text-tertiary)' }}
                        animate={{ opacity: [0, 1, 0], y: [0, -4, -8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                    >
                        z
                    </motion.span>
                </div>
            )}

            {/* High contrast mode styles */}
            <style>{`
                @media (prefers-contrast: high) {
                    .high-contrast-outline circle,
                    .high-contrast-outline ellipse,
                    .high-contrast-outline path,
                    .high-contrast-outline polygon {
                        stroke: white !important;
                        stroke-width: 3 !important;
                    }
                    @media (prefers-color-scheme: light) {
                        .high-contrast-outline circle,
                        .high-contrast-outline ellipse,
                        .high-contrast-outline path,
                        .high-contrast-outline polygon {
                            stroke: black !important;
                        }
                    }
                }
            `}</style>
        </motion.div>
    );
}
