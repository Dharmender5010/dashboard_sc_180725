import { Step } from 'react-joyride';

export const loginSteps: Step[] = [
  {
    target: '#login-title',
    content: "Hello! Welcome to the SC-Dashboard. I'm here to give you a quick tour of the application.",
    placement: 'bottom',
    title: 'Welcome!',
  },
  {
    target: '#google-login-button-container',
    content: 'You can sign in quickly and securely using your authorized Google account. Just click this button to proceed.',
    placement: 'bottom',
    title: 'Option 1: Sign In With Google',
  },
  {
    target: '#otp-login-container',
    content: 'Alternatively, you can enter your registered email address here and click "Send OTP". We\'ll email you a code to log in.',
    placement: 'top',
    title: 'Option 2: Email & OTP',
  },
  {
    target: '#floating-nav-toggle',
    content: 'If you ever need help or want to retake this tour, click this icon to access the options.',
    placement: 'left',
    title: 'Quick Access Menu',
  },
];

const commonDashboardSteps: Step[] = [
    {
        target: '#header-title',
        content: "Great, you're logged in! This is your main dashboard. Let's take a look around.",
        placement: 'bottom',
        title: 'Welcome to the Dashboard',
    },
    {
        target: '#header-user-info',
        content: 'You can see your user details right here, including your name, email, and role. The "Last Update" time shows when the data was last fetched.',
        placement: 'bottom',
        title: 'Your Information',
    },
    {
        target: '#header-refresh-button',
        content: 'The dashboard data automatically refreshes every minute. However, you can click this button to manually trigger a refresh at any time.',
        placement: 'bottom',
        title: 'Refresh Data',
    },
    {
        target: '#performance-cards-container',
        content: "These cards give you an at-a-glance summary of today's key performance metrics, such as leads assigned, calls made, and follow-ups completed.",
        placement: 'bottom',
        title: "Today's Performance",
    },
];

export const dashboardStepsAdmin: Step[] = [
    ...commonDashboardSteps,
    {
        target: '#filters-container',
        content: 'You can use these powerful filters to narrow down the data. As an Admin, you have some special capabilities!',
        placement: 'bottom',
        title: 'Filter Your Data',
    },
    {
        target: '#admin-sc-filter-container',
        content: 'Since you are an Admin, you can use this dropdown to view the dashboard from the perspective of any specific Sales Coordinator (SC).',
        placement: 'bottom',
        title: 'Filter by SC Email',
    },
    {
        target: '#date-range-filter-container',
        content: 'Use the date range picker to see follow-ups planned for a specific period. You can select a custom range or use one of the handy presets like "Today" or "This month".',
        placement: 'bottom',
        title: 'Filter by Date',
    },
    {
        target: '#reset-filters-button',
        content: 'If you want to clear all your applied filters and see the complete dataset again, just click this button.',
        placement: 'left',
        title: 'Reset All Filters',
    },
    {
        target: '#line-chart-container',
        content: 'This line chart visualizes the number of pending follow-ups organized by their planned date, helping you spot trends and backlogs.',
        placement: 'top',
        title: 'Date-wise Pending Chart',
    },
    {
        target: '#bar-chart-container',
        content: 'This bar chart shows a count of pending tasks grouped by their current step code. It’s a great way to see where most of the pending work is concentrated.',
        placement: 'top',
        title: 'Step Code Pending Chart',
    },
    {
        target: '#data-table-container',
        content: "Here is the heart of the dashboard: the data table. It lists all the detailed follow-up records. You can sort any column by clicking its header. As an Admin, you can even resize the columns to your liking by dragging the divider in the header.",
        placement: 'top',
        title: 'The Data Table',
    },
    {
        target: '#header-logout-button',
        content: 'And that concludes our tour! When you are finished, you can log out securely using this button. Feel free to take the tour again anytime!',
        placement: 'bottom',
        title: 'Logout',
    }
];

export const dashboardStepsUser: Step[] = [
    ...commonDashboardSteps,
    {
        target: '#filters-container',
        content: 'You can use these powerful filters to narrow down your follow-up data. Let\'s look at a couple of them.',
        placement: 'bottom',
        title: 'Filter Your Data',
    },
    {
        target: '#step-code-filter-container',
        content: 'For example, you can filter by a specific "Step Code" to see all tasks that are in the same stage.',
        placement: 'bottom',
        title: 'Filter by Step Code',
    },
    {
        target: '#date-range-filter-container',
        content: 'Use the date range picker to see follow-ups planned for a specific period. You can select a custom range or use one of the handy presets.',
        placement: 'bottom',
        title: 'Filter by Date',
    },
    {
        target: '#line-chart-container',
        content: 'This line chart visualizes your number of pending follow-ups organized by their planned date, helping you spot trends and manage your workload.',
        placement: 'top',
        title: 'Date-wise Pending Chart',
    },
    {
        target: '#data-table-container',
        content: "Here is the heart of the dashboard: the data table. It lists all your detailed follow-up records. You can sort any column by clicking its header, and use the 'Mark Done' button to open the action link.",
        placement: 'top',
        title: 'The Data Table',
    },
    {
        target: '#header-logout-button',
        content: 'And that concludes our tour! When you are finished, you can log out securely using this button. Feel free to take the tour again anytime!',
        placement: 'bottom',
        title: 'Logout',
    }
];