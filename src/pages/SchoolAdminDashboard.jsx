import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { 
  MapPin, Users, Eye, Bell, ChevronRight
} from 'lucide-react';

const SchoolAdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: 'School Admin' };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const adminItems = [
    {
      title: 'By Route',
      icon: <MapPin className="w-12 h-12" />,
      path: '/by-route',
      description: 'Manage routes and schedules'
    },
    {
      title: 'All Users Data',
      icon: <Users className="w-12 h-12" />,
      path: '/all-users',
      description: 'View all user information'
    },
    {
      title: 'Driver Tracker',
      icon: <Eye className="w-12 h-12" />,
      path: '/driver-tracker',
      description: 'Track driver locations'
    },
    {
      title: 'End to End Swipe',
      icon: <Bell className="w-12 h-12" />,
      path: '/end-to-end-swipe',
      description: 'Complete journey tracking'
    }
  ];

  const handleCardClick = (path, title) => {
    navigate(path, { 
      state: { 
        userType: 'admin',
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
            <h1 className="text-4xl sm:text-5xl font-bold text-yellow-400 mb-4">Admin Control Panel</h1>
            <p className="text-gray-300">Welcome, {username}</p>
          </div>

          {/* Admin Control Grid */}
          {isLoading ? (
            <div className="flex justify-center">
              <div className="text-yellow-400">Loading admin panel...</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {adminItems.map((item, index) => (
                <Card 
                  key={index}
                  onClick={() => handleCardClick(item.path, item.title)}
                  className="bg-slate-700/30 border-slate-600 p-8 text-center hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group transform hover:scale-105"
                >
                  <div className="mb-6">
                    <div className="text-yellow-400 mx-auto group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <div className="mt-4">
                    <ChevronRight className="w-6 h-6 mx-auto text-gray-400 group-hover:text-white transition-colors duration-200" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;