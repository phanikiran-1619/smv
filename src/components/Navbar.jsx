import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bus } from 'lucide-react';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';
import ProfilePopup from './ProfilePopup';
import { getDecryptedUserData } from '../lib/encryption';

const Navbar = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Define which pages should NOT show the profile button
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname.includes('/login');
  const isAuthPage = location.pathname.includes('/parent-login') || 
                     location.pathname.includes('/admin-login') || 
                     location.pathname.includes('/superadmin-login');
  
  // Show profile button on all pages except home, login, and auth pages
  const showProfileButton = !isHomePage && !isLoginPage && !isAuthPage;

  // Get current user type from path
  const getCurrentUserType = () => {
    const pathSegments = location.pathname.split('/');
    if (pathSegments[1] === 'dashboard') {
      return pathSegments[2]; // 'parent', 'admin', 'superadmin'
    }
    // For other authenticated pages, try to determine from localStorage tokens
    if (localStorage.getItem('parenttoken')) return 'parent';
    if (localStorage.getItem('admintoken')) return 'admin';
    if (localStorage.getItem('superadmintoken')) return 'superadmin';
    return 'parent'; // default
  };

  // Load user data for profile icon
  useEffect(() => {
    if (showProfileButton) {
      const currentUserType = getCurrentUserType();
      const decryptedData = getDecryptedUserData(currentUserType);
      setUserData(decryptedData);
    }
  }, [showProfileButton, location.pathname]);

  const handleProfileClick = () => {
    setShowProfilePopup(true);
  };

  const getProfileInitial = (userData) => {
    if (userData?.entityObj?.firstName) {
      return userData.entityObj.firstName.charAt(0).toUpperCase();
    }
    if (userData?.username) {
      return userData.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getProfileGradient = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'from-blue-500 to-blue-600';
      case 'SUPERADMIN':
        return 'from-purple-500 to-purple-600';
      case 'PARENT':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 dark:bg-slate-800/95 bg-white/95 backdrop-blur-sm border-b dark:border-slate-600 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-slate-700 text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  <span className="text-sm">Back</span>
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-1.5 dark:bg-yellow-500/20 bg-blue-500/20 rounded-lg border dark:border-yellow-500/30 border-blue-500/30">
                  <Bus className="w-5 h-5 dark:text-yellow-500 text-blue-600" />
                </div>
                <h1 className="text-lg font-bold">
                  <span className="dark:text-yellow-500 text-blue-600">School Bus</span>
                  <span className="dark:text-white text-gray-800 ml-1">Tracker</span>
                </h1>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {showProfileButton && (
                <button
                  onClick={handleProfileClick}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${userData ? getProfileGradient(userData.roles?.[0]) : 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-2 dark:border-slate-600 border-gray-300`}
                  title="Profile"
                >
                  {getProfileInitial(userData)}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Popup */}
      <ProfilePopup 
        isOpen={showProfilePopup} 
        onClose={() => setShowProfilePopup(false)}
        userType={getCurrentUserType()}
      />
    </>
  );
};

export default Navbar;