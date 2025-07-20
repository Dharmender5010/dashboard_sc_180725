
import React from 'react';
import { motion, Variants } from 'framer-motion';

// A more modern, animated illustration for the maintenance page.
const MaintenanceIllustration = () => (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-lg mx-auto" aria-hidden="true">
        <defs>
            <linearGradient id="grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.7 0" result="glow" />
                <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        {/* Abstract background shapes with animation */}
        <motion.circle 
            cx="100" cy="100" r="80" 
            fill="url(#grad-main)" 
            opacity="0.1" 
            animate={{ scale: [1, 1.05, 1], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        />
        <motion.path 
            d="M 500 200 Q 550 250 500 300 T 500 400" 
            stroke="#c7d2fe" 
            strokeWidth="10" 
            fill="none" 
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3, transition: { duration: 2, delay: 0.5, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" } }}
        />

        {/* Central gear icon */}
        <g transform="translate(300, 200)" filter="url(#soft-glow)">
            <motion.path 
                d="M -16.25,27.79 a 15,15 0 1,0 2.5,0 l 1.25,8.66 h -5 z M 16.25, -25.29 a 15,15 0 1,0 -2.5,0 l -1.25, -8.66 h 5 z M 26.34, -1.25 a 15,15 0 1,0 0,2.5 l 8.66,1.25 v -5 z M -4.65, -1.25 a 15,15 0 1,0 0,2.5 l -8.66,1.25 v -5 z"
                fill="url(#grad-main)"
                transform="scale(3.5)"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360, transition: { duration: 20, repeat: Infinity, ease: 'linear' } }}
            />
            <motion.circle r="20" fill="#eef2ff" />
        </g>
        
        {/* Floating plus signs */}
        <motion.path 
            d="M 150 280 L 150 300 M 140 290 L 160 290" 
            stroke="#a5b4fc" 
            strokeWidth="4" 
            strokeLinecap="round"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -20, opacity: 0, transition: { duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 } }}
        />
        <motion.path 
            d="M 450 100 L 450 120 M 440 110 L 460 110" 
            stroke="#a5b4fc" 
            strokeWidth="6" 
            strokeLinecap="round"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -30, opacity: 0, transition: { duration: 4, repeat: Infinity, ease: "easeOut" } }}
        />
    </svg>
);


const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

// Split text into words for animation
const title = "Website is under".split(" ");
const title2 = "MAINTENANCE".split("");

export const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4 overflow-hidden relative">
             {/* Animated background particles */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-indigo-100 rounded-full"
                        style={{
                            width: Math.random() * 50 + 20,
                            height: Math.random() * 50 + 20,
                            left: `${Math.random() * 100}%`,
                            bottom: '-50px',
                        }}
                        animate={{
                            y: `-${window.innerHeight + 100}px`,
                            x: (Math.random() - 0.5) * 200,
                            rotate: Math.random() * 360,
                            scale: Math.random() * 0.5 + 0.5,
                        }}
                        transition={{
                            duration: Math.random() * 15 + 10,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>
            
            <div className="w-full max-w-5xl mx-auto z-10">
                <motion.div 
                    className="flex flex-col items-center justify-center gap-8 text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div 
                        className="w-full max-w-md"
                        variants={itemVariants}
                    >
                       <MaintenanceIllustration />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl md:text-5xl font-light text-slate-700 leading-tight">
                             {title.map((el, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        duration: 0.25,
                                        delay: i / 10,
                                    }}
                                    className="inline-block mr-3"
                                >
                                    {el}
                                </motion.span>
                            ))}
                            <br />
                            <strong className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">
                                {title2.map((el, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            type: 'spring',
                                            damping: 15,
                                            stiffness: 200,
                                            delay: (title.length + i) / 10,
                                        }}
                                        className="inline-block"
                                    >
                                        {el}
                                    </motion.span>
                                ))}
                            </strong>
                        </h1>
                        <motion.p 
                            className="mt-6 text-base md:text-lg text-slate-500 max-w-lg mx-auto"
                            variants={itemVariants}
                        >
                             We're currently performing scheduled maintenance to improve our services. We'll be back online shortly. Thank you for your patience!
                        </motion.p>
                    </motion.div>
                    
                    <motion.div 
                        variants={itemVariants}
                        className="mt-8 flex items-center gap-3 text-sm font-medium text-slate-400"
                    >
                        <motion.div 
                            className="w-2 h-2 bg-indigo-400 rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <span>Work in progress...</span>
                    </motion.div>

                    <motion.footer 
                        variants={itemVariants}
                        className="mt-8 text-gray-500 text-xs"
                    >
                        &copy;2025 Sales Dashboard. All rights reserved.
                    </motion.footer>

                </motion.div>
            </div>
        </div>
    );
};
