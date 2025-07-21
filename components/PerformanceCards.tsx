import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PerformanceData } from '../types';
import { PerformanceCard } from './PerformanceCard';
import { InboxArrowDownIcon, PhoneIcon, CalendarDaysIcon, ArrowPathIcon, CheckBadgeIcon } from './icons';

interface PerformanceCardsProps {
    userRole: 'Admin' | 'User';
    userEmail: string;
    selectedScEmail: string;
    performanceData: PerformanceData[];
    maintenanceStatus: 'ON' | 'OFF';
    countdown: number;
}

const initialSummary = {
    leadsAssign: 0,
    callsMade: 0,
    meetingFixed: 0,
    onFollowUps: 0,
    followUpsDone: 0,
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

interface CircularTimerProps {
    value: number;
    maxValue: number;
    label: string;
    color: string;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ value, maxValue, label, color }) => {
    const RADIUS = 30;
    const STROKE_WIDTH = 5;
    const circumference = RADIUS * 2 * Math.PI;
    const progress = value / maxValue;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="flex flex-col items-center text-center">
            <div className="relative w-[72px] h-[72px]">
                <svg
                    height="100%"
                    width="100%"
                    viewBox="0 0 70 70"
                    className="-rotate-90"
                >
                    <circle
                        stroke="rgba(255, 255, 255, 0.15)"
                        fill="transparent"
                        strokeWidth={STROKE_WIDTH}
                        r={RADIUS}
                        cx="35"
                        cy="35"
                    />
                    <motion.circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={STROKE_WIDTH}
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                        r={RADIUS}
                        cx="35"
                        cy="35"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white tracking-tight font-mono">
                        {String(value).padStart(2, '0')}
                    </span>
                </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase mt-1 tracking-wider">
                {label}
            </span>
        </div>
    );
};

export const PerformanceCards: React.FC<PerformanceCardsProps> = ({ userRole, userEmail, selectedScEmail, performanceData, maintenanceStatus, countdown }) => {

    const summaryData = useMemo(() => {
        if (!performanceData || performanceData.length === 0) {
            return initialSummary;
        }

        if (userRole === 'Admin') {
            if (selectedScEmail) {
                const userData = performanceData.find(p => p.scEmail === selectedScEmail);
                return userData || initialSummary;
            } else {
                // Sum of all users for admin
                return performanceData.reduce((acc, curr) => {
                    acc.leadsAssign += curr.leadsAssign;
                    acc.callsMade += curr.callsMade;
                    acc.meetingFixed += curr.meetingFixed;
                    acc.onFollowUps += curr.onFollowUps;
                    acc.followUpsDone += curr.followUpsDone;
                    return acc;
                }, { ...initialSummary, scEmail: '', sc: '' });
            }
        } else {
            // Data for the logged-in user
            const userData = performanceData.find(p => p.scEmail.toLowerCase() === userEmail.toLowerCase());
            return userData || initialSummary;
        }

    }, [performanceData, userRole, userEmail, selectedScEmail]);

    const cards = [
        { title: 'Leads Assign', value: summaryData.leadsAssign, icon: <InboxArrowDownIcon className="h-6 w-6" /> },
        { title: 'Calls Made', value: summaryData.callsMade, icon: <PhoneIcon className="h-6 w-6" /> },
        { title: 'Meeting Fixed', value: summaryData.meetingFixed, icon: <CalendarDaysIcon className="h-6 w-6" /> },
        { title: 'On FollowUps', value: summaryData.onFollowUps, icon: <ArrowPathIcon className="h-6 w-6" /> },
        { title: 'FollowUps Done', value: summaryData.followUpsDone, icon: <CheckBadgeIcon className="h-6 w-6" /> },
    ];
    
    const hours = Math.floor(countdown / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Today's Performance</h1>
                {maintenanceStatus === 'ON' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                        className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 p-4 shadow-lg border border-red-500/30"
                        id="maintenance-status-display"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            className="flex-shrink-0"
                        >
                            <svg className="h-8 w-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </motion.div>
                        
                        <div className="flex-grow">
                            <p className="font-bold text-white text-sm">Maintenance Mode</p>
                            <p className="text-xs text-slate-400">Elapsed Time</p>
                        </div>

                        <div className="flex items-start gap-4">
                            <CircularTimer value={hours} maxValue={24} label="Hours" color="#f59e0b" />
                            <CircularTimer value={minutes} maxValue={60} label="Minutes" color="#ef4444" />
                            <CircularTimer value={seconds} maxValue={60} label="Seconds" color="#f87171" />
                        </div>
                    </motion.div>
                )}
            </div>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5"
                variants={container}
                initial="hidden"
                animate="visible"
            >
                {cards.map(card => (
                    <motion.div key={card.title} variants={item} className="h-full">
                        <PerformanceCard title={card.title} value={card.value} icon={card.icon} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
