import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { 
  List, UserCheck, RotateCcw, Upload, 
  Sparkles
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: 'Super Admin' };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const primaryActions = [
    {
      title: 'Swiped List',
      icon: <List className="w-8 h-8" />,
      path: '/swiped-list',
      description: 'View and analyze student swipe records',
      color: 'from-blue-500 to-blue-600',
      stats: 'View Records'
    },
    {
      title: 'Registration',
      icon: <UserCheck className="w-8 h-8" />,
      path: '/registration',
      description: 'Manage user registration and onboarding',
      color: 'from-green-500 to-green-600',
      stats: '8 Categories'
    },
    {
      title: 'Reset Password',
      icon: <RotateCcw className="w-8 h-8" />,
      path: '/admin-reset',
      description: 'Secure password management system',
      color: 'from-orange-500 to-orange-600',
      stats: 'Security First'
    },
    {
      title: 'Photo Upload',
      icon: <Upload className="w-8 h-8" />,
      path: '/photo-upload',
      description: 'Student media and document management',
      color: 'from-purple-500 to-purple-600',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400 text-lg">Loading Control Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mr-4 animate-pulse" />
                Control Hub
              </h1>
              <p className="text-gray-300 text-xl">Welcome back, <span className="text-yellow-400 font-semibold">{username}</span></p>
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
                  className="bg-slate-800/60 border-slate-700 hover:bg-slate-800/80 hover:border-slate-600 p-8 text-center transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden shadow-2xl hover:shadow-3xl"
                >
                  {/* Background Gradient Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="bg-slate-700/50 rounded-full px-4 py-2 text-sm text-yellow-400 font-medium">
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
  );
};

export default SuperAdminDashboard;