
import React, { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { FollowUpData, PerformanceData, HelpTicket } from '../types';
import { Header } from './Header';
import { BarChartComponent } from './BarChartComponent';
import { LineChartComponent } from './LineChartComponent';
import { DataTable } from './DataTable';
import { FilterXIcon } from './icons';
import { SearchableSelect } from './SearchableSelect';
import { DateRangePicker } from './DateRangePicker';
import { PerformanceCards } from './PerformanceCards';
import { AnimatedBackground } from './AnimatedBackground';
import { HelpModal } from './HelpModal';
import { NotificationsPanel } from './NotificationsPanel';
import { FormModal } from './FormModal';
import { FloatingNav } from './FloatingNav';

interface DashboardPageProps {
  userEmail: string;
  userName: string;
  userRole: 'Admin' | 'User';
  scUserEmails: string[];
  data: FollowUpData[];
  performanceData: PerformanceData[];
  helpTickets: HelpTicket[];
  onUpdateTicket: (ticketId: string, status: string) => Promise<void>;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  onStartTour: () => void;
}

const monthOrder: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

const parseDateString = (dateStr: string): Date | null => {
    const parts = dateStr.split('-');
    if (parts.length === 2) {
        const day = parseInt(parts[0], 10);
        const month = monthOrder[parts[1]];
        if (!isNaN(day) && month !== undefined) {
            const currentYear = new Date().getFullYear();
            const today = new Date();
            if (today.getMonth() < 3 && month > 8) {
                 return new Date(currentYear - 1, month, day);
            }
            return new Date(currentYear, month, day);
        }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    return null;
};

const pageContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    },
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ userEmail, userName, userRole, scUserEmails, data, performanceData, helpTickets, onUpdateTicket, onLogout, onRefresh, isRefreshing, lastUpdated, onStartTour }) => {
    const [filters, setFilters] = useState({ stepCode: '', mobile: '', leadId: '' });
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
    const [selectedScEmail, setSelectedScEmail] = useState<string>('');
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [formModalUrl, setFormModalUrl] = useState<string | null>(null);


    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleDateRangeApply = (range: { start: Date | null, end: Date | null }) => {
        setDateRange(range);
    }

    const handleResetFilters = () => {
        setFilters({ stepCode: '', mobile: '', leadId: '' });
        setDateRange({ start: null, end: null });
        if (userRole === 'Admin') {
            setSelectedScEmail('');
        }
    };
    
    const handleOpenFormModal = (url: string) => {
        if (url.includes('/viewform')) {
            const embedUrl = url.replace('/viewform', '/viewform?embedded=true');
            setFormModalUrl(embedUrl);
        } else {
            setFormModalUrl(url);
        }
    };

    const handleCloseFormModal = () => {
        setFormModalUrl(null);
        onRefresh(); // Refresh data automatically after user action
    };

    const baseData = useMemo(() => {
        if (userRole === 'Admin') {
            if (selectedScEmail) {
                return data.filter(item => item.scEmail === selectedScEmail);
            }
            return data;
        }
        return data.filter(item => item.scEmail.toLowerCase() === userEmail.toLowerCase());
    }, [data, userRole, userEmail, selectedScEmail]);

    const uniqueOptions = useMemo(() => {
        const stepCodes = new Set<string>();
        const mobiles = new Set<string>();
        const leadIds = new Set<string>();
        baseData.forEach(item => {
            if(item.stepCode) stepCodes.add(item.stepCode);
            if(item.mobile) mobiles.add(String(item.mobile));
            if(item.leadId) leadIds.add(item.leadId);
        });
        return {
            stepCodes: Array.from(stepCodes).sort(),
            mobiles: Array.from(mobiles).sort(),
            leadIds: Array.from(leadIds).sort()
        };
    }, [baseData]);

    const filteredData = useMemo(() => {
        return baseData.filter(item => {
            const stepCodeMatch = filters.stepCode ? item.stepCode === filters.stepCode : true;
            const mobileMatch = filters.mobile ? String(item.mobile) === filters.mobile : true;
            const leadIdMatch = filters.leadId ? item.leadId === filters.leadId : true;

            const dateMatch = (() => {
                if (!dateRange.start || !dateRange.end) return true;
                if (!item.lastPlannedDcDoor || !item.lastPlannedDcDoor.trim()) return false;
                
                const itemDate = parseDateString(item.lastPlannedDcDoor);
                if (!itemDate) return false;

                itemDate.setHours(0, 0, 0, 0);
                const startDate = new Date(dateRange.start);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);

                return itemDate >= startDate && itemDate <= endDate;
            })();

            return stepCodeMatch && mobileMatch && leadIdMatch && dateMatch;
        });
    }, [baseData, filters, dateRange]);

    const stepCodeData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        filteredData.forEach(item => {
            if (item.stepCode) {
                counts[item.stepCode] = (counts[item.stepCode] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [filteredData]);

    const dateWiseData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredData.forEach(item => {
             if (item.lastPlannedDcDoor && item.lastPlannedDcDoor.trim()) {
                const dateObj = parseDateString(item.lastPlannedDcDoor);
                if (dateObj && dateObj <= today) {
                    const dateKey = item.lastPlannedDcDoor.trim();
                    counts[dateKey] = (counts[dateKey] || 0) + 1;
                }
            }
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value, dateObj: parseDateString(name) }))
            .filter(item => item.dateObj !== null)
            .sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime())
            .map(({ name, value }) => ({ name, value }));

    }, [filteredData]);

    const effectiveUserEmail = userRole === 'Admin' && selectedScEmail ? selectedScEmail : userEmail;

    return (
        <div className="min-h-screen font-sans">
            <AnimatedBackground />
            
            <FloatingNav 
                onStartTour={onStartTour}
                onOpenHelpModal={() => setIsHelpModalOpen(true)}
            />
            <HelpModal 
                isOpen={isHelpModalOpen} 
                onClose={() => setIsHelpModalOpen(false)}
                userEmail={userEmail}
                userName={userName}
            />
            <FormModal
                isOpen={!!formModalUrl}
                onClose={handleCloseFormModal}
                url={formModalUrl}
            />
            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                tickets={helpTickets}
                userEmail={userEmail}
                userName={userName}
                userRole={userRole}
                onUpdateTicket={onUpdateTicket}
            />


            <Header 
                userEmail={userEmail} 
                userName={userName} 
                userRole={userRole} 
                onLogout={onLogout} 
                onRefresh={onRefresh} 
                isRefreshing={isRefreshing} 
                lastUpdate={lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
                helpTickets={helpTickets}
                onToggleNotifications={() => setIsNotificationsOpen(prev => !prev)}
            />
            
            <main className="p-4 sm:p-6 lg:p-8 relative z-0">
                 <motion.div
                    variants={pageContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} id="performance-cards-container">
                        <PerformanceCards
                            userRole={userRole}
                            userEmail={userEmail}
                            selectedScEmail={selectedScEmail}
                            performanceData={performanceData}
                        />
                    </motion.div>
                    
                    <motion.div className="mb-8" variants={itemVariants} id="filters-container">
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${userRole === 'Admin' ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-2 xl:grid-cols-4'}`}>
                            {userRole === 'Admin' && (
                                <div id="admin-sc-filter-container">
                                  <SearchableSelect
                                      value={selectedScEmail}
                                      onChange={(val) => setSelectedScEmail(val)}
                                      options={scUserEmails.map(email => ({ value: email, label: email }))}
                                      placeholder="SC Email"
                                  />
                                </div>
                            )}
                            <div id="lead-id-filter-container">
                              <SearchableSelect
                                  value={filters.leadId}
                                  onChange={(val) => handleFilterChange('leadId', val)}
                                  options={uniqueOptions.leadIds.map(id => ({ value: id, label: id }))}
                                  placeholder="Lead ID"
                              />
                            </div>
                            <div id="step-code-filter-container">
                              <SearchableSelect
                                  value={filters.stepCode}
                                  onChange={(val) => handleFilterChange('stepCode', val)}
                                  options={uniqueOptions.stepCodes.map(code => ({ value: code, label: code }))}
                                  placeholder="Step Code"
                              />
                            </div>
                             <div id="date-range-filter-container">
                              <DateRangePicker 
                                value={dateRange}
                                onApply={handleDateRangeApply}
                              />
                            </div>
                            <div id="mobile-filter-container">
                               <SearchableSelect
                                  value={filters.mobile}
                                  onChange={(val) => handleFilterChange('mobile', val)}
                                  options={uniqueOptions.mobiles.map(mobile => ({ value: mobile, label: mobile }))}
                                  placeholder="Mobile Number"
                              />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleResetFilters}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-700 transition-all flex items-center justify-center gap-2"
                                aria-label="Reset Filters"
                                id="reset-filters-button"
                            >
                                <FilterXIcon className="h-5 w-5" />
                                <span>Reset Filters</span>
                            </button>
                        </div>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8" variants={pageContainerVariants}>
                       <motion.div variants={itemVariants} id="line-chart-container"><LineChartComponent data={dateWiseData} /></motion.div>
                       <motion.div variants={itemVariants} id="bar-chart-container"><BarChartComponent data={stepCodeData} /></motion.div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} id="data-table-container">
                        <DataTable 
                            data={filteredData} 
                            onOpenFormModal={handleOpenFormModal}
                        />
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};
