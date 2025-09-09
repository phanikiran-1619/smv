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
    <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-2 border-yellow-500/30 shadow-xl backdrop-blur-sm">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-2">
            <div className="text-lg">🚌</div>
          </div>
          <h3 className="text-xl font-bold text-yellow-400">School Bus Management</h3>
          <p className="text-gray-300 text-xs">Select your login type to continue</p>
        </div>

        {/* Login Type Selection */}
        <div className="space-y-3">
          <Select value={selectedLoginType} onValueChange={setSelectedLoginType}>
            <SelectTrigger className="w-full bg-slate-600/50 border-slate-500/50 text-white hover:bg-slate-600/70 transition-all duration-200 h-10">
              <SelectValue placeholder="Select Login Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {loginOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value} 
                  className="text-white hover:bg-slate-600 focus:bg-slate-600 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">
                      {option.icon}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Get Started Button */}
          <Button 
            onClick={handleGetStarted}
            disabled={!selectedLoginType}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-2 h-10 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg text-sm"
          >
            Get Started
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LoginTypeSelector;