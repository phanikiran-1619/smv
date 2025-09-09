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
    navigate('/', { replace: true });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-800 border-slate-600 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-yellow-400">Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Are you sure you want to logout? You will be redirected to the login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-gray-600 text-white hover:bg-gray-700 border-gray-500"
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