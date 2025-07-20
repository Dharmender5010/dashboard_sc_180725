import React from 'react';
import { motion, Variants } from 'framer-motion';

interface PerformanceCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const cardVariants: Variants = {
    rest: {
        y: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 30
        }
    },
    hover: {
        y: -8,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 10
        }
    }
};

const iconContainerVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    hover: { scale: 1.15, rotate: -10, transition: { type: "spring", stiffness: 400, damping: 10 } }
};

const shineVariants: Variants = {
    rest: {
        x: "-100%",
        skewX: "20deg",
        transition: { duration: 0.5, ease: "circOut" }
    },
    hover: {
        x: "100%",
        skewX: "20deg",
        transition: { duration: 0.7, ease: "circIn" }
    }
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ title, value, icon }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-4 flex items-center space-x-3 border-l-4 border-brand-primary h-full overflow-hidden relative cursor-pointer"
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
    >
        {/* Shine effect element */}
        <motion.div
            className="absolute top-0 left-0 w-full h-full bg-white opacity-20 pointer-events-none"
            variants={shineVariants}
        />

      <motion.div 
        className="flex-shrink-0 bg-brand-light text-brand-primary rounded-full p-3 z-10"
        variants={iconContainerVariants}
      >
        {icon}
      </motion.div>
      <div className="min-w-0 flex-1 z-10 flex flex-col">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
};
