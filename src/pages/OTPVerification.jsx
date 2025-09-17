import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Shield, RefreshCw, CheckCircle2, Star } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-sky-50 via-white to-sky-100">
      <Navbar showBackButton={true} />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content Only */}
          <div className="space-y-8 order-2 lg:order-1">
            {/* Header */}
            <div className="text-center lg:text-left space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
                  Secure
                </span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r dark:from-gray-200 dark:via-gray-300 dark:to-gray-400 from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Verification
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl dark:text-gray-300 text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium pt-4">
                Two-factor authentication ensures maximum security for your school transportation data.
              </p>
            </div>

            {/* Additional Attractive Text */}
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center space-x-3 dark:bg-gray-800/50 bg-sky-50/80 px-6 py-3 rounded-full border dark:border-gray-700 border-sky-200">
                <Star className="w-5 h-5 dark:text-yellow-400 text-sky-600 animate-pulse" />
                <span className="text-lg font-semibold dark:text-gray-200 text-gray-700">
                  Advanced Security Protection
                </span>
                <Star className="w-5 h-5 dark:text-yellow-400 text-sky-600 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Side - OTP Verification */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-md relative">
              {/* Background decoration */}
              <div className="absolute -inset-6 bg-gradient-to-r dark:from-yellow-400/10 dark:via-yellow-500/10 dark:to-yellow-600/10 from-sky-400/10 via-sky-500/10 to-sky-600/10 rounded-3xl blur-xl"></div>
              
              <Card className="relative dark:bg-gray-800/90 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border dark:border-gray-700/50 border-sky-200/50">
                <div className="p-8 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-600 to-sky-700 bg-clip-text text-transparent">
                      OTP Verification
                    </h3>
                    <p className="dark:text-gray-300 text-gray-600 text-sm font-medium">
                      Enter the 6-digit verification code
                    </p>
                    {username && (
                      <p className="dark:text-yellow-400/80 text-sky-600/80 text-xs font-semibold">
                        Verification for: {username}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-6">
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
                          className={`w-12 h-12 text-center text-lg font-bold dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20 bg-sky-50/50 border-sky-200 text-gray-700 focus:border-sky-500 focus:ring-sky-500/20 transition-all duration-200 rounded-xl ${
                            digit ? 'dark:border-yellow-400/50 dark:bg-gray-700/70 border-sky-400/50 bg-sky-100/70' : ''
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
                              digit ? 'dark:bg-yellow-400 bg-sky-600' : 'dark:bg-gray-600 bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Verify Button */}
                    <Button 
                      onClick={handleVerifyOTP}
                      disabled={isLoading || !isComplete}
                      className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 h-12 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-base"
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
                        className="dark:text-yellow-400 dark:hover:text-yellow-500 text-sky-600 hover:text-sky-700 text-sm transition-colors duration-200 underline-offset-4 hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto font-medium"
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
                  
                  {/* Bottom decoration */}
                  <div className="pt-4 border-t dark:border-gray-700 border-sky-200">
                    <div className="flex justify-center space-x-4 text-xs dark:text-gray-400 text-gray-500">
                      <span>Secure Code</span>
                      <span>•</span>
                      <span>2FA Protection</span>
                      <span>•</span>
                      <span>Safe Access</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-yellow-400/5 bg-sky-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-gray-600/5 bg-sky-300/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 dark:bg-yellow-500/5 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default OTPVerification;