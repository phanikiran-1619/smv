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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Navbar showBackButton={true} />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-slate-700">SCHOOL</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-500 leading-tight">
                BUS MANAGEMENT
              </h2>
            </div>

            <div className="flex justify-center lg:justify-start">
              <img
                src="https://customer-assets.emergentagent.com/job_d7f673d1-d3ab-4760-991c-4cd04006d342/artifacts/o7lxx1rl_image.png"
                alt="Happy school children"
                className="max-w-full w-full sm:max-w-md lg:max-w-lg h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Side - Reset Password Form */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-yellow-500/30 shadow-xl backdrop-blur-sm">
              <div className="p-8 space-y-5">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-2">
                    <Shield className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400">
                    {step === 1 ? 'Verify Identity' : 'Set New Password'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {step === 1 ? 'Enter OTP to verify your identity' : 'Create a new secure password'}
                  </p>
                </div>

                {step === 1 ? (
                  /* OTP Step */
                  <div className="space-y-5">
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
                          className={`w-12 h-12 text-center text-lg font-bold bg-slate-600/50 border-slate-500/50 text-white focus:border-yellow-400 focus:ring-yellow-400/20 transition-all duration-200 ${
                            digit ? 'border-yellow-400/50 bg-slate-600/70' : ''
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button 
                      onClick={handleVerifyOTP}
                      disabled={!isOtpComplete}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
                    >
                      Verify OTP
                    </Button>
                  </div>
                ) : (
                  /* New Password Step */
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-300 text-sm font-medium">
                        New Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 pr-10 bg-slate-600/50 border-slate-500/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 h-11 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 bg-slate-600/50 border-slate-500/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 h-11 text-sm"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading || !newPassword || !confirmPassword}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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