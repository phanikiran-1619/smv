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
              
              <p className="text-xl sm:text-2xl dark:text-gray-300 text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Experience the future of school transportation with our cutting-edge tracking system. 
                Ensuring student safety, real-time monitoring, and seamless communication for modern education.
              </p>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                <div className="flex flex-col items-center space-y-3 p-6 dark:bg-gray-800/60 bg-white/90 rounded-2xl backdrop-blur-sm border dark:border-gray-700 border-sky-200 hover:scale-105 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl dark:bg-yellow-500/20 bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 dark:text-yellow-400 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-bold dark:text-gray-200 text-gray-700 group-hover:dark:text-yellow-400 group-hover:text-sky-600 transition-colors">Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center space-y-3 p-6 dark:bg-gray-800/60 bg-white/90 rounded-2xl backdrop-blur-sm border dark:border-gray-700 border-sky-200 hover:scale-105 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl dark:bg-yellow-500/20 bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 dark:text-yellow-400 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-bold dark:text-gray-200 text-gray-700 group-hover:dark:text-yellow-400 group-hover:text-sky-600 transition-colors">Live Tracking</span>
                </div>
                <div className="flex flex-col items-center space-y-3 p-6 dark:bg-gray-800/60 bg-white/90 rounded-2xl backdrop-blur-sm border dark:border-gray-700 border-sky-200 hover:scale-105 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl dark:bg-yellow-500/20 bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 dark:text-yellow-400 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6h1.5v-6zm0 8H11v1.5h1.5V15z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-bold dark:text-gray-200 text-gray-700 group-hover:dark:text-yellow-400 group-hover:text-sky-600 transition-colors">Real-time</span>
                </div>
                <div className="flex flex-col items-center space-y-3 p-6 dark:bg-gray-800/60 bg-white/90 rounded-2xl backdrop-blur-sm border dark:border-gray-700 border-sky-200 hover:scale-105 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl dark:bg-yellow-500/20 bg-sky-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 dark:text-yellow-400 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <span className="text-sm font-bold dark:text-gray-200 text-gray-700 group-hover:dark:text-yellow-400 group-hover:text-sky-600 transition-colors">Connect</span>
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