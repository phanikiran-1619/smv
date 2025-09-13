import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bus, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';
import LogoutConfirmDialog from './LogoutConfirmDialog';

const Navbar = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Define which pages should NOT show the logout button
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname.includes('/login');
  const isAuthPage = location.pathname.includes('/parent-login') || 
                     location.pathname.includes('/admin-login') || 
                     location.pathname.includes('/superadmin-login');
  
  // Show logout button on all pages except home, login, and auth pages
  const showLogoutButton = !isHomePage && !isLoginPage && !isAuthPage;

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  <span className="text-sm">Back</span>
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <Bus className="w-5 h-5 text-yellow-500" />
                </div>
                <h1 className="text-lg font-bold">
                  <span className="text-yellow-500">School Bus</span>
                  <span className="text-foreground ml-1">Tracker</span>
                </h1>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {showLogoutButton && (
                <Button
                  onClick={handleLogoutClick}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
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