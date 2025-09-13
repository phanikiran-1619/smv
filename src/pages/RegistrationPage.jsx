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
      lightColor: 'from-blue-400 to-blue-500',
      path: '/registration/student'
    },
    {
      title: 'School',
      icon: <FaSchool className="w-12 h-12" />,
      color: 'from-green-500 to-green-600',
      lightColor: 'from-green-400 to-green-500',
      path: '/registration/school'
    },
    {
      title: 'Driver',
      icon: <FaCarSide className="w-12 h-12" />,
      color: 'from-yellow-500 to-yellow-600',
      lightColor: 'from-yellow-400 to-yellow-500',
      path: '/registration/driver'
    },
    {
      title: 'Attender',
      icon: <FaUserTie className="w-12 h-12" />,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'from-purple-400 to-purple-500',
      path: '/registration/attender'
    },
    {
      title: 'Admin',
      icon: <FaUserShield className="w-12 h-12" />,
      color: 'from-red-500 to-red-600',
      lightColor: 'from-red-400 to-red-500',
      path: '/registration/admin'
    },
    {
      title: 'Route',
      icon: <FaRoute className="w-12 h-12" />,
      color: 'from-indigo-500 to-indigo-600',
      lightColor: 'from-indigo-400 to-indigo-500',
      path: '/registration/route'
    },
    {
      title: 'Route Point',
      icon: <FaMapMarkerAlt className="w-12 h-12" />,
      color: 'from-pink-500 to-pink-600',
      lightColor: 'from-pink-400 to-pink-500',
      path: '/registration/routepoint'
    },
    {
      title: 'Parent',
      icon: <FaUsers className="w-12 h-12" />,
      color: 'from-teal-500 to-teal-600',
      lightColor: 'from-teal-400 to-teal-500',
      path: '/registration/parent'
    }
  ];

  const handleCategoryClick = (category) => {
    navigate(category.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:via-orange-500 dark:to-red-500 from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">Registration Forms</h1>
            <p className="dark:text-gray-300 text-gray-600">Select a category to register new users or entities</p>
          </div>

          {/* Registration Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {registrationCategories.map((category, index) => (
              <Card
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="dark:bg-slate-700/40 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-700/60 bg-white/80 border-gray-200 hover:border-gray-300 hover:bg-white p-8 text-center transition-all duration-300 cursor-pointer group transform hover:scale-105 backdrop-blur-sm shadow-lg"
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full dark:bg-slate-600/50 bg-gray-100/70 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <div className={`text-white bg-gradient-to-br dark:${category.color} ${category.lightColor} p-3 rounded-full shadow-lg`}>
                      {category.icon}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold dark:text-white dark:group-hover:text-yellow-400 text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
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