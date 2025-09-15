import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Lock, Shield, Crown, User, KeyRound } from 'lucide-react';
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
      title: 'Parent Login',
      icon: <Lock className="w-5 h-5" />,
      description: 'Access your children\'s bus tracking information',
      expectedRole: 'PARENT'
    },
    admin: {
      title: 'Transport Admin Login',
      icon: <Shield className="w-5 h-5" />,
      description: 'Manage school bus operations and routes',
      expectedRole: 'ADMIN'
    },
    superadmin: {
      title: 'Super Admin Login',
      icon: <Crown className="w-5 h-5" />,
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
          description: `Credentials are not for ${currentLoginType.title.toLowerCase()}. Please use the correct login type.`,
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
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200">
      <Navbar showBackButton={true} />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Header */}
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="dark:text-white text-gray-800">School</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold dark:text-yellow-500 text-blue-600 leading-tight">
             Transport Portal
              </h2>
            </div>

            {/* Children Illustration */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="/students.png"
                alt="Happy school children"
                className="max-w-full w-full sm:max-w-md lg:max-w-lg h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Side - Enhanced Login Form */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <Card className="w-full max-w-md mx-auto dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 border-2 dark:border-yellow-500/30 border-blue-500/30 shadow-xl backdrop-blur-sm">
              <div className="p-8 space-y-5">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full dark:bg-yellow-500/20 bg-blue-500/20 border dark:border-yellow-500/30 border-blue-500/30 mb-2">
                    <div className="dark:text-yellow-500 text-blue-600">
                      {currentLoginType.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold dark:text-yellow-500 text-blue-600">
                    {currentLoginType.title}
                  </h3>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">
                    {currentLoginType.description}
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="dark:text-white text-gray-700 text-sm font-medium">
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
                        className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 dark:focus:border-yellow-500 dark:focus:ring-yellow-500/20 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="dark:text-white text-gray-700 text-sm font-medium">
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
                        className="pl-10 pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 dark:focus:border-yellow-500 dark:focus:ring-yellow-500/20 focus:border-blue-500 focus:ring-blue-500/20 h-11 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center dark:text-gray-400 dark:hover:text-white text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
                      className="dark:text-yellow-500 dark:hover:text-yellow-600 text-blue-600 hover:text-blue-700 text-sm transition-colors duration-200 underline-offset-4 hover:underline"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  {/* Login Button */}
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
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
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;