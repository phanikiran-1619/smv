import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const LogoutConfirmDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Prevent the browser's beforeunload warning
    window.removeEventListener('beforeunload', window.onbeforeunload);
    window.onbeforeunload = null;

    // Clear all localStorage data
    localStorage.clear();
    
    // Clear all sessionStorage data
    sessionStorage.clear();
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }
    
    // Clear any service worker registrations
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
    
    // Clear IndexedDB databases
    if ('indexedDB' in window) {
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }
    
    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Navigate to home page using react-router-dom
    navigate('/', { replace: true });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 dark:text-white text-gray-800 backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-yellow-400 text-blue-600">Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription className="dark:text-gray-300 text-gray-600">
            Are you sure you want to logout? This will clear all your data and redirect you to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 dark:border-slate-500 bg-gray-300 text-gray-700 hover:bg-gray-400 border-gray-400"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmDialog;