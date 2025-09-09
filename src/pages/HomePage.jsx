import React from 'react';
import Navbar from '../components/Navbar';
import LoginTypeSelector from '../components/LoginTypeSelector';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-slate-700">SCHOOL</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-500 leading-tight">
                MANAGEMENT
              </h2>
              {/* <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                Safe, reliable, and efficient school bus tracking system for modern education
              </p> */}
            </div>

            {/* Children Illustration */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="https://web-resources.preview.emergentagent.com/children-cartoon.png"
                alt="Happy school children"
                className="max-w-full w-full sm:max-w-md lg:max-w-lg h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Side - Login Type Selector */}
          <div className="flex justify-center lg:justify-end">
            <LoginTypeSelector />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;