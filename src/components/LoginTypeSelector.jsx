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
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-yellow-500/30 shadow-xl backdrop-blur-sm">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-3">
            <div className="text-2xl">🚌</div>
          </div>
          <h3 className="text-2xl font-bold text-yellow-400">School Bus Management</h3>
          <p className="text-gray-300 text-sm">Select your login type to continue</p>
        </div>

        {/* Login Type Selection */}
        <div className="space-y-4">
          <Select value={selectedLoginType} onValueChange={setSelectedLoginType}>
            <SelectTrigger className="w-full bg-slate-600/50 border-slate-500/50 text-white hover:bg-slate-600/70 transition-all duration-200 h-12 text-base">
              <SelectValue placeholder="Select Login Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {loginOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value} 
                  className="text-white hover:bg-slate-600 focus:bg-slate-600 cursor-pointer py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-yellow-400">
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
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 h-12 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-base"
          >
            Get Started
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoginTypeSelector;