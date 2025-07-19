
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ExclamationCircleIcon, AtSymbolIcon, KeyIcon, XMarkIcon } from './icons';a
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ExclamationCircleIcon, AtSymbolIcon, KeyIcon, XMarkIcon } from './icons';
import { AnimatedBackground } from './AnimatedBackground';
import { HelpModal } from './HelpModal';
import { sendOtpRequest, verifyOtpRequest } from '../services/otpService';
import { FloatingNav } from './FloatingNav';


// Declare google for TypeScript since it's loaded from a script tag
declare const google: any;
declare const Swal: any;

interface LoginPageProps {
  onLogin: (email: string) => void;
  error?: string | null;
  onStartTour: () => void;
}

interface CredentialResponse {
    credential?: string;
}

interface DecodedJwt {
    email: string;
    name: string;
    picture: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            damping: 25,
            stiffness: 100,
            staggerChildren: 0.15,
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { stiffness: 100 }
    }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, onStartTour }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);
  
  // New state for OTP flow
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const decodeJwt = (token: string): DecodedJwt | null => {
      try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(jsonPayload);
      } catch (e) {
          console.error("Error decoding JWT", e);
          return null;
      }
  };

  const handleGoogleLogin = (response: CredentialResponse) => {
      if (response.credential) {
          setIsGoogleLoading(true);
          const decodedToken = decodeJwt(response.credential);
          if (decodedToken && decodedToken.email) {
              onLogin(decodedToken.email);
          } else {
              console.error("Login failed: could not extract email from Google credential.");
              Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Could not retrieve your email from Google.'});
              setIsGoogleLoading(false);
          }
      } else {
          console.error("Google login failed", response);
          setIsGoogleLoading(false);
      }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!email) {
      setOtpError("Please enter your email address.");
      return;
    }
    setIsOtpLoading(true);
    try {
      await sendOtpRequest(email);
      setOtpSent(true);
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `An OTP has been sent to ${email}. Please check your inbox.`,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setOtpError(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!otp) {
      setOtpError("Please enter the OTP.");
      return;
    }
    setIsOtpLoading(true);
    try {
      const isVerified = await verifyOtpRequest(email, otp);
      if(isVerified) {
        onLogin(email);
      } else {
        setOtpError("Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setOtpError(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  useEffect(() => {
    if (isGoogleLoading) return; // Don't re-render the button while loading

    if (typeof google === 'undefined' || !google.accounts) {
        const timer = setTimeout(() => {
            if (googleButtonContainerRef.current) { }
        }, 100);
        return () => clearTimeout(timer);
    }
    
    google.accounts.id.initialize({
        client_id: '408844365048-f8vtj15ovskp5drcqpm8rj5sep9kloqr.apps.googleusercontent.com',
        callback: handleGoogleLogin,
    });

    if (googleButtonContainerRef.current) {
        google.accounts.id.renderButton(
            googleButtonContainerRef.current,
            { theme: "filled_blue", size: "large", type: "standard", shape: "rectangular", width: "350", text: "continue_with" }
        );
    }
  }, [isGoogleLoading]);

  const Spinner: React.FC = () => (
    <motion.div
        className="w-5 h-5 border-2 border-gray-200 border-t-brand-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1
        }}
    />
);

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans relative overflow-hidden">
      <AnimatedBackground />

      <p className="absolute top-4 right-4 text-xs font-semibold text-gray-500 z-20">Version 1.1.5</p>

      <FloatingNav 
        onStartTour={onStartTour}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      
      {/* Left side with image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <motion.img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.pexels.com/photos/8867432/pexels-photo-8867432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="A customer support agent with a headset in a modern call center."
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-blue-900 opacity-10"></div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10">
        <motion.div 
            className="mx-auto w-full max-w-sm text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          <motion.div variants={itemVariants} id="login-title">
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
              SC-Dashboard
            </h2>
            <p className="mt-2 text-md text-gray-500">
              Sign in to access your dashboard
            </p>
          </motion.div>

          <div className="mt-8">
            <motion.div variants={itemVariants} id="otp-login-container">
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.div
                      key="email-input"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <label htmlFor="email" className="sr-only">Email address</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                          placeholder="Enter your email"
                        />
                        {email && (
                            <button
                                type="button"
                                onClick={() => setEmail('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                aria-label="Clear email input"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-input"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <p className="text-sm text-gray-600 mb-2">
                        Enter the OTP sent to <strong>{email}</strong>
                      </p>
                       <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <KeyIcon className="h-5 w-5 text-gray-400" />
                         </div>
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6 [letter-spacing:8px] text-center font-extrabold"
                          placeholder="______"
                        />
                      </div>
                       <button type="button" onClick={() => setOtpSent(false)} className="text-sm text-brand-secondary hover:text-brand-dark mt-1">Use a different email</button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {(error || otpError) && (
                    <motion.div
                      className="rounded-md bg-red-50 p-3 mt-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800 ml-2">{error || otpError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={isOtpLoading}
                    className="flex w-full justify-center items-center rounded-md bg-brand-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isOtpLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{otpSent ? 'Verifying OTP...' : 'Sending OTP...'}</span>
                        </>
                    ) : (
                        otpSent ? 'Verify & Login' : 'Send OTP'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div variants={itemVariants} className="relative my-6" id="login-divider">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-100 px-2 text-gray-500 font-medium">OR</span>
                </div>
            </motion.div>

            <div className="flex justify-center items-center min-h-[50px]" id="google-login-button-container">
                {isGoogleLoading ? (
                     <Spinner />
                ) : (
                    <motion.div
                        ref={googleButtonContainerRef}
                        variants={itemVariants}
                    />
                )}
            </div>
             
             <footer className="text-center text-gray-500 text-xs mt-12">
                <p>&copy;{new Date().getFullYear()} Sales Dashboard. All rights reserved.</p>
            </footer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

import { AnimatedBackground } from './AnimatedBackground';
import { HelpButton } from './HelpButton';
import { HelpModal } from './HelpModal';
import { sendOtpRequest, verifyOtpRequest } from '../services/otpService';


// Declare google for TypeScript since it's loaded from a script tag
declare const google: any;
declare const Swal: any;

interface LoginPageProps {
  onLogin: (email: string) => void;
  error?: string | null;
  onStartTour: () => void;
}

interface CredentialResponse {
    credential?: string;
}

interface DecodedJwt {
    email: string;
    name: string;
    picture: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            damping: 25,
            stiffness: 100,
            staggerChildren: 0.15,
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { stiffness: 100 }
    }
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, onStartTour }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const googleButtonContainerRef = useRef<HTMLDivElement>(null);
  
  // New state for OTP flow
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const decodeJwt = (token: string): DecodedJwt | null => {
      try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(jsonPayload);
      } catch (e) {
          console.error("Error decoding JWT", e);
          return null;
      }
  };

  const handleGoogleLogin = (response: CredentialResponse) => {
      if (response.credential) {
          setIsGoogleLoading(true);
          const decodedToken = decodeJwt(response.credential);
          if (decodedToken && decodedToken.email) {
              onLogin(decodedToken.email);
          } else {
              console.error("Login failed: could not extract email from Google credential.");
              Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Could not retrieve your email from Google.'});
              setIsGoogleLoading(false);
          }
      } else {
          console.error("Google login failed", response);
          setIsGoogleLoading(false);
      }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!email) {
      setOtpError("Please enter your email address.");
      return;
    }
    setIsOtpLoading(true);
    try {
      await sendOtpRequest(email);
      setOtpSent(true);
      Swal.fire({
        icon: 'success',
        title: 'OTP Sent!',
        text: `An OTP has been sent to ${email}. Please check your inbox.`,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setOtpError(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!otp) {
      setOtpError("Please enter the OTP.");
      return;
    }
    setIsOtpLoading(true);
    try {
      const isVerified = await verifyOtpRequest(email, otp);
      if(isVerified) {
        onLogin(email);
      } else {
        setOtpError("Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred.';
      setOtpError(errorMessage);
    } finally {
      setIsOtpLoading(false);
    }
  };

  useEffect(() => {
    if (isGoogleLoading) return; // Don't re-render the button while loading

    if (typeof google === 'undefined' || !google.accounts) {
        const timer = setTimeout(() => {
            if (googleButtonContainerRef.current) { }
        }, 100);
        return () => clearTimeout(timer);
    }
    
    google.accounts.id.initialize({
        client_id: '408844365048-f8vtj15ovskp5drcqpm8rj5sep9kloqr.apps.googleusercontent.com',
        callback: handleGoogleLogin,
    });

    if (googleButtonContainerRef.current) {
        google.accounts.id.renderButton(
            googleButtonContainerRef.current,
            { theme: "filled_blue", size: "large", type: "standard", shape: "rectangular", width: "350", text: "continue_with" }
        );
    }
  }, [isGoogleLoading]);

  const Spinner: React.FC = () => (
    <motion.div
        className="w-5 h-5 border-2 border-gray-200 border-t-brand-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 1
        }}
    />
);

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans relative overflow-hidden">
      <AnimatedBackground />

      <p className="absolute top-4 right-4 text-xs font-semibold text-gray-500 z-20">Version 1.1.5</p>

       <button
          onClick={onStartTour}
          id="start-tour-button"
          className="fixed bottom-4 left-4 z-50 bg-white text-brand-primary rounded-lg px-4 py-2 shadow-lg hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-all text-sm font-semibold"
          aria-label="Take a Tour"
          title="Take a Tour"
        >
          Take a Tour
        </button>
      <HelpButton onClick={() => setIsHelpModalOpen(true)} />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      
      {/* Left side with image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <motion.img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.pexels.com/photos/8867432/pexels-photo-8867432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="A customer support agent with a headset in a modern call center."
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-blue-900 opacity-10"></div>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10">
        <motion.div 
            className="mx-auto w-full max-w-sm text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          <motion.div variants={itemVariants} id="login-title">
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
              SC-Dashboard
            </h2>
            <p className="mt-2 text-md text-gray-500">
              Sign in to access your dashboard
            </p>
          </motion.div>

          <div className="mt-8">
            <motion.div variants={itemVariants} id="otp-login-container">
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.div
                      key="email-input"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <label htmlFor="email" className="sr-only">Email address</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-md border-0 py-2.5 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                          placeholder="Enter your email"
                        />
                        {email && (
                            <button
                                type="button"
                                onClick={() => setEmail('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                aria-label="Clear email input"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-input"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <p className="text-sm text-gray-600 mb-2">
                        Enter the OTP sent to <strong>{email}</strong>
                      </p>
                       <div className="relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <KeyIcon className="h-5 w-5 text-gray-400" />
                         </div>
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          maxLength={6}
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6 [letter-spacing:8px] text-center font-extrabold"
                          placeholder="______"
                        />
                      </div>
                       <button type="button" onClick={() => setOtpSent(false)} className="text-sm text-brand-secondary hover:text-brand-dark mt-1">Use a different email</button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {(error || otpError) && (
                    <motion.div
                      className="rounded-md bg-red-50 p-3 mt-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-red-800 ml-2">{error || otpError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={isOtpLoading}
                    className="flex w-full justify-center items-center rounded-md bg-brand-primary px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isOtpLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{otpSent ? 'Verifying OTP...' : 'Sending OTP...'}</span>
                        </>
                    ) : (
                        otpSent ? 'Verify & Login' : 'Send OTP'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div variants={itemVariants} className="relative my-6" id="login-divider">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-100 px-2 text-gray-500 font-medium">OR</span>
                </div>
            </motion.div>

            <div className="flex justify-center items-center min-h-[50px]" id="google-login-button-container">
                {isGoogleLoading ? (
                     <Spinner />
                ) : (
                    <motion.div
                        ref={googleButtonContainerRef}
                        variants={itemVariants}
                    />
                )}
            </div>
             
             <footer className="text-center text-gray-500 text-xs mt-12">
                <p>&copy;{new Date().getFullYear()} Sales Dashboard. All rights reserved.</p>
            </footer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
