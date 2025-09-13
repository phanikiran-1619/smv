import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Lock, Shield, Crown, User, KeyRound } from 'lucide-react';
import { toast } from '../hooks/use-toast';
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
    
    // Store user data
    // localStorage.setItem(`${userType}UserData`, JSON.stringify({
    //   id: responseData.id,
    //   username: responseData.username,
    //   roles: responseData.roles,
    //   entityObj: responseData.entityObj
    // }));
    
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

      // Store user data in localStorage
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <Navbar showBackButton={true} />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Header */}
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">School</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-500 leading-tight">
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
            <Card className="w-full max-w-md mx-auto bg-card border-2 border-yellow-500/30 shadow-xl backdrop-blur-sm">
              <div className="p-8 space-y-5">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-2">
                    <div className="text-yellow-500">
                      {currentLoginType.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-yellow-500">
                    {currentLoginType.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {currentLoginType.description}
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-foreground text-sm font-medium">
                      Username
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        onKeyDown={handleUsernameKeyDown}
                        className="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-yellow-500 focus:ring-yellow-500/20 h-11 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        ref={passwordRef}
                        className="pl-10 pr-10 bg-background border-border text-foreground placeholder-muted-foreground focus:border-yellow-500 focus:ring-yellow-500/20 h-11 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
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
                      className="text-yellow-500 hover:text-yellow-600 text-sm transition-colors duration-200 underline-offset-4 hover:underline"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  {/* Login Button */}
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 h-11 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
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