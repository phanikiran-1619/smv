import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { 
  Users, Upload, List, RotateCcw, UserCheck
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: 'Super Admin' };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const controlItems = [
    {
      title: 'Swiped List',
      icon: <List className="w-12 h-12" />,
      path: '/swiped-list',
      description: 'View all swipe records'
    },
    {
      title: 'Registration',
      icon: <UserCheck className="w-12 h-12" />,
      path: '/registration',
      description: 'User registration management'
    },
    {
      title: 'Reset Password',
      icon: <RotateCcw className="w-12 h-12" />,
      path: '/admin-reset',
      description: 'Reset user passwords'
    },
    {
      title: 'Photo Upload',
      icon: <Upload className="w-12 h-12" />,
      path: '/photo-upload',
      description: 'Upload student photos',
      highlighted: true
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-4">Control Hub</h1>
            <p className="text-gray-300">Welcome, {username}</p>
          </div>

          {/* Control Grid */}
          {isLoading ? (
            <div className="flex justify-center">
              <div className="text-yellow-400">Loading control panel...</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {controlItems.map((item, index) => (
                <Card 
                  key={index}
                  onClick={() => handleCardClick(item.path, item.title)}
                  className={`p-8 text-center transition-all duration-200 cursor-pointer group transform hover:scale-105 ${
                    item.highlighted 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 hover:from-yellow-500/30 hover:to-orange-500/30' 
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="mb-6">
                    <div className="text-yellow-400 mx-auto group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  {item.highlighted && (
                    <p className="text-yellow-400 text-sm">{item.description}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;