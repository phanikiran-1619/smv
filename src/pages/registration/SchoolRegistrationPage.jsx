import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Building2, Save, RotateCcw, FileDown } from 'lucide-react';

const SchoolRegistrationPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };
  
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    establishedYear: '',
    type: 'PUBLIC',
    status: 'ACTIVE'
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
    
    if (!formData.id || !formData.name || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const url = mode === 'register' 
        ? `${API_BASE_URL}/school`
        : `${API_BASE_URL}/school/${formData.id}`;
      
      const method = mode === 'register' ? 'post' : 'put';
      
      await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(`School ${mode === 'register' ? 'registered' : 'updated'} successfully!`);
      
      if (mode === 'register') {
        handleReset();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || `Failed to ${mode} school`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      id: '',
      name: '',
      address: '',
      phone: '',
      email: '',
      principalName: '',
      establishedYear: '',
      type: 'PUBLIC',
      status: 'ACTIVE'
    });
    setError(null);
    setSuccess(null);
  };

  const downloadExcelTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const templateData = [
        {
          'School ID': 'SCH001',
          'School Name': 'Central High School',
          'Address': '123 Education Street, City, State 12345',
          'Phone': '+1234567890',
          'Email': 'info@centralhigh.edu',
          'Principal Name': 'Dr. John Smith',
          'Established Year': '1995',
          'Type': 'PUBLIC',
          'Status': 'ACTIVE'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "School Template");
      XLSX.writeFile(workbook, `school_registration_template.xlsx`);
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
              <Building2 className="w-10 h-10 mr-3" />
              School Registration
            </h1>
            <p className="text-gray-300">Register and manage school information</p>
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
                Register School
              </button>
              <button
                onClick={() => setMode('update')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  mode === 'update' 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Update School
              </button>
            </div>
          </div>

          <Card className="bg-slate-800/80 border-yellow-400 border-2 p-8 rounded-2xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    School ID <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    placeholder="Enter School ID"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    School Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter School Name"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">
                    Address <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter School Address"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter Phone Number"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter Email Address"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Principal Name</label>
                  <Input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => handleInputChange('principalName', e.target.value)}
                    placeholder="Enter Principal Name"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Established Year</label>
                  <Input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                    placeholder="Enter Established Year"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">School Type</label>
                  <Select onValueChange={(value) => handleInputChange('type', value)} value={formData.type}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select School Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="CHARTER">Charter</SelectItem>
                      <SelectItem value="MAGNET">Magnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Status</label>
                  <Select onValueChange={(value) => handleInputChange('status', value)} value={formData.status}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                      {mode === 'register' ? 'Register School' : 'Update School'}
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

export default SchoolRegistrationPage;