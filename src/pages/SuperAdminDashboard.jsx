import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: 'Super Admin' };

  const menuItems = [
    {
      title: 'Swiped List',
      description: 'View and analyze student swipe records',
      path: '/swiped-list',
      icon: '📊',
      buttonText: 'View Records'
    },
    {
      title: 'Registration',
      description: 'Manage user registration and onboarding',
      path: '/registration',
      icon: '👤',
      buttonText: '8 Categories'
    },
    {
      title: 'Reset Password',
      description: 'Secure password management system',
      path: '/admin-reset',
      icon: '🔄',
      buttonText: 'Security First'
    },
    {
      title: 'Photo Upload',
      description: 'Student media and document management',
      path: '/photo-upload',
      icon: '📤',
      buttonText: 'Photo Upload'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path, { 
      state: { 
        userType: 'superadmin',
        username 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-4">
              Control Hub
            </h1>
            <p className="text-muted-foreground text-xl">Welcome back, {username}</p>
          </div>

          {/* Dashboard Grid - 4 cards in 2x2 layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {menuItems.map((item, index) => (
              <Card 
                key={index} 
                className="bg-card border-border p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 group relative overflow-hidden"
                onClick={() => handleNavigation(item.path)}
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 text-center space-y-6">
                  {/* Icon */}
                  <div className="text-6xl mb-4">
                    {item.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-card-foreground group-hover:text-accent transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Button */}
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg"
                  >
                    {item.buttonText}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;