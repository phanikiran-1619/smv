import React from 'react';
import Navbar from '../components/Navbar';
import LoginTypeSelector from '../components/LoginTypeSelector';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content and Illustration */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-foreground">SCHOOL</span>
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-yellow-500 leading-tight">
                MANAGEMENT
              </h2>
            </div>

            {/* Children Illustration */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="/students.png"
                alt="Happy school children cartoon"
                className="max-w-full w-full sm:max-w-sm lg:max-w-md h-64 object-cover transform hover:scale-105 transition-transform duration-300 rounded-lg shadow-lg"
              />
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
    </div>
  );
};

export default HomePage;