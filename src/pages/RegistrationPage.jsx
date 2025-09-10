import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { 
  FaUserGraduate, 
  FaSchool, 
  FaCarSide, 
  FaUserTie,
  FaUserShield,
  FaRoute,
  FaMapMarkerAlt,
  FaUsers
} from 'react-icons/fa';

const RegistrationPage = () => {
  const navigate = useNavigate();

  const registrationCategories = [
    {
      title: 'Student',
      icon: <FaUserGraduate className="w-12 h-12" />,
      color: 'from-blue-500 to-blue-600',
      path: '/registration/student'
    },
    {
      title: 'School',
      icon: <FaSchool className="w-12 h-12" />,
      color: 'from-green-500 to-green-600',
      path: '/registration/school'
    },
    {
      title: 'Driver',
      icon: <FaCarSide className="w-12 h-12" />,
      color: 'from-yellow-500 to-yellow-600',
      path: '/registration/driver'
    },
    {
      title: 'Attender',
      icon: <FaUserTie className="w-12 h-12" />,
      color: 'from-purple-500 to-purple-600',
      path: '/registration/attender'
    },
    {
      title: 'Admin',
      icon: <FaUserShield className="w-12 h-12" />,
      color: 'from-red-500 to-red-600',
      path: '/registration/admin'
    },
    {
      title: 'Route',
      icon: <FaRoute className="w-12 h-12" />,
      color: 'from-indigo-500 to-indigo-600',
      path: '/registration/route'
    },
    {
      title: 'Route Point',
      icon: <FaMapMarkerAlt className="w-12 h-12" />,
      color: 'from-pink-500 to-pink-600',
      path: '/registration/routepoint'
    },
    {
      title: 'Parent',
      icon: <FaUsers className="w-12 h-12" />,
      color: 'from-teal-500 to-teal-600',
      path: '/registration/parent'
    }
  ];

  const handleCategoryClick = (category) => {
    navigate(category.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Registration Forms</h1>
            <p className="text-gray-300">Select a category to register new users or entities</p>
          </div>

          {/* Registration Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {registrationCategories.map((category, index) => (
              <Card
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="bg-slate-700/40 border-slate-600 hover:border-slate-500 p-8 text-center transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:bg-slate-700/60"
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-600/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <div className={`text-white bg-gradient-to-br ${category.color} p-3 rounded-full`}>
                      {category.icon}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200">
                  {category.title}
                </h3>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
