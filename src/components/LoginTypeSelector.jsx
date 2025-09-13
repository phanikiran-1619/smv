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
    <Card className="w-full max-w-md mx-auto dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 border-2 dark:border-yellow-500/30 border-blue-500/30 shadow-xl backdrop-blur-sm">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full dark:bg-yellow-500/20 bg-blue-500/20 border dark:border-yellow-500/30 border-blue-500/30 mb-3">
            <div className="text-2xl">🚌</div>
          </div>
          <h3 className="text-2xl font-bold dark:text-yellow-500 text-blue-600">School Bus Management</h3>
          <p className="dark:text-gray-300 text-gray-600 text-sm">Select your login type to continue</p>
        </div>

        {/* Login Type Selection */}
        <div className="space-y-4">
          <Select value={selectedLoginType} onValueChange={setSelectedLoginType}>
            <SelectTrigger className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200 transition-all duration-200 h-12 text-base">
              <SelectValue placeholder="Select Login Type" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300">
              {loginOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value} 
                  className="dark:text-white dark:hover:bg-slate-600 dark:focus:bg-slate-600 text-gray-800 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="dark:text-yellow-500 text-blue-600">
                      {option.icon}
                    </div>
                    <span className="text-base">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Get Started Button */}
          <Button 
            onClick={handleGetStarted}
            disabled={!selectedLoginType}
            className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 dark:hover:from-yellow-600 dark:hover:to-yellow-700 dark:text-black from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 h-12 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-base"
          >
            Get Started
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoginTypeSelector;