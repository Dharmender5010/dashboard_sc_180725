
import React from 'react';
import { motion } from 'framer-motion';

const WrenchScrewdriverIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12.221 21.884a1.841 1.841 0 01-1.293-.538L6.463 16.88a1.841 1.841 0 010-2.606l6.623-6.623a1.841 1.841 0 012.606 0l4.465 4.465a1.841 1.841 0 010 2.606l-4.465 4.465a1.841 1.841 0 01-1.42.564l-2.055.033zm-4.155-5.838l3.617 3.617 1.414-1.414-3.617-3.617-1.414 1.414z" />
        <path d="M12.383 13.06L3.303 3.98a1.841 1.841 0 010-2.606 1.841 1.841 0 012.606 0l9.08 9.08-2.606 2.606z" />
        <path d="M2.116 21.884A1.841 1.841 0 01.763 19.83l3.078-5.333a1.841 1.841 0 013.188 1.841L3.955 21.67a1.841 1.841 0 01-1.839.214z" />
    </svg>
);


export const MaintenancePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white font-sans overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-gray-700/20 [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
            <motion.div
                className="relative z-10 flex flex-col items-center text-center p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <motion.div
                    animate={{ rotate: [0, -3, 3, 0], scale: [1, 1.03, 1, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <WrenchScrewdriverIcon className="w-24 h-24 text-red-500 mb-6" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-red-500 tracking-wide uppercase">
                    This website is under maintenance
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-md">
                    We're making some improvements and will be back shortly. Thank you for your patience.
                </p>
                 <footer className="mt-12 text-gray-500 text-sm">
                    &copy;2025 Sales Dashboard. Developed by Dharmender.
                </footer>
            </motion.div>
            <style>{`
            .bg-grid-gray-700\\/20 {
                background-image:
                    linear-gradient(to right, rgba(100, 116, 139, 0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(100, 116, 139, 0.2) 1px, transparent 1px);
                background-size: 4rem 4rem;
            }
            `}</style>
        </div>
    );
};
