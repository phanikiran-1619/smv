import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Lock, Shield, Crown } from 'lucide-react';

const LoginTypeSelector = () => {
  const [selectedLoginType, setSelectedLoginType] = useState('');
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (selectedLoginType) {
      navigate(`/login/${selectedLoginType}`);
    }
  };

  const loginOptions = [
    {
      value: 'parent',
      label: 'Parent',
      icon: <Lock className="w-4 h-4" />
    },
    {
      value: 'admin',
      label: 'Transport Admin',
      icon: <Shield className="w-4 h-4" />
    },
    {
      value: 'superadmin',
      label: 'Super Admin',
      icon: <Crown className="w-4 h-4" />
    }
  ];

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-gray-800/80 dark:border-gray-700/50 bg-white/90 border-sky-200/50 border-2 shadow-2xl backdrop-blur-sm">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 shadow-lg mb-3">
            <div className="text-2xl">🚌</div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-600 to-sky-700 bg-clip-text text-transparent">
            School Bus Management
          </h3>
          <p className="dark:text-gray-300 text-gray-600 text-sm font-medium">Select your login type to continue</p>
        </div>

        {/* Login Type Selection */}
        <div className="space-y-4">
          <Select value={selectedLoginType} onValueChange={setSelectedLoginType}>
            <SelectTrigger className="w-full dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 bg-sky-50/50 border-sky-200 text-gray-700 hover:bg-sky-100/50 transition-all duration-200 h-12 text-base rounded-xl">
              <SelectValue placeholder="Select Login Type" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-700 dark:border-gray-600 bg-white border-sky-200 rounded-xl">
              {loginOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value} 
                  className="dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 text-gray-700 hover:bg-sky-50 focus:bg-sky-50 cursor-pointer py-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="dark:text-yellow-400 text-sky-600">
                      {option.icon}
                    </div>
                    <span className="text-base font-medium">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Get Started Button */}
          <Button 
            onClick={handleGetStarted}
            disabled={!selectedLoginType}
            className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 h-12 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-base"
          >
            Get Started
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoginTypeSelector;