import { FollowUpData, UserPermission, PerformanceData } from '../types';

const SHEET_ID = '1lpb27xNoG6eTeskB1ATT36zxjgV2QLKQjNWruhhmDhY';
const SHEET_NAME = 'SC4&6_Dashboard_Data';
const SHEET_RANGE = 'A1:T';

const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&range=${SHEET_RANGE}`;

export const fetchAndParseData = async (): Promise<FollowUpData[]> => {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // Find the start and end of the JSON object within the JSONP response.
        const startIndex = text.indexOf('(');
        const endIndex = text.lastIndexOf(')');

        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Invalid Google Sheets response format. Cannot find JSONP wrapper.');
        }

        const jsonText = text.substring(startIndex + 1, endIndex);
        
        const result = JSON.parse(jsonText);
        
        if (result.status === 'error') {
            throw new Error(result.errors.map((e: { detailed_message: string }) => e.detailed_message).join(', '));
        }
        
        const rows = result.table.rows;
        
        // Handle case where sheet has no data rows.
        if (!rows || rows.length === 0) {
            return [];
        }

        const data: FollowUpData[] = rows.map((row: { c: ({ v: any; f?: string; })[] }) => {
            const cells = row.c;
            // Column mapping: A=0, B=1, ... R=17, S=18, T=19
            return {
                leadId: String(cells[0]?.v ?? '').trim(),
                personName: String(cells[1]?.v ?? '').trim(),
                mobile: cells[2]?.v ?? null,
                state: String(cells[3]?.v ?? '').trim(),
                requirement: String(cells[4]?.v ?? '').trim(),
                salesPerson: String(cells[5]?.v ?? '').trim(),
                stepName: String(cells[6]?.v ?? '').trim(),
                stepCode: String(cells[7]?.v ?? '').trim(),
                daysOfFollowUp: cells[8]?.v ?? null,
                numberOfFollowUps: cells[9]?.v ?? null,
                planned: String(cells[10]?.f ?? cells[10]?.v ?? '').trim(),
                actual: String(cells[11]?.f ?? cells[11]?.v ?? '').trim(),
                lastStatus: String(cells[12]?.v ?? '').trim(),
                link: String(cells[14]?.v ?? '').trim(), 
                scEmail: String(cells[15]?.v ?? '').trim(),
                lastPlannedDcDoor: String(cells[17]?.f ?? cells[17]?.v ?? '').trim(),
                doer: String(cells[18]?.v ?? '').trim(), 
                remark: String(cells[13]?.v ?? '').trim(),
            };
        });
        
        return data.slice(1); // Remove header row

    } catch (error) {
        console.error("Failed to fetch or parse Google Sheet data:", error);
        throw error;
    }
};

const PERMISSIONS_SHEET_ID = '1JiwnMWCok3HumvYQA3IduXSFbAkkbGC0aBFFNK6Lti8';
const PERMISSIONS_SHEET_NAME = 'Web_Permissions';
const PERMISSIONS_SHEET_RANGE = 'A1:C';

const PERMISSIONS_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${PERMISSIONS_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(PERMISSIONS_SHEET_NAME)}&range=${PERMISSIONS_SHEET_RANGE}`;

export const fetchUserPermissions = async (): Promise<UserPermission[]> => {
    try {
        const response = await fetch(PERMISSIONS_GOOGLE_SHEET_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        const startIndex = text.indexOf('(');
        const endIndex = text.lastIndexOf(')');

        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Invalid Google Sheets response format for permissions. Cannot find JSONP wrapper.');
        }

        const jsonText = text.substring(startIndex + 1, endIndex);
        
        const result = JSON.parse(jsonText);
        
        if (result.status === 'error') {
            throw new Error(result.errors.map((e: { detailed_message: string }) => e.detailed_message).join(', '));
        }
        
        const rows = result.table.rows;
        
        if (!rows || rows.length === 0) {
            return [];
        }

        const permissions: UserPermission[] = rows.map((row: { c: ({ v: any })[] }) => {
            const cells = row.c;
            return {
                userType: String(cells[0]?.v ?? '').trim(),
                email: String(cells[1]?.v ?? '').trim(),
                name: String(cells[2]?.v ?? '').trim(),
            };
        });
        
        return permissions.slice(1).filter(p => p.email && p.userType); // Remove header row and any empty rows

    } catch (error) {
        console.error("Failed to fetch or parse Google Sheet permissions data:", error);
        throw error;
    }
};

const PERFORMANCE_SHEET_ID = '1JiwnMWCok3HumvYQA3IduXSFbAkkbGC0aBFFNK6Lti8';
const PERFORMANCE_SHEET_NAME = 'Web_App_Data';
const PERFORMANCE_SHEET_RANGE = 'A1:G';

const PERFORMANCE_GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${PERFORMANCE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(PERFORMANCE_SHEET_NAME)}&range=${PERFORMANCE_SHEET_RANGE}`;

export const fetchPerformanceData = async (): Promise<PerformanceData[]> => {
    try {
        const response = await fetch(PERFORMANCE_GOOGLE_SHEET_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        const startIndex = text.indexOf('(');
        const endIndex = text.lastIndexOf(')');

        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Invalid Google Sheets response format for performance data. Cannot find JSONP wrapper.');
        }

        const jsonText = text.substring(startIndex + 1, endIndex);
        const result = JSON.parse(jsonText);
        
        if (result.status === 'error') {
            throw new Error(result.errors.map((e: { detailed_message: string }) => e.detailed_message).join(', '));
        }
        
        const rows = result.table.rows;
        
        if (!rows || rows.length === 0) {
            return [];
        }

        const performanceData: PerformanceData[] = rows.map((row: { c: ({ v: any })[] }) => {
            const cells = row.c;
            // A: SC Email, B: SC, C: Leads Assign, D: Calls Made, E: Meeting Fixed, F: On FollowUps, G: FollowUps Done
            return {
                scEmail: String(cells[0]?.v ?? '').trim(),
                sc: String(cells[1]?.v ?? '').trim(),
                leadsAssign: Number(cells[2]?.v ?? 0),
                callsMade: Number(cells[3]?.v ?? 0),
                meetingFixed: Number(cells[4]?.v ?? 0),
                onFollowUps: Number(cells[5]?.v ?? 0),
                followUpsDone: Number(cells[6]?.v ?? 0),
            };
        });
        
        return performanceData.slice(1).filter(p => p.scEmail); // Remove header row and any empty rows

    } catch (error) {
        console.error("Failed to fetch or parse Google Sheet performance data:", error);
        throw error;
    }
};
