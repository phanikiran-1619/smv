import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Route, Save, RotateCcw, FileDown } from 'lucide-react';

const RouteRegistrationPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };
  
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    smRouteId: '',
    routeName: '',
    title: '',
    cityCode: '',
    content: '',
    schoolId: localStorage.getItem("adminSchoolId") || '',
    status: true,
    reserve: 0
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("admintoken") || "YOUR_AUTH_TOKEN";
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.smRouteId || !formData.routeName || !formData.title) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const url = mode === 'register' 
        ? `${API_BASE_URL}/route`
        : `${API_BASE_URL}/route/${formData.smRouteId}`;
      
      const method = mode === 'register' ? 'post' : 'put';
      
      await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(`Route ${mode === 'register' ? 'registered' : 'updated'} successfully!`);
      
      if (mode === 'register') {
        handleReset();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || `Failed to ${mode} route`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      smRouteId: '',
      routeName: '',
      title: '',
      cityCode: '',
      content: '',
      schoolId: localStorage.getItem("adminSchoolId") || '',
      status: true,
      reserve: 0
    });
    setError(null);
    setSuccess(null);
  };

  const downloadExcelTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const templateData = [
        {
          'SM Route ID': 'RT001',
          'Route Name': 'Main Street Route',
          'Title': 'Main Street Bus Route',
          'City Code': 'NYC',
          'Content': 'Primary route through downtown area',
          'School ID': formData.schoolId,
          'Status': 'Active',
          'Reserve': '0'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Route Template");
      XLSX.writeFile(workbook, `route_registration_template.xlsx`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center justify-center">
              <Route className="w-10 h-10 mr-3" />
              Route Registration
            </h1>
            <p className="text-gray-300">Register and manage route information</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => setMode('register')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  mode === 'register' 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Register Route
              </button>
              <button
                onClick={() => setMode('update')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  mode === 'update' 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Update Route
              </button>
            </div>
          </div>

          <Card className="bg-slate-800/80 border-yellow-400 border-2 p-8 rounded-2xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    SM Route ID <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.smRouteId}
                    onChange={(e) => handleInputChange('smRouteId', e.target.value)}
                    placeholder="Enter SM Route ID"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Route Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.routeName}
                    onChange={(e) => handleInputChange('routeName', e.target.value)}
                    placeholder="Enter Route Name"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter Route Title"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">City Code</label>
                  <Input
                    type="text"
                    value={formData.cityCode}
                    onChange={(e) => handleInputChange('cityCode', e.target.value)}
                    placeholder="Enter City Code"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Reserve Number</label>
                  <Input
                    type="number"
                    value={formData.reserve}
                    onChange={(e) => handleInputChange('reserve', parseInt(e.target.value) || 0)}
                    placeholder="Enter Reserve Number"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Status</label>
                  <Select onValueChange={(value) => handleInputChange('status', value === 'true')} value={formData.status.toString()}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">Content/Description</label>
                  <Input
                    type="text"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Enter Route Description"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500 text-red-300 rounded-xl">
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500 text-green-300 rounded-xl">
                  <p className="font-bold">Success:</p>
                  <p>{success}</p>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-all"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {mode === 'register' ? 'Registering...' : 'Updating...'}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {mode === 'register' ? 'Register Route' : 'Update Route'}
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>

                <Button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RouteRegistrationPage;