
import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, EVENTS } from 'react-joyride';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { fetchAndParseData, fetchUserPermissions, fetchPerformanceData } from './services/googleSheetService';
import { fetchHelpTickets, updateTicketStatus } from './services/helpService';
import { loginSteps, dashboardStepsAdmin, dashboardStepsUser } from './services/tourService';
import { tts } from './services/ttsService';
import { TourTooltip } from './components/TourTooltip';
import { FollowUpData, UserPermission, PerformanceData, HelpTicket } from './types';
import { LoadingComponent } from './components/LoadingComponent';

// Declare Swal for TypeScript since it's loaded from a script tag
declare const Swal: any;

const App: React.FC = () => {
    const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('userEmail'));
    const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'));
    const [userRole, setUserRole] = useState<'Admin' | 'User' | null>(() => {
        const role = localStorage.getItem('userRole');
        return (role === 'Admin' || role === 'User') ? role : null;
    });

    const [allData, setAllData] = useState<FollowUpData[]>([]);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
    const [helpTickets, setHelpTickets] = useState<HelpTicket[]>([]);
    const [scUserEmails, setScUserEmails] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
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

    const fetchTickets = useCallback(async () => {
        if (userEmail && userRole) {
            try {
                const tickets = await fetchHelpTickets(userEmail, userRole);
                setHelpTickets(tickets);
            } catch (err) {
                console.error("Failed to fetch help tickets", err);
                // Optionally show a non-blocking error toast
            }
        }
    }, [userEmail, userRole]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [data, permissions, perfData] = await Promise.all([
                fetchAndParseData(),
                fetchUserPermissions(),
                fetchPerformanceData()
            ]);
            setAllData(data);
            setUserPermissions(permissions);
            setPerformanceData(perfData);
            setLastUpdated(new Date());
            
            // Also fetch tickets after main data is loaded and user is known
            if (userEmail && userRole) {
                await fetchTickets();
            }

        } catch (err)
 {
            setError('Failed to load dashboard data. Please check your connection or contact support.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userEmail, userRole, fetchTickets]);

    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        handleRefresh(); // Initial data fetch
        const intervalId = setInterval(handleRefresh, 60000); // Refresh data every 1 minute

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
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
        // Speak content when the tour is running and the step changes
        if (run && steps[stepIndex]) {
            const content = steps[stepIndex].content as string;
            tts.speak(content);
        }
    }, [run, stepIndex, steps]);

    const handleLogin = (email: string) => {
        const normalizedEmail = email.toLowerCase().trim();
        const userPermission = userPermissions.find(p => p.email.toLowerCase() === normalizedEmail);

        if (userPermission && (userPermission.userType === 'Admin' || userPermission.userType === 'User') && userPermission.name) {
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
            
            localStorage.setItem('userEmail', trimmedEmail);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', name);

            setUserEmail(trimmedEmail);
            setUserRole(role);
            setUserName(name);

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
              footer: 'Please contact with system creation team'
            });
        }
    };

    const handleLogout = (showSuccessMessage = true) => {
        if (run) handleTourEnd(); // Stop tour on logout
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
        
        // Clear session-specific settings like column widths to reset to default on next login
        sessionStorage.removeItem('datatable-column-widths');

        setUserEmail(null);
        setUserRole(null);
        setUserName(null);
        setScUserEmails([]);
        setHelpTickets([]);
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
            await fetchTickets(); // Refresh tickets list
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: (err as Error).message,
            });
        }
    };


    if (isLoading && (!allData.length || !userPermissions.length)) {
        return <LoadingComponent />;
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

    return (
        <>
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
                    helpTickets={helpTickets}
                    onUpdateTicket={handleUpdateTicket}
                    onLogout={handleLogout}
                    onRefresh={handleRefresh}
                    isRefreshing={isLoading}
                    lastUpdated={lastUpdated}
                    onStartTour={() => handleTourStart('dashboard')}
                />
            )}
        </>
    );
};

export default App;
