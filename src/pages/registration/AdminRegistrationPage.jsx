import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Shield, Save, RotateCcw, FileDown } from 'lucide-react';

const AdminRegistrationPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };
  
  const [mode, setMode] = useState('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    schoolId: localStorage.getItem("adminSchoolId") || '',
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
    
    if (!formData.username || !formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (mode === 'register' && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const url = mode === 'register' 
        ? `${API_BASE_URL}/admin`
        : `${API_BASE_URL}/admin/${formData.username}`;
      
      const method = mode === 'register' ? 'post' : 'put';
      
      // Remove confirmPassword from form data
      const { confirmPassword, ...submitData } = formData;
      
      await axios[method](url, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(`Admin ${mode === 'register' ? 'registered' : 'updated'} successfully!`);
      
      if (mode === 'register') {
        handleReset();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || `Failed to ${mode} admin`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'ADMIN',
      schoolId: localStorage.getItem("adminSchoolId") || '',
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
          'Username': 'admin123',
          'Password': 'password123',
          'First Name': 'John',
          'Last Name': 'Admin',
          'Email': 'admin@school.edu',
          'Phone': '+1234567890',
          'Role': 'ADMIN',
          'School ID': formData.schoolId,
          'Status': 'ACTIVE'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Template");
      XLSX.writeFile(workbook, `admin_registration_template.xlsx`);
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
              <Shield className="w-10 h-10 mr-3" />
              Admin Registration
            </h1>
            <p className="text-gray-300">Register and manage admin information</p>
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
                Register Admin
              </button>
              <button
                onClick={() => setMode('update')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  mode === 'update' 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Update Admin
              </button>
            </div>
          </div>

          <Card className="bg-slate-800/80 border-yellow-400 border-2 p-8 rounded-2xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter Username"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter Password"
                        className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm Password"
                        className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                        required
                        minLength={6}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter First Name"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter Last Name"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter Email Address"
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
                  <label className="block text-white text-sm font-medium mb-2">Role</label>
                  <Select onValueChange={(value) => handleInputChange('role', value)} value={formData.role}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
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
                      {mode === 'register' ? 'Register Admin' : 'Update Admin'}
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

export default AdminRegistrationPage;