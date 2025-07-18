
/*
// --- CONSOLIDATED GOOGLE APPS SCRIPT (Code.gs) ---
// This single script handles all backend functionality: OTP Login & Help Desk Tickets.
// 1. In your Google Sheet, create a sheet named exactly "Need_Help".
// 2. In "Need_Help", add these headers in the first row:
//    TicketID, Timestamp, UserEmail, UserName, Issue, ScreenshotLink, Status, LastUpdated, ResolvedBy
// 3. Paste this entire script into your Apps Script project, replacing any old code.
// 4. Update the DRIVE_FOLDER_ID with your Google Drive folder's ID for screenshots.
// 5. Deploy as a Web App with "Execute as: Me" and "Who has access: Anyone". Use the generated URL in both helpService.ts and otpService.ts.

const SPREADSHEET_ID = '1JiwnMWCok3HumvYQA3IduXSFbAkkbGC0aBFFNK6Lti8';
const HELP_TICKETS_SHEET_NAME = 'Need_Help';
const OTP_LOG_SHEET_NAME = 'OTP_Log';
const PERMISSIONS_SHEET_NAME = 'Web_Permissions';
const DEVELOPER_EMAIL = "mis@bonhoeffermachines.in";
// IMPORTANT: Paste the ID of your Google Drive folder for screenshots here.
const DRIVE_FOLDER_ID = '1r4_tT807APYOq0XRUEkJLNbAAJgbmf41'; 

// Helper function to get a sheet and throw a specific error if not found.
function getSheet(name) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sheet) {
    throw new Error(`Sheet with name "${name}" was not found in the spreadsheet. Please ensure it exists and the name is spelled correctly.`);
  }
  return sheet;
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    let result;
    switch(action) {
      case 'send_otp': result = handleSendOtp(payload); break;
      case 'verify_otp': result = handleVerifyOtp(payload); break;
      case 'send_help_request': result = handleSendHelpRequest(payload); break;
      case 'get_help_tickets': result = handleGetHelpTickets(payload); break;
      case 'update_ticket_status': result = handleUpdateTicketStatus(payload); break;
      default: throw new Error("Invalid action specified.");
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, ...result })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log(error.toString());
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSendHelpRequest(payload) {
  const { email, issue, screenshot, userName } = payload;
  const sheet = getSheet(HELP_TICKETS_SHEET_NAME);
  const timestamp = new Date();
  const ticketId = "TID-" + timestamp.getTime();
  let screenshotLink = '';

  if (screenshot && screenshot.base64) {
    if (!DRIVE_FOLDER_ID) throw new Error("Google Drive Folder ID is not set in the Apps Script.");
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(Utilities.base64Decode(screenshot.base64), screenshot.mimeType, screenshot.fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    screenshotLink = file.getUrl();
  }
  
  if(sheet.getLastRow() === 0) {
      sheet.appendRow(['TicketID', 'Timestamp', 'UserEmail', 'UserName', 'Issue', 'ScreenshotLink', 'Status', 'LastUpdated', 'ResolvedBy']);
  }

  sheet.appendRow([ticketId, timestamp, email, userName || 'N/A', issue, screenshotLink, 'Pending', timestamp, '']);
  
  const subject = `New Help Ticket: ${ticketId} from ${email}`;
  const body = `A new help ticket has been submitted.\n\nUser: ${email}\nName: ${userName || 'N/A'}\nIssue: ${issue}\n\nScreenshot: ${screenshotLink || 'Not provided'}`;
  MailApp.sendEmail(DEVELOPER_EMAIL, subject, body);

  return { message: "Help request submitted successfully.", ticketId: ticketId };
}

function handleGetHelpTickets(payload) {
  const { userEmail, userRole } = payload;
  const sheet = getSheet(HELP_TICKETS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { tickets: [] };
  
  const headers = data.shift().map(h => {
      const trimmedHeader = String(h || '').trim();
      if (!trimmedHeader) return '';
      if (trimmedHeader.toUpperCase() === 'TICKETID') return 'ticketId';
      return trimmedHeader.charAt(0).toLowerCase() + trimmedHeader.slice(1);
  });

  const tickets = data.map(row => {
    let ticket = {};
    headers.forEach((header, i) => {
      if (header) {
        const value = row[i];
        ticket[header] = (value !== null && value !== undefined) ? String(value).trim() : value;
        if (header === 'timestamp' || header === 'lastUpdated') {
          const date = new Date(ticket[header]);
          if (!isNaN(date.getTime())) {
            ticket[header] = date.toISOString();
          }
        }
      }
    });
    return ticket;
  }).reverse();

  if (userRole === 'User' && userEmail.toLowerCase() !== DEVELOPER_EMAIL.toLowerCase()) {
    return { tickets: tickets.filter(t => t.userEmail && t.userEmail.toLowerCase() === userEmail.toLowerCase()) };
  } else {
    return { tickets: tickets };
  }
}

function handleUpdateTicketStatus(payload) {
  const { ticketId, status, userEmail, userName } = payload;
  const sheet = getSheet(HELP_TICKETS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) throw new Error("Ticket not found or sheet is empty.");
  
  const headers = data[0].map(h => String(h || '').trim());
  const ticketIdCol = headers.indexOf('TicketID');
  const statusCol = headers.indexOf('Status');
  const lastUpdatedCol = headers.indexOf('LastUpdated');
  const resolvedByCol = headers.indexOf('ResolvedBy');
  const userEmailCol = headers.indexOf('UserEmail');
  
  if (ticketIdCol === -1 || statusCol === -1 || lastUpdatedCol === -1 || resolvedByCol === -1) {
    throw new Error("One or more required columns (TicketID, Status, LastUpdated, ResolvedBy) are missing from the Need_Help sheet.");
  }

  for (let i = 1; i < data.length; i++) {
    const sheetTicketId = data[i][ticketIdCol] ? String(data[i][ticketIdCol]).trim() : '';
    
    if (sheetTicketId && sheetTicketId === ticketId) {
      const ticketOwnerEmail = data[i][userEmailCol];
      sheet.getRange(i + 1, statusCol + 1).setValue(status);
      sheet.getRange(i + 1, lastUpdatedCol + 1).setValue(new Date());

      let notificationSubject = `Your Help Ticket ${ticketId} has been updated`;
      let notificationBody = `Hello,\n\nThe status of your help ticket (${ticketId}) has been updated to: ${status}.\n\n`;

      if (status === 'Resolved' || status === 'Cancelled by Dev') {
        sheet.getRange(i + 1, resolvedByCol + 1).setValue(userEmail);
        notificationBody += `This action was performed by our support team.`
      }
      if(status === 'Cancelled by User') {
        notificationBody += `This ticket was cancelled by you.`
      }
      
      if (ticketOwnerEmail) MailApp.sendEmail(ticketOwnerEmail, notificationSubject, notificationBody);
      
      if (status === 'Cancelled by User') {
         MailApp.sendEmail(DEVELOPER_EMAIL, `Ticket Cancelled by User: ${ticketId}`, `User ${userEmail} (${userName}) has cancelled their ticket.`);
      }
      return { message: "Ticket status updated successfully." };
    }
  }
  throw new Error("Ticket not found.");
}

function handleSendOtp(payload) {
  const { email } = payload;
  const permissionsSheet = getSheet(PERMISSIONS_SHEET_NAME);
  const data = permissionsSheet.getDataRange().getValues();
  const emails = data.map(row => row[1] ? String(row[1]).toLowerCase().trim() : '');
  if (!emails.includes(email.toLowerCase().trim())) {
    throw new Error("This email is not registered for OTP login.");
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const timestamp = new Date();
  const logSheet = getSheet(OTP_LOG_SHEET_NAME);
  logSheet.appendRow([email, otp, timestamp, false]);
  MailApp.sendEmail(email, "Your Dashboard Login OTP", `Your One-Time Password is: ${otp}`);
  return { message: "OTP sent successfully." };
}

function handleVerifyOtp(payload) {
  const { email, otp } = payload;
  const logSheet = getSheet(OTP_LOG_SHEET_NAME);
  const data = logSheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    const row = data[i];
    if (String(row[0]).toLowerCase() === email.toLowerCase() && String(row[1]) === otp && !row[3]) {
      if ((new Date().getTime() - new Date(row[2]).getTime()) <= 300000) { // 5-minute validity
        logSheet.getRange(i + 1, 4).setValue(true);
        return { verified: true };
      } else {
        throw new Error("OTP has expired. Please request a new one.");
      }
    }
  }
  throw new Error("Invalid or expired OTP. Please try again.");
}
*/

import { HelpTicket } from '../types';

// --- CONFIGURATION ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby7jCjieMPMQos9EFSCoENqkQyUcolmg3kXS5AM99c_xXbj8Yro83Vcs7GG2fOr1FGa/exec';

export const DEVELOPER_EMAIL = "mis@bonhoeffermachines.in";

interface ScreenshotData {
    mimeType: string;
    fileName: string;
    base64: string;
}

interface HelpRequestPayload {
    email: string;
    userName: string;
    issue: string;
    screenshot: ScreenshotData | null;
}

const handleApiError = (error: unknown, context: string): Error => {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return new Error(`Could not ${context}. This is likely due to a network issue or a problem with the support service configuration. Please check your internet connection and contact the administrator if the problem persists.`);
    }
    if (error instanceof Error) {
         return new Error(`Could not ${context}. Please check your network connection or contact support. Details: ${error.message}`);
    }
    return new Error(`An unknown error occurred while trying to ${context}.`);
}


export const sendHelpRequest = async (payload: HelpRequestPayload): Promise<any> => {
    if (!WEB_APP_URL || WEB_APP_URL.includes('PASTE_YOUR_URL_HERE')) {
        const errorMessage = 'The "Need Help?" feature is not yet configured. Please contact the administrator to set up the support service.';
        console.error('Help Service Error:', errorMessage, 'The `WEB_APP_URL` in `services/helpService.ts` must be set to a valid Google Apps Script URL.');
        throw new Error(errorMessage);
    }

    const requestBody = { action: 'send_help_request', ...payload };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        
        if (!response.ok || result.success === false) {
           throw new Error(result.message || 'An unknown error occurred on the server.');
        }
        return result;

    } catch (error) {
        throw handleApiError(error, 'submit the help request');
    }
};

export const fetchHelpTickets = async (userEmail: string, userRole: 'Admin' | 'User'): Promise<HelpTicket[]> => {
    if (!WEB_APP_URL || WEB_APP_URL.includes('PASTE_YOUR_URL_HERE')) {
        return [];
    }
    
    const requestBody = { action: 'get_help_tickets', userEmail, userRole };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        if (!response.ok || result.success === false) {
           throw new Error(result.message || 'An unknown error occurred on the server.');
        }
        return result.tickets || [];
    } catch(error) {
        throw handleApiError(error, 'fetch help tickets');
    }
};

export const updateTicketStatus = async (ticketId: string, status: string, userEmail: string, userName: string): Promise<any> => {
     if (!WEB_APP_URL || WEB_APP_URL.includes('PASTE_YOUR_URL_HERE')) {
        throw new Error('The help service is not configured.');
    }
    
    const requestBody = { action: 'update_ticket_status', ticketId, status, userEmail, userName };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(requestBody),
        });
        const result = await response.json();
        if (!response.ok || result.success === false) {
           throw new Error(result.message || 'An unknown error occurred on the server.');
        }
        return result;
    } catch(error) {
        throw handleApiError(error, 'update ticket status');
    }
}