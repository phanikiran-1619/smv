import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Lock, Shield, Crown, User, KeyRound, Star } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { storeEncryptedUserData } from '../lib/encryption';
import axios from 'axios';

const LoginPage = () => {
  const { userType = 'parent' } = useParams(); // Default to 'parent' if userType is undefined
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null); // Ref for password input

  const loginTypes = {
    parent: {
      title: 'Parent Portal',
      icon: <Lock className="w-6 h-6" />,
      description: 'Access your children\'s bus tracking information',
      expectedRole: 'PARENT'
    },
    admin: {
      title: 'Transport Admin',
      icon: <Shield className="w-6 h-6" />,
      description: 'Manage school bus operations and routes',
      expectedRole: 'ADMIN'
    },
    superadmin: {
      title: 'Super Admin',
      icon: <Crown className="w-6 h-6" />,
      description: 'System-wide administration and control',
      expectedRole: 'SUPERADMIN'
    }
  };

  const currentLoginType = loginTypes[userType] || loginTypes.parent;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUsernameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      passwordRef.current.focus(); // Move focus to password field
    }
  };

  const storeUserData = (responseData, userType) => {
    // Store token with role-based naming
    const tokenKey = `${userType}token`;
    localStorage.setItem(tokenKey, responseData.token);
    
    // Store encrypted user data
    storeEncryptedUserData(userType, {
      id: responseData.id,
      username: responseData.username,
      roles: responseData.roles,
      twoFactorAuthentication: responseData.twoFactorAuthentication,
      entityObj: responseData.entityObj
    });
    
    // Store school ID if available
    if (responseData.entityObj && responseData.entityObj.schoolId) {
      localStorage.setItem(`${userType}SchoolId`, responseData.entityObj.schoolId);
    }
  };

  const validateUserRole = (userRoles, expectedRole) => {
    return userRoles.includes(expectedRole);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/signin`, {
        userName: formData.username,
        password: formData.password
      });

      const responseData = response.data;
      
      // Validate if user role matches the login type
      if (!validateUserRole(responseData.roles, currentLoginType.expectedRole)) {
        toast({
          title: "Access Denied",
          description: `User Not Found.`,
          variant: "destructive",
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage (encrypted)
      storeUserData(responseData, userType);

      // Check two-factor authentication
      if (responseData.twoFactorAuthentication) {
        // Navigate to OTP verification
        navigate('/otp-verification', { 
          state: { 
            userType, 
            username: responseData.username,
            userId: responseData.id,
            token: responseData.token
          } 
        });
      } else {
        // Navigate directly to dashboard
        const dashboardRoute = `/dashboard/${userType}`;
        navigate(dashboardRoute, { 
          state: { 
            userType, 
            username: responseData.username,
            userId: responseData.id,
            entityObj: responseData.entityObj
          } 
        });
      }

      toast({
        title: "Login Successful",
        description: `Welcome ${responseData.entityObj?.firstName || responseData.username}!`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = "Invalid username or password.";
        } else if (error.response.status === 403) {
          errorMessage = "Access denied. Please check your credentials.";
        } else if (error.response.status === 404) {
          errorMessage = "API endpoint not found. Please check the server configuration.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      }

      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (userType === 'superadmin') {
      navigate('/reset-password', { state: { userType } });
    } else {
      toast({
        title: "Password Reset Request",
        description: "Please consult to school admin for password reset",
        duration: 5000,
      });
    }
  };

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
                  School Portal
                </span>
              </h2>
              
              <p className="text-xl sm:text-2xl dark:text-gray-300 text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium pt-4">
                Safe, reliable, and intelligent school transportation management for the modern world.
              </p>
            </div>

            {/* Additional Attractive Text */}
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center space-x-3 dark:bg-gray-800/50 bg-sky-50/80 px-6 py-3 rounded-full border dark:border-gray-700 border-sky-200">
                <Star className="w-5 h-5 dark:text-yellow-400 text-sky-600 animate-pulse" />
                <span className="text-lg font-semibold dark:text-gray-200 text-gray-700">
                  Trusted Education Technology
                </span>
                <Star className="w-5 h-5 dark:text-yellow-400 text-sky-600 animate-pulse" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3 p-4 dark:bg-gray-800/30 bg-white/60 rounded-xl backdrop-blur-sm border dark:border-gray-700 border-sky-200">
                  <Shield className="w-8 h-8 dark:text-yellow-400 text-sky-600" />
                  <span className="text-sm font-bold dark:text-gray-200 text-gray-700">Enhanced Security</span>
                </div>
                <div className="flex items-center space-x-3 p-4 dark:bg-gray-800/30 bg-white/60 rounded-xl backdrop-blur-sm border dark:border-gray-700 border-sky-200">
                  <Lock className="w-8 h-8 dark:text-yellow-400 text-sky-600" />
                  <span className="text-sm font-bold dark:text-gray-200 text-gray-700">Protected Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Enhanced Login Form */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-md relative">
              {/* Background decoration */}
              <div className="absolute -inset-6 bg-gradient-to-r dark:from-yellow-400/10 dark:via-yellow-500/10 dark:to-yellow-600/10 from-sky-400/10 via-sky-500/10 to-sky-600/10 rounded-3xl blur-xl"></div>
              
              <Card className="relative dark:bg-gray-800/90 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border dark:border-gray-700/50 border-sky-200/50">
                <div className="p-8 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <div className="text-white">
                        {currentLoginType.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-600 to-sky-700 bg-clip-text text-transparent">
                      {currentLoginType.title}
                    </h3>
                    <p className="dark:text-gray-300 text-gray-600 text-sm font-medium">
                      {currentLoginType.description}
                    </p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Username Field */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="dark:text-gray-200 text-gray-700 text-sm font-semibold">
                        Username
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 dark:text-gray-400 text-gray-500" />
                        </div>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          placeholder="Enter your username"
                          value={formData.username}
                          onChange={handleInputChange}
                          onKeyDown={handleUsernameKeyDown}
                          className="pl-10 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 bg-sky-50/50 border-sky-200 text-gray-700 placeholder-gray-500 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20 focus:border-sky-500 focus:ring-sky-500/20 h-11 text-sm rounded-xl"
                        />
                      </div>
                    </div>
                    
                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="dark:text-gray-200 text-gray-700 text-sm font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyRound className="h-5 w-5 dark:text-gray-400 text-gray-500" />
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          ref={passwordRef}
                          className="pl-10 pr-10 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 bg-sky-50/50 border-sky-200 text-gray-700 placeholder-gray-500 dark:focus:border-yellow-400 dark:focus:ring-yellow-400/20 focus:border-sky-500 focus:ring-sky-500/20 h-11 text-sm rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center dark:text-gray-400 dark:hover:text-yellow-400 text-gray-500 hover:text-sky-600 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Forgot Password */}
                    <div className="text-right">
                      <button
                        type="button"
                        className="dark:text-yellow-400 dark:hover:text-yellow-500 text-sky-600 hover:text-sky-700 text-sm transition-colors duration-200 underline-offset-4 hover:underline font-medium"
                        onClick={handleForgotPassword}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    
                    {/* Login Button */}
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 h-12 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-base"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 dark:border-black border-white dark:border-t-transparent border-t-transparent rounded-full animate-spin"></div>
                          Logging in...
                        </div>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </form>
                  
                  {/* Bottom decoration */}
                  <div className="pt-4 border-t dark:border-gray-700 border-sky-200">
                    <div className="flex justify-center space-x-4 text-xs dark:text-gray-400 text-gray-500">
                      <span>Secure Access</span>
                      <span>•</span>
                      <span>Protected Data</span>
                      <span>•</span>
                      <span>24/7 Support</span>
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

export default LoginPage;