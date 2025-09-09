import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Construction, ArrowLeft } from 'lucide-react';

const DummyPage = () => {
  const location = useLocation();
  const { pageTitle, userType, username } = location.state || { 
    pageTitle: 'Page', 
    userType: 'user', 
    username: 'User' 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2">{pageTitle}</h1>
            <p className="text-gray-300">Welcome, {username}</p>
          </div>

          {/* Main Content */}
          <Card className="bg-slate-700/50 border-slate-600 p-12 text-center">
            <div className="mb-6">
              <Construction className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Page Under Development</h2>
              <p className="text-gray-300 mb-6">
                This {pageTitle.toLowerCase()} functionality is currently being developed and will be available soon.
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div className="bg-slate-600/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Coming Soon Features:</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Real-time data management</li>
                  <li>• Advanced filtering and search</li>
                  <li>• Export and reporting tools</li>
                  <li>• Interactive dashboard widgets</li>
                  <li>• Mobile responsive interface</li>
                </ul>
              </div>

              <div className="text-xs text-gray-400">
                Page Type: {userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DummyPage;