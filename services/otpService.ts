// A service to handle OTP (One-Time Password) login requests.
// This service uses a CONSOLIDATED Google Apps Script.

// --- INSTRUCTIONS (One-time setup for the administrator) ---
// 1. OPEN GOOGLE APPS SCRIPT:
//    Go to script.google.com/create
//
// 2. PASTE THE SCRIPT:
//    Erase the default content and paste the NEW CONSOLIDATED SCRIPT provided in the AI chat.
//    The script starts with "// --- Consolidated Google Apps Script (Code.gs) ---"
//
// 3. DEPLOY & AUTHORIZE:
//    - Click "Deploy" > "New deployment" as a "Web app".
//    - Set "Who has access" to "Anyone". This is required for the app to reach it.
//    - Click "Deploy". Authorize the script when prompted.
//
// 4. GET & PASTE URL:
//    - After deploying, copy the "Web app URL".
//    - Paste the single copied URL into the `WEB_APP_URL` constant below, and also in `helpService.ts`.
//
// NOTE: This file (otpService.ts) is for frontend code. DO NOT paste the Apps Script code here.

// --- CONFIGURATION ---
// PASTE YOUR **SINGLE, CONSOLIDATED** DEPLOYED WEB APP URL HERE.
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby7jCjieMPMQos9EFSCoENqkQyUcolmg3kXS5AM99c_xXbj8Yro83Vcs7GG2fOr1FGa/exec'; // This URL must be from your new, consolidated script deployment.

const makeApiCall = async (payload: object): Promise<any> => {
    if (!WEB_APP_URL || WEB_APP_URL.includes('PASTE_YOUR_URL_HERE')) {
        throw new Error('The OTP login service is not configured. Please contact the administrator.');
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        
        if (!response.ok || !result.success) {
           throw new Error(result.message || 'An unknown error occurred on the server.');
        }
        
        return result;

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
                 throw new Error('A network error occurred. Please check your connection and try again.');
            }
            throw error;
        }
        throw new Error('An unknown error occurred while contacting the login service.');
    }
};

/**
 * Requests an OTP to be sent to the specified email.
 * @param email The user's email address.
 * @returns A promise that resolves if the OTP was sent successfully.
 */
export const sendOtpRequest = async (email: string): Promise<void> => {
    await makeApiCall({ action: 'send_otp', email });
};

/**
 * Verifies the provided OTP for the given email.
 * @param email The user's email address.
 * @param otp The 6-digit OTP entered by the user.
 * @returns A promise that resolves to `true` if verification is successful, `false` otherwise.
 */
export const verifyOtpRequest = async (email: string, otp: string): Promise<boolean> => {
    const result = await makeApiCall({ action: 'verify_otp', email, otp });
    return result.verified === true;
};