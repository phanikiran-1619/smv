import React from 'react';
import Navbar from '../components/Navbar';
import LoginTypeSelector from '../components/LoginTypeSelector';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-sky-50 via-white to-sky-100">
      <Navbar />

      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between relative">
          
          {/* Left Side Image (Desktop and Tablet) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block lg:block xl:block">
            <img
              src="/assets/left.png"
              alt="Student waving"
              className="w-64 md:w-72 lg:w-80 xl:w-96 h-auto object-contain -translate-x-1/4 md:-translate-x-1/3 lg:-translate-x-1/3 xl:-translate-x-1/3 transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Center - Login Box */}
          <div className="z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            <LoginTypeSelector />
          </div>

          {/* Right Side Image (Desktop and Tablet) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block lg:block xl:block">
            <img
              src="/assets/right.png"
              alt="Bus illustration"
              className="w-64 md:w-72 lg:w-80 xl:w-96 h-auto object-contain translate-x-1/4 md:translate-x-1/3 lg:translate-x-1/3 xl:translate-x-1/3 transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Mobile Background Images - Subtle overlay */}
          <div className="block md:hidden absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute left-4 top-1/4 w-32 h-32">
              <img
                src="/assets/left.png"
                alt=""
                className="w-full h-full object-contain opacity-30"
              />
            </div>
            <div className="absolute right-4 bottom-1/4 w-32 h-32">
              <img
                src="/assets/right.png"
                alt=""
                className="w-full h-full object-contain opacity-30"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Background Elements - Responsive */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Large screen background elements */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 dark:bg-yellow-400/5 bg-sky-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 dark:bg-gray-600/5 bg-sky-300/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 dark:bg-yellow-500/5 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Mobile specific background elements */}
        <div className="block md:hidden absolute top-1/6 left-1/6 w-24 h-24 dark:bg-yellow-400/10 bg-sky-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="block md:hidden absolute bottom-1/6 right-1/6 w-32 h-32 dark:bg-gray-600/10 bg-sky-300/10 rounded-full blur-2xl animate-pulse delay-1200"></div>
      </div>

      {/* Mobile Background Gradient Overlay */}
      <div className="block md:hidden fixed inset-0 bg-gradient-to-br from-sky-50/90 via-white/80 to-sky-100/90 dark:from-gray-900/90 dark:via-gray-800/80 dark:to-gray-900/90 opacity-95 -z-5"></div>
    </div>
  );
};

export default HomePage;