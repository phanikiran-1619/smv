import React from 'react';
import Navbar from '../components/Navbar';
import LoginTypeSelector from '../components/LoginTypeSelector';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-sky-50 via-white to-sky-100">
      <Navbar />

      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8 relative">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between relative">
          
          {/* Left Side Image (peeking from edge) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 lg:block hidden">
            <img
              src="/assets/left.png"
              alt="Student waving"
              className="w-80 lg:w-96 h-auto object-contain -translate-x-1/4 lg:-translate-x-1/3 transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Center - Login Box */}
          <div className="z-10 w-full max-w-sm lg:max-w-md mx-auto">
            <LoginTypeSelector />
          </div>

          {/* Right Side Image (peeking from edge) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 lg:block hidden">
            <img
              src="/assets/right.png"
              alt="Bus illustration"
              className="w-80 lg:w-96 h-auto object-contain translate-x-1/4 lg:translate-x-1/3 transition-all duration-300 hover:scale-105"
            />
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-yellow-400/5 bg-sky-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-gray-600/5 bg-sky-300/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 dark:bg-yellow-500/5 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Mobile Background Adjustment */}
      <div className="block lg:hidden fixed inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-90"></div>
    </div>
  );
};

export default HomePage;