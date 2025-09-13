import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  
  const { userType, username } = location.state || {};

  useEffect(() => {
    // Redirect parent users who shouldn't be here
    if (userType === 'parent') {
      navigate('/dashboard/parent', { state: { userType, username } });
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [userType, navigate, username]);

  const handleOtpChange = (index, value) => {
    // Only allow digits and single character
    if (!/^\d*$/.test(value) || value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle paste
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real scenario, you would verify OTP with an API call
      // For now, we'll simulate successful OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored user data
      const storedUserData = localStorage.getItem(`${userType}UserData`);
      let userData = {};
      
      if (storedUserData) {
        userData = JSON.parse(storedUserData);
      }
      
      // Navigate to respective dashboard
      const dashboardRoute = `/dashboard/${userType}`;
      navigate(dashboardRoute, { 
        state: { 
          userType, 
          username: username || userData.username || 'User',
          userId: userData.id,
          entityObj: userData.entityObj
        } 
      });

      // Show success message
      alert('OTP verified successfully!');
      
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('OTP verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setTimeout(() => {
      alert('OTP resent to your registered device!');
      setIsResending(false);
    }, 1000);
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200">
      <Navbar showBackButton={true} />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Header */}
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="dark:text-white text-gray-800">SCHOOL</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-500 leading-tight">
                BUS MANAGEMENT
              </h2>
            </div>

            {/* Children Illustration */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="students.png"
                alt="Happy school children"
                className="max-w-full w-full sm:max-w-md lg:max-w-lg h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Side - OTP Verification */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <Card className="w-full max-w-md mx-auto dark:bg-slate-800/90 dark:border-slate-600 bg-white/90 border-gray-200 border-2 dark:border-yellow-500/30 border-blue-500/30 shadow-xl backdrop-blur-sm">
              <div className="p-8 space-y-5">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full dark:bg-yellow-500/20 dark:border-yellow-500/30 bg-blue-500/20 border-blue-500/30 border mb-2">
                    <Shield className="w-7 h-7 dark:text-yellow-400 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-yellow-400 text-blue-600">OTP Verification</h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    Enter the 6-digit verification code
                  </p>
                  {username && (
                    <p className="dark:text-yellow-400/80 text-blue-600/80 text-xs">
                      Verification for: {username}
                    </p>
                  )}
                </div>
                
                <div className="space-y-5">
                  {/* OTP Input Boxes */}
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`w-12 h-12 text-center text-lg font-bold dark:bg-slate-600/50 dark:border-slate-500/50 dark:text-white dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20 bg-gray-100 border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 ${
                          digit ? 'dark:border-yellow-400/50 dark:bg-slate-600/70 border-blue-400/50 bg-gray-200/70' : ''
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="flex justify-center">
                    <div className="flex gap-1">
                      {otp.map((digit, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            digit ? 'dark:bg-yellow-400 bg-blue-600' : 'dark:bg-slate-600 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Verify Button */}
                  <Button 
                    onClick={handleVerifyOTP}
                    disabled={isLoading || !isComplete}
                    className="w-full dark:bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 dark:border-black dark:border-t-transparent border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : isComplete ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Verify OTP
                      </div>
                    ) : (
                      'Enter Complete OTP'
                    )}
                  </Button>
                  
                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="dark:text-yellow-400 dark:hover:text-yellow-300 text-blue-600 hover:text-blue-500 text-sm transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        'Resend OTP'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OTPVerification;