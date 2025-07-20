import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, RefreshCwIcon, LogOutIcon, BellIcon } from './icons';
import { HelpTicket } from '../types';
import { DEVELOPER_EMAIL } from '../services/helpService';

interface HeaderProps {
  userEmail: string;
  userName: string;
  userRole: 'Admin' | 'User';
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate: string;
  helpTickets: HelpTicket[];
  onToggleNotifications: () => void;
  maintenanceStatus: 'ON' | 'OFF';
  onUpdateMaintenanceStatus: (newStatus: 'ON' | 'OFF') => Promise<void>;
}

const formatDateTime = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];

    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');

    return `${dayName}, ${day}-${month}-${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
};


export const Header: React.FC<HeaderProps> = ({ userEmail, userName, userRole, onLogout, onRefresh, isRefreshing, lastUpdate, helpTickets, onToggleNotifications, maintenanceStatus, onUpdateMaintenanceStatus }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const isDeveloper = userEmail.toLowerCase() === DEVELOPER_EMAIL;

  const handleToggleMaintenance = () => {
    const newStatus = maintenanceStatus === 'ON' ? 'OFF' : 'ON';
    onUpdateMaintenanceStatus(newStatus);
  };

  const pendingTicketsCount = useMemo(() => {
    if (!helpTickets) return 0;
    if (userRole === 'User' && !isDeveloper) {
        return helpTickets.filter(t => t.userEmail.toLowerCase() === userEmail.toLowerCase() && t.status === 'Pending').length;
    }
    // For Admin and Dev, show all pending tickets
    return helpTickets.filter(t => t.status === 'Pending').length;
  }, [helpTickets, userEmail, userRole, isDeveloper]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
      <div id="header-title">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">SC-Dashboard FollowUps after Meeting</h1>
        <p className="text-sm text-gray-500 tracking-wide">{formatDateTime(currentDateTime)}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div id="header-user-info" className="text-right hidden sm:block">
          <p className="font-semibold text-brand-primary text-sm capitalize -mb-1">{userName} ({isDeveloper ? 'Developer' : userRole})</p>
          <div className="flex items-center gap-2 justify-end text-gray-600">
            <UserIcon className="h-5 w-5"/>
            <span className="font-medium text-sm">{userEmail}</span>
          </div>
          <p className="text-xs text-gray-400">Last Update: {lastUpdate}</p>
        </div>

        <div id="header-notifications-button">
            <button
                onClick={onToggleNotifications}
                className="relative p-2 text-gray-500 hover:text-brand-primary hover:bg-brand-light rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                aria-label="View notifications"
            >
                <BellIcon className="h-6 w-6" />
                {pendingTicketsCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 text-xs font-bold flex items-center justify-center rounded-full ring-2 ring-white bg-status-danger text-white">
                        {pendingTicketsCount}
                    </span>
                )}
            </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <p className="text-xs text-gray-400 mb-1">Auto refresh in every 1 min.</p>
            <div className="flex items-center gap-2">
              <motion.button
                id="header-refresh-button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-status-info hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </motion.button>
              <motion.button
                id="header-logout-button"
                onClick={() => onLogout()}
                className="flex items-center gap-2 bg-status-danger hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOutIcon className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>

          {isDeveloper && (
            <div className="flex flex-col items-center justify-center bg-gray-100 p-2 rounded-lg border border-gray-300 h-full">
              <label htmlFor="maintenance-toggle" className="relative inline-flex items-center cursor-pointer group">
                  <input
                      type="checkbox"
                      id="maintenance-toggle"
                      className="sr-only peer"
                      checked={maintenanceStatus === 'ON'}
                      onChange={handleToggleMaintenance}
                      aria-label="Toggle maintenance mode"
                  />
                  <div className="w-11 h-6 bg-status-success rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      Mode: {maintenanceStatus}
                  </span>
              </label>
              <span className="text-xs font-semibold text-gray-600 mt-1">Maintenance</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
