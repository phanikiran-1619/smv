import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, LogOut, User, Building, Hash, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { getDecryptedUserData, getRoleDisplayName } from '../lib/encryption';

const ProfilePopup = ({ isOpen, onClose, userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const popupRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Get current user type from URL or location state
      const currentUserType = userType || location.pathname.split('/')[2] || 'parent';
      let decryptedData = getDecryptedUserData(currentUserType);
      
      setUserData(decryptedData);
      setLoading(false);
    }
  }, [isOpen, userType, location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Navigate to home
    window.location.href = '/';
  };

  if (!isOpen) return null;

  const getProfileInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const getGradientColors = (role) => {
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
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40" onClick={onClose} />
      
      {/* Popup Card */}
      <Card 
        ref={popupRef}
        className="relative w-80 dark:bg-slate-800/95 dark:border-slate-600 bg-white/95 border-gray-200 shadow-2xl backdrop-blur-md border-2 dark:border-yellow-500/30 border-blue-500/30 animate-in slide-in-from-top-2 duration-200"
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-600 border-gray-200">
          <h3 className="text-lg font-semibold dark:text-yellow-400 text-blue-600">Profile</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-700 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 dark:border-yellow-400 border-blue-500"></div>
            </div>
          ) : userData ? (
            <>
              {/* Profile Avatar and Name */}
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getGradientColors(userData.roles?.[0])} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                  {getProfileInitial(userData.username)}
                </div>
                <div>
                  <h4 className="text-xl font-bold dark:text-white text-gray-800">
                    {userData.entityObj?.firstName && userData.entityObj?.lastName 
                      ? `${userData.entityObj.firstName} ${userData.entityObj.lastName}`
                      : userData.username
                    }
                  </h4>
                  <p className="dark:text-gray-300 text-gray-600 text-sm">@{userData.username}</p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-3">
                {/* Role */}
                <div className="flex items-center space-x-3 p-3 rounded-lg dark:bg-slate-700/50 bg-gray-50">
                  <Shield className="w-5 h-5 dark:text-yellow-400 text-blue-600" />
                  <div>
                    <p className="text-sm dark:text-gray-400 text-gray-500">Role</p>
                    <p className="font-semibold dark:text-white text-gray-800">
                      {getRoleDisplayName(userData.roles?.[0])}
                    </p>
                  </div>
                </div>

                {/* School Information - Only show if available */}
                {userData.entityObj?.schoolName && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg dark:bg-slate-700/50 bg-gray-50">
                    <Building className="w-5 h-5 dark:text-yellow-400 text-blue-600" />
                    <div>
                      <p className="text-sm dark:text-gray-400 text-gray-500">School</p>
                      <p className="font-semibold dark:text-white text-gray-800">
                        {userData.entityObj.schoolName}
                      </p>
                    </div>
                  </div>
                )}

                {/* School ID - Only show if available */}
                {userData.entityObj?.schoolId && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg dark:bg-slate-700/50 bg-gray-50">
                    <Hash className="w-5 h-5 dark:text-yellow-400 text-blue-600" />
                    <div>
                      <p className="text-sm dark:text-gray-400 text-gray-500">School ID</p>
                      <p className="font-semibold dark:text-white text-gray-800">
                        {userData.entityObj.schoolId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-3 dark:text-gray-400 text-gray-500" />
              <p className="dark:text-gray-400 text-gray-500">No profile data available</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t dark:border-slate-600 border-gray-200">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePopup;