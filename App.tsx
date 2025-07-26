import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from 'react-joyride';
import { AnimatePresence } from 'framer-motion';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { fetchAndParseData, fetchUserPermissions, fetchPerformanceData, fetchTodaysTaskData } from './services/googleSheetService';
import { fetchHelpTickets, updateTicketStatus, updateMaintenanceStatus, DEVELOPER_EMAIL } from './services/helpService';
import { loginSteps, dashboardStepsAdmin, dashboardStepsUser } from './services/tourService';
import { tts } from './services/ttsService';
import { TourTooltip } from './components/TourTooltip';
import { FollowUpData, UserPermission, PerformanceData, HelpTicket, TodaysTaskData } from './types';
import { LoadingComponent } from './components/LoadingComponent';
import Screensaver from './components/Screensaver';
import { MaintenancePage } from './components/MaintenancePage';
import { logActivity } from './services/activityService';


// Declare Swal for TypeScript since it's loaded from a script tag
declare const Swal: any;

// --- CONFIGURATION ---
// Easily configurable screensaver start time in milliseconds
const SCREENSAVER_TIMEOUT = 50000;

const App: React.FC = () => {
    const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('userEmail'));
    const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'));
    const [userRole, setUserRole] = useState<'Admin' | 'User' | null>(() => {
        const role = localStorage.getItem('userRole');
        return (role === 'Admin' || role === 'User') ? role : null;
    });

    const [allData, setAllData] = useState<FollowUpData[]>([]);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [todaysTaskData, setTodaysTaskData] = useState<TodaysTaskData[]>([]);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
    const [helpTickets, setHelpTickets] = useState<HelpTicket[]>([]);
    const [scUserEmails, setScUserEmails] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [maintenanceStatus, setMaintenanceStatus] = useState<'ON' | 'OFF'>('OFF');
    const [countdown, setCountdown] = useState<number>(0); // This is now a duration in seconds, counting up
    const [isMaintenanceToggling, setIsMaintenanceToggling] = useState(false);
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState<boolean>(false);
    
    // Tour state
    const [{ run, steps, stepIndex }, setTourState] = useState<{
        run: boolean;
        steps: Step[];
        stepIndex: number;
    }>({
        run: false,
        steps: [],
        stepIndex: 0,
    });
    
    // Screensaver state
    const [isScreensaverActive, setIsScreensaverActive] = useState(false);
    const inactivityTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleUserActivity = useCallback(() => {
        setIsScreensaverActive(false);

        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        inactivityTimerRef.current = setTimeout(() => {
            if (!run) {
                setIsScreensaverActive(true);
            }
        }, SCREENSAVER_TIMEOUT);
    }, [run]);

    useEffect(() => {
        const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => window.addEventListener(event, handleUserActivity));
        
        handleUserActivity();

        return () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
            events.forEach(event => window.removeEventListener(event, handleUserActivity));
        };
    }, [handleUserActivity]);

    const fetchTickets = useCallback(async () => {
        if (userEmail && userRole) {
            try {
                const tickets = await fetchHelpTickets(userEmail, userRole);
                setHelpTickets(tickets);
            } catch (err) {
                console.error("Failed to fetch help tickets", err);
            }
        }
    }, [userEmail, userRole]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [data, permissions, perfData, tasks] = await Promise.all([
                fetchAndParseData(),
                fetchUserPermissions(),
                fetchPerformanceData(),
                fetchTodaysTaskData(),
            ]);
            setAllData(data);
            setUserPermissions(permissions);
            setPerformanceData(perfData);
            setTodaysTaskData(tasks);
            setLastUpdated(new Date());

            const maintenanceSetting = permissions.find(p => p.userType === 'Maintenance' && p.email === 'status');
            const currentStatus = (maintenanceSetting?.name === 'ON') ? 'ON' : 'OFF';
            setMaintenanceStatus(currentStatus);
            
            if (userEmail && userRole) {
                await fetchTickets();
            }

        } catch (err) {
            setError('Failed to load dashboard data. Please check your connection or contact support.');
            console.error(err);
        } finally {
            setIsLoading(false);
            // Set initial load to complete. It's safe to call this multiple times.
            setIsInitialLoadComplete(true);
        }
    }, [userEmail, userRole, fetchTickets]);

    useEffect(() => {
        // Don't run this effect until the initial data fetch is complete.
        // This prevents clearing localStorage based on the initial default state.
        if (!isInitialLoadComplete) {
            return;
        }

        let timerId: number | undefined;

        if (maintenanceStatus === 'ON') {
            const startTimeString = localStorage.getItem('maintenanceStartTime');
            
            if (startTimeString) {
                const startTime = new Date(startTimeString).getTime();
                
                const updateCountdown = () => {
                    const now = new Date().getTime();
                    const elapsedSeconds = Math.floor((now - startTime) / 1000);
                    setCountdown(elapsedSeconds >= 0 ? elapsedSeconds : 0);
                };
                
                updateCountdown(); // Set initial value immediately
                timerId = window.setInterval(updateCountdown, 1000);

            } else {
                // If maintenance is ON but there's no start time, something is amiss.
                // The safest thing to do is show 0 and wait for the next data refresh.
                // The incorrect fallback logic that created a *new* start time here has been removed.
                setCountdown(0);
            }

        } else {
            // Maintenance is confirmed to be OFF after the initial load.
            // It's now safe to clear the state and localStorage.
            setCountdown(0); 
            localStorage.removeItem('maintenanceStartTime');
        }

        return () => {
            if(timerId) clearInterval(timerId);
        };
    }, [maintenanceStatus, isInitialLoadComplete]);


    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        handleRefresh();
        const intervalId = setInterval(handleRefresh, 60000); 

        return () => clearInterval(intervalId);
    }, [handleRefresh]);
    
    useEffect(() => {
        if (userEmail && userPermissions.length > 0) {
            const userPermission = userPermissions.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
            if (userPermission?.name) {
                setUserName(userPermission.name);
                localStorage.setItem('userName', userPermission.name);
            } else {
                handleLogout(false);
            }
        }
    }, [userEmail, userPermissions]);

    useEffect(() => {
        if (userRole === 'Admin' && userPermissions.length > 0) {
            const userEmails = userPermissions
                .filter(p => p.userType === 'User' && p.email)
                .map(p => p.email)
                .sort();
            setScUserEmails(userEmails);
        }
    }, [userRole, userPermissions]);

    useEffect(() => {
        if (run && steps[stepIndex]) {
            const content = steps[stepIndex].content as string;
            tts.speak(content);
        }
    }, [run, stepIndex, steps]);

    const handleLogin = (email: string, loginMethod: 'Google' | 'OTP') => {
        const normalizedEmail = email.toLowerCase().trim();
        const userPermission = userPermissions.find(p => p.email.toLowerCase() === normalizedEmail);

        if (userPermission && (userPermission.userType === 'Admin' || userPermission.userType === 'User' || userPermission.email.toLowerCase() === DEVELOPER_EMAIL.toLowerCase()) && userPermission.name) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Login Successfully!",
              showConfirmButton: false,
              timer: 1500
            });
            
            const trimmedEmail = email.trim();
            const role = userPermission.userType as 'Admin' | 'User';
            const name = userPermission.name;
            
            logActivity(trimmedEmail, name, 'Login', loginMethod);

            localStorage.setItem('userEmail', trimmedEmail);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', name);

            setUserEmail(trimmedEmail);
            setUserRole(role);
            setUserName(name);

            handleUserActivity();

            if (role === 'Admin') {
                const userEmails = userPermissions
                    .filter(p => p.userType === 'User' && p.email)
                    .map(p => p.email)
                    .sort();
                setScUserEmails(userEmails);
            }
        } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Email id not registered or user data is incomplete.",
              footer: 'Please use the "Need Help?" option to contact support.'
            });
        }
    };

    const handleLogout = (showSuccessMessage = true) => {
        if (run) handleTourEnd();

        if (userEmail && userName) {
            logActivity(userEmail, userName, 'Logout', null);
        }

        if (showSuccessMessage) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Logout Successfully!",
              showConfirmButton: false,
              timer: 1500
            });
        }

        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        sessionStorage.removeItem('datatable-column-widths');

        setUserEmail(null);
        setUserRole(null);
        setUserName(null);
        setScUserEmails([]);
        setHelpTickets([]);
        
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
    
    const handleTourStart = (page: 'login' | 'dashboard') => {
        let tourSteps: Step[] = [];
        if (page === 'login') {
            tourSteps = loginSteps;
        } else if (page === 'dashboard') {
            tourSteps = userRole === 'Admin' ? dashboardStepsAdmin : dashboardStepsUser;
        }

        setTourState({ run: true, steps: tourSteps, stepIndex: 0 });
    };

    const handleTourEnd = () => {
        tts.stop();
        setTourState({ run: false, steps: [], stepIndex: 0 });
    };

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type, index, action } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            handleTourEnd();
            return;
        }
        
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            const nextStepIndex = index + (action === 'prev' ? -1 : 1);
            setTourState(prev => ({...prev, stepIndex: nextStepIndex}));
        }
    };
    
    const handleUpdateTicket = async (ticketId: string, status: string) => {
        if (!userName || !userEmail) return;
        try {
            await updateTicketStatus(ticketId, status, userEmail, userName);
            Swal.fire({
                icon: 'success',
                title: 'Ticket Updated',
                text: `The ticket status has been changed to "${status}".`,
                timer: 2000,
                showConfirmButton: false,
            });
            await fetchTickets();
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: (err as Error).message,
            });
        }
    };

    const handleUpdateMaintenanceStatus = async (newStatus: 'ON' | 'OFF') => {
        if (!userEmail) return;

        const result = await Swal.fire({
            title: `Turn Maintenance Mode ${newStatus}?`,
            text: newStatus === 'ON'
                ? "This will make the site inaccessible to all users except you."
                : "This will restore normal access for all users.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'ON' ? '#ef4444' : '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, turn it ${newStatus}!`
        });

        if (result.isConfirmed) {
            setIsMaintenanceToggling(true);
            // Show a loading indicator immediately while the backend process runs.
            Swal.fire({
                title: 'Processing Update',
                html: `Turning maintenance mode <b>${newStatus}</b>. This may take a moment.`,
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await updateMaintenanceStatus(newStatus, userEmail);

                if (newStatus === 'ON') {
                    localStorage.setItem('maintenanceStartTime', new Date().toISOString());
                } else {
                    localStorage.removeItem('maintenanceStartTime');
                }

                // After updating, refresh all data to reflect the change everywhere.
                await handleRefresh(); 

                // Once everything is done, show the success message.
                // The loading Swal will be replaced by this one.
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Maintenance mode is now ${newStatus}.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (err) {
                // If an error occurs, show an error message.
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: (err as Error).message,
                });
            } finally {
                setIsMaintenanceToggling(false);
            }
        }
    };


    if (isLoading && !isInitialLoadComplete) {
        return <LoadingComponent />;
    }

    if (maintenanceStatus === 'ON' && userEmail?.toLowerCase() !== DEVELOPER_EMAIL) {
        return <MaintenancePage />;
    }

    const joyrideStyles = {
        options: {
            arrowColor: '#fff',
            backgroundColor: '#fff',
            primaryColor: '#4f46e5',
            textColor: '#374151',
            zIndex: 10000,
        },
    };

    const renderScreensaver = () => {
        return <Screensaver />;
    };

    return (
        <>
            <AnimatePresence>
                {isScreensaverActive && renderScreensaver()}
            </AnimatePresence>
            <Joyride
                run={run}
                steps={steps}
                stepIndex={stepIndex}
                callback={handleJoyrideCallback}
                continuous
                showProgress
                showSkipButton
                tooltipComponent={TourTooltip}
                styles={joyrideStyles}
            />
            {!userEmail || !userRole || !userName ? (
                <LoginPage onLogin={handleLogin} error={error} onStartTour={() => handleTourStart('login')} />
            ) : (
                <DashboardPage
                    userEmail={userEmail}
                    userName={userName}
                    userRole={userRole}
                    scUserEmails={scUserEmails}
                    data={allData}
                    performanceData={performanceData}
                    todaysTaskData={todaysTaskData}
                    helpTickets={helpTickets}
                    onUpdateTicket={handleUpdateTicket}
                    onLogout={handleLogout}
                    onRefresh={handleRefresh}
                    isRefreshing={isLoading}
                    lastUpdated={lastUpdated}
                    onStartTour={() => handleTourStart('dashboard')}
                    maintenanceStatus={maintenanceStatus}
                    onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
                    countdown={countdown}
                    isMaintenanceToggling={isMaintenanceToggling}
                />
            )}
        </>
    );
};

export default App;
