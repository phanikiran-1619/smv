import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { MapPin, Save, RotateCcw, FileDown } from 'lucide-react';

const RoutePointRegistrationPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };
  
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    smRoutePointId: '',
    routePointName: '',
    title: '',
    latitude: '',
    longitude: '',
    seqOrder: 1,
    content: '',
    routeId: '',
    status: true,
    reserve: ''
  });

  const [routes, setRoutes] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("admintoken") || "YOUR_AUTH_TOKEN";
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const token = getAuthToken();
      const schoolId = localStorage.getItem("adminSchoolId");
      
      const response = await axios.get(`${API_BASE_URL}/route/school/${schoolId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setRoutes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
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
    
    if (!formData.smRoutePointId || !formData.routePointName || !formData.latitude || !formData.longitude) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const url = mode === 'register' 
        ? `${API_BASE_URL}/routepoint`
        : `${API_BASE_URL}/routepoint/${formData.smRoutePointId}`;
      
      const method = mode === 'register' ? 'post' : 'put';
      
      await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(`Route Point ${mode === 'register' ? 'registered' : 'updated'} successfully!`);
      
      if (mode === 'register') {
        handleReset();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || `Failed to ${mode} route point`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      smRoutePointId: '',
      routePointName: '',
      title: '',
      latitude: '',
      longitude: '',
      seqOrder: 1,
      content: '',
      routeId: '',
      status: true,
      reserve: ''
    });
    setError(null);
    setSuccess(null);
  };

  const downloadExcelTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const templateData = [
        {
          'SM Route Point ID': 'RP001',
          'Route Point Name': 'Main Street Stop',
          'Title': 'Main Street Bus Stop',
          'Latitude': '40.7128',
          'Longitude': '-74.0060',
          'Sequence Order': '1',
          'Content': 'Primary bus stop on Main Street',
          'Route ID': 'RT001',
          'Status': 'Active',
          'Reserve': ''
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Route Point Template");
      XLSX.writeFile(workbook, `routepoint_registration_template.xlsx`);
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
              <MapPin className="w-10 h-10 mr-3" />
              Route Point Registration
            </h1>
            <p className="text-gray-300">Register and manage route point information</p>
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
                Register Route Point
              </button>
              <button
                onClick={() => setMode('update')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  mode === 'update' 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Update Route Point
              </button>
            </div>
          </div>

          <Card className="bg-slate-800/80 border-yellow-400 border-2 p-8 rounded-2xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    SM Route Point ID <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.smRoutePointId}
                    onChange={(e) => handleInputChange('smRoutePointId', e.target.value)}
                    placeholder="Enter SM Route Point ID"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Route Point Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.routePointName}
                    onChange={(e) => handleInputChange('routePointName', e.target.value)}
                    placeholder="Enter Route Point Name"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Title</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter Title"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Latitude <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    placeholder="Enter Latitude (e.g., 40.7128)"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Longitude <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    placeholder="Enter Longitude (e.g., -74.0060)"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Sequence Order</label>
                  <Input
                    type="number"
                    value={formData.seqOrder}
                    onChange={(e) => handleInputChange('seqOrder', parseInt(e.target.value) || 1)}
                    placeholder="Enter Sequence Order"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Route</label>
                  <Select onValueChange={(value) => handleInputChange('routeId', value)} value={formData.routeId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id.toString()}>
                          {route.routeName} ({route.smRouteId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    placeholder="Enter Route Point Description"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Reserve</label>
                  <Input
                    type="text"
                    value={formData.reserve}
                    onChange={(e) => handleInputChange('reserve', e.target.value)}
                    placeholder="Enter Reserve Information"
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
                      {mode === 'register' ? 'Register Route Point' : 'Update Route Point'}
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

export default RoutePointRegistrationPage;