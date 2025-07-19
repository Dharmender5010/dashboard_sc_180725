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

export const PerformanceCards: React.FC<PerformanceCardsProps> = ({ userRole, userEmail, selectedScEmail, performanceData }) => {

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

    return (
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Today's Performance</h1>
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