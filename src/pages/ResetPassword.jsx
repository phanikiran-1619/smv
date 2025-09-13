import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, Eye, EyeOff, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: OTP, 2: New Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  
  const { userType } = location.state || {};

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      alert('Please enter complete OTP');
      return;
    }
    setStep(2);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      alert('Password reset successfully!');
      navigate('/login/superadmin');
      setIsLoading(false);
    }, 1000);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200">
      <Navbar showBackButton={true} />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="dark:text-white text-gray-800">SCHOOL</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-500 leading-tight">
                BUS MANAGEMENT
              </h2>
            </div>

            <div className="flex justify-center lg:justify-start">
              <img
                src="students.png"
                alt="Happy school children"
                className="max-w-full w-full sm:max-w-md lg:max-w-lg h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Side - Reset Password Form */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <Card className="w-full max-w-md mx-auto dark:bg-slate-800/90 dark:border-slate-600 bg-white/90 border-gray-200 border-2 dark:border-yellow-500/30 border-blue-500/30 shadow-xl backdrop-blur-sm">
              <div className="p-8 space-y-5">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full dark:bg-yellow-500/20 dark:border-yellow-500/30 bg-blue-500/20 border-blue-500/30 border mb-2">
                    <Shield className="w-7 h-7 dark:text-yellow-400 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-yellow-400 text-blue-600">
                    {step === 1 ? 'Verify Identity' : 'Set New Password'}
                  </h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    {step === 1 ? 'Enter OTP to verify your identity' : 'Create a new secure password'}
                  </p>
                </div>

                {step === 1 ? (
                  /* OTP Step */
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
                    
                    <Button 
                      onClick={handleVerifyOTP}
                      disabled={!isOtpComplete}
                      className="w-full dark:bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
                    >
                      Verify OTP
                    </Button>
                  </div>
                ) : (
                  /* New Password Step */
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="dark:text-gray-200 text-gray-700 text-sm font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 dark:text-gray-400 text-gray-500" />
                        </div>
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 pr-10 dark:bg-slate-600/50 dark:border-slate-500/50 dark:text-white dark:placeholder-gray-400 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20 bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center dark:text-gray-400 dark:hover:text-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="dark:text-gray-200 text-gray-700 text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 dark:text-gray-400 text-gray-500" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 dark:bg-slate-600/50 dark:border-slate-500/50 dark:text-white dark:placeholder-gray-400 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20 bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center dark:text-gray-400 dark:hover:text-gray-200 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isLoading || !newPassword || !confirmPassword}
                      className="w-full dark:bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 dark:border-black dark:border-t-transparent border-white border-t-transparent rounded-full animate-spin"></div>
                          Resetting...
                        </div>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;