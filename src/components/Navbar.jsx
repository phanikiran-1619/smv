import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bus, LogOut, Bell } from 'lucide-react';
import { Button } from './ui/button';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const Navbar = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  const isDashboard = location.pathname.includes('/dashboard');

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {showBackButton && !isDashboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-gray-300 hover:text-white hover:bg-slate-700 transition-colors duration-200"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  <span className="text-sm">Back</span>
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <Bus className="w-5 h-5 text-yellow-400" />
                </div>
                <h1 className="text-lg font-bold">
                  <span className="text-yellow-400">School Bus</span>
                  <span className="text-white ml-1">Tracker</span>
                </h1>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="flex items-center gap-3">
              {isDashboard && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white p-2"
                  >
                    <Bell size={18} />
                  </Button>
                  <Button
                    onClick={handleLogoutClick}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LogoutConfirmDialog 
        isOpen={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
    </>
  );
};

export default Navbar;