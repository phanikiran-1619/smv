import React from 'react';
import Navbar from '../components/Navbar';
import LoginTypeSelector from '../components/LoginTypeSelector';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-sky-50 via-white to-sky-100">
      <Navbar />
      
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Content Only */}
          <div className="space-y-8">
            {/* Hero Text */}
            <div className="text-center lg:text-left space-y-6">
              <div className="space-y-4">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight">
                  <span className="bg-gradient-to-r dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
                    Smart
                  </span>
                </h1>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r dark:from-gray-200 dark:via-gray-300 dark:to-gray-400 from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    School Bus
                  </span>
                </h2>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-300 from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent">
                    Management
                  </span>
                </h3>
              </div>
              
              {/* Students Image Section */}
              <div className="flex justify-center lg:justify-start pt-8">
                <div className="relative group">
                  <div className="absolute inset-0 dark:bg-yellow-400/8 bg-sky-400/8 rounded-3xl blur-md group-hover:blur-lg transition-all duration-500"></div>
                  <div className="relative overflow-hidden rounded-3xl shadow-xl dark:shadow-yellow-500/5 shadow-sky-500/10 border-2 dark:border-yellow-400/20 border-sky-400/20 group-hover:scale-102 transition-all duration-500">
                    <img 
                      src="/students.png" 
                      alt="Students enjoying safe school transportation" 
                      className="w-full max-w-md h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <p className="text-sm font-bold dark:text-yellow-400 text-black drop-shadow-2xl dark:bg-black/40 bg-white/80 px-4 py-3 rounded-xl backdrop-blur-md border dark:border-yellow-400/30 border-gray-300/50">
                        Experience the future of school transportation with cutting-edge safety and real-time tracking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Type Selector */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm lg:max-w-md">
              <LoginTypeSelector />
            </div>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-yellow-400/5 bg-sky-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-gray-600/5 bg-sky-300/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 dark:bg-yellow-500/5 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default HomePage;