
import React from 'react';
import { motion } from 'framer-motion';

const MaintenanceIllustration = () => (
    <svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-2xl" aria-hidden="true">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="2" dy="4" result="offsetblur"/>
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.2"/>
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        {/* Browser window */}
        <g transform="translate(50, 50)" filter="url(#shadow)">
            <rect x="0" y="0" width="300" height="200" rx="10" fill="#eef2ff"/>
            <rect x="0" y="0" width="300" height="25" rx="10" ry="10" fill="#e0e7ff"/>
            <circle cx="15" cy="12.5" r="4" fill="#ef4444"/>
            <circle cx="30" cy="12.5" r="4" fill="#f59e0b"/>
            <circle cx="45" cy="12.5" r="4" fill="#22c55e"/>

            {/* Gears inside browser */}
            <g transform="translate(150, 110) scale(0.8)">
                <path d="M26.34-1.25a15 15 0 1 0 0 2.5L35 2.5v-5L26.34-1.25z M4.65-1.25a15 15 0 1 0 0 2.5L-4 2.5v-5l8.65-1.25z M16.25-25.29a15 15 0 1 0-2.5 0l-1.25-8.66h5l-1.25 8.66z M16.25 27.79a15 15 0 1 0-2.5 0l-1.25 8.66h5l-1.25-8.66z" fill="#4f46e5" transform="rotate(15)">
                    <animateTransform attributeName="transform" type="rotate" from="15 15 15" to="375 15 15" dur="10s" repeatCount="indefinite"/>
                </path>
                <circle r="7" fill="#eef2ff"/>
            </g>
            <g transform="translate(190, 140) scale(0.5)">
                <path d="M26.34-1.25a15 15 0 1 0 0 2.5L35 2.5v-5L26.34-1.25z M4.65-1.25a15 15 0 1 0 0 2.5L-4 2.5v-5l8.65-1.25z M16.25-25.29a15 15 0 1 0-2.5 0l-1.25-8.66h5l-1.25 8.66z M16.25 27.79a15 15 0 1 0-2.5 0l-1.25 8.66h5l-1.25-8.66z" fill="#6366f1" transform="rotate(0)">
                    <animateTransform attributeName="transform" type="rotate" from="0 15 15" to="-360 15 15" dur="8s" repeatCount="indefinite"/>
                </path>
                <circle r="7" fill="#eef2ff"/>
            </g>
        </g>
        
        {/* Phone */}
         <g transform="translate(320, 100)" filter="url(#shadow)">
            <rect x="0" y="0" width="80" height="160" rx="10" fill="#e0e7ff" />
            <rect x="5" y="5" width="70" height="150" rx="5" fill="white" />
             {/* Gear on phone */}
             <g transform="translate(40, 80) scale(0.9)">
                <path d="M26.34-1.25a15 15 0 1 0 0 2.5L35 2.5v-5L26.34-1.25z M4.65-1.25a15 15 0 1 0 0 2.5L-4 2.5v-5l8.65-1.25z M16.25-25.29a15 15 0 1 0-2.5 0l-1.25-8.66h5l-1.25 8.66z M16.25 27.79a15 15 0 1 0-2.5 0l-1.25 8.66h5l-1.25-8.66z" fill="#db2777" transform="rotate(45)">
                     <animateTransform attributeName="transform" type="rotate" from="45 15 15" to="405 15 15" dur="12s" repeatCount="indefinite"/>
                </path>
                <circle r="7" fill="white"/>
            </g>
        </g>

        {/* Wrench */}
        <g transform="translate(10, 260) scale(1.3)" filter="url(#shadow)" fill="#94a3b8">
            <path d="M20.7,5.2a3.4,3.4,0,0,0-4.8,0L5.3,15.8a1,1,0,0,0,0,1.4l4.2,4.2a1,1,0,0,0,1.4,0L21.5,11a3.4,3.4,0,0,0,0-4.8ZM10.2,20.7l-4.2-4.2L12,10.4,16.2,14.6ZM19.4,8.9,15.2,4.7a1.4,1.4,0,0,1,2-2l4.2,4.2a1.4,1.4,0,0,1,0,2L17.2,13.1,13,8.9Z" transform="scale(3) rotate(-30)"/>
        </g>

        {/* Person */}
        <g transform="translate(250, 180)" fill="#db2777" filter="url(#shadow)">
            <circle cx="15" cy="7" r="7"/>
            <rect x="5" y="14" width="20" height="40" rx="10"/>
        </g>
    </svg>
);


export const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-sky-50 font-sans flex items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-6xl mx-auto">
                <motion.div 
                    className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.3,
                                delayChildren: 0.2,
                            }
                        }
                    }}
                >
                    <motion.div 
                        className="w-full lg:w-1/2"
                        variants={{ hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 50 }}}}
                    >
                       <MaintenanceIllustration />
                    </motion.div>
                    
                    <motion.div 
                        className="w-full lg:w-1/2 text-center lg:text-left"
                        variants={{ hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 50 }}}}
                    >
                        <h1 className="text-4xl md:text-5xl font-light text-slate-700 leading-tight">
                            Website is under
                            <br />
                            <strong className="font-extrabold text-indigo-600">MAINTENANCE</strong>
                        </h1>
                        <p className="mt-6 text-base md:text-lg text-slate-500 max-w-md mx-auto lg:mx-0">
                             We're currently performing scheduled maintenance to improve our services. We'll be back online shortly. Thank you for your patience!
                        </p>
                         <footer className="mt-12 text-gray-500 text-sm">
                            &copy;2025 Sales Dashboard. All rights reserved.
                        </footer>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};
