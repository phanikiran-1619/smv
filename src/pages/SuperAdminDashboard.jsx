import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LogoutConfirmDialog from '../components/LogoutConfirmDialog';
import { Card } from '../components/ui/card';
import { 
  BarChart3, UserPlus, KeyRound, Upload, 
  Sparkles
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: 'Super Admin' };
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // Handle browser back button navigation
  useEffect(() => {
    let isNavigatingAway = false;

    const handlePopState = (event) => {
      // Prevent the default back navigation
      event.preventDefault();
      
      // Show logout confirmation dialog
      setShowLogoutDialog(true);
      isNavigatingAway = true;
      
      // Push the current state back to prevent navigation until user confirms
      window.history.pushState(null, '', window.location.pathname);
    };

    const handleBeforeUnload = (event) => {
      // Show logout confirmation when trying to close browser/tab or navigate away
      if (!isNavigatingAway) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? You will be logged out.';
        return 'Are you sure you want to leave? You will be logged out.';
      }
    };

    // Add state to history to detect back button press
    window.history.pushState(null, '', window.location.pathname);
    
    // Listen for popstate event (back/forward button)
    window.addEventListener('popstate', handlePopState);
    
    // Listen for beforeunload event (closing browser/tab)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      isNavigatingAway = false;
    };
  }, []);

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
    // Stay on current page - push state back to prevent navigation
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    // Allow navigation by not preventing it - logout will be handled by LogoutConfirmDialog component
  };

  const primaryActions = [
    {
      title: 'Swiped List',
      icon: <BarChart3 className="w-8 h-8" />,
      path: '/swiped-list',
      description: 'View and analyze student swipe records',
      color: 'from-blue-500 to-blue-600',
      lightColor: 'from-blue-400 to-blue-500',
      stats: 'View Records'
    },
    {
      title: 'Registration',
      icon: <UserPlus className="w-8 h-8" />,
      path: '/registration',
      description: 'Manage user registration and onboarding',
      color: 'from-green-500 to-green-600',
      lightColor: 'from-green-400 to-green-500',
      stats: '8 Categories'
    },
    {
      title: 'Reset Password',
      icon: <KeyRound className="w-8 h-8" />,
      path: '/admin-reset',
      description: 'Secure password management system',
      color: 'from-orange-500 to-orange-600',
      lightColor: 'from-orange-400 to-orange-500',
      stats: 'Security First'
    },
    {
      title: 'Image Processing',
      icon: <Upload className="w-8 h-8" />,
      path: '/photo-upload',
      description: 'Student media and document management',
      color: 'from-purple-500 to-purple-600',
      lightColor: 'from-purple-400 to-purple-500',
      stats: 'Photo Upload'
    }
  ];

  const handleCardClick = (path, title) => {
    navigate(path, { 
      state: { 
        userType: 'superadmin',
        username,
        pageTitle: title
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 dark:border-yellow-400 border-blue-500 mx-auto mb-4"></div>
          <p className="dark:text-yellow-400 text-blue-600 text-lg">Loading Control Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
        <Navbar />
        
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
              <div className="text-center">
                <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:via-orange-500 dark:to-red-500 from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 dark:text-yellow-400 text-blue-600 mr-4 animate-pulse" />
                  Control Hub
                </h1>
                <p className="dark:text-gray-300 text-gray-600 text-xl">Welcome back, <span className="dark:text-yellow-400 text-blue-600 font-semibold">{username}</span></p>
              </div>
            </div>

            {/* Primary Actions Grid */}
            <div className="mb-8">
              <div className="text-center mb-8">
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {primaryActions.map((item, index) => (
                  <Card 
                    key={index}
                    onClick={() => handleCardClick(item.path, item.title)}
                    className="dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-800/80 dark:hover:border-slate-600 bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 p-8 text-center transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden shadow-2xl hover:shadow-3xl backdrop-blur-sm"
                  >
                    {/* Background Gradient Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br dark:${item.color} ${item.lightColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    <div className="relative">
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br dark:${item.color} ${item.lightColor} mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                        <div className="text-white">
                          {item.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-3 dark:group-hover:text-yellow-400 group-hover:text-blue-600 transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="dark:text-gray-400 text-gray-600 text-sm mb-4 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="dark:bg-slate-700/50 bg-gray-100/70 rounded-full px-4 py-2 text-sm dark:text-yellow-400 text-blue-600 font-medium">
                        {item.stats}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default SuperAdminDashboard;