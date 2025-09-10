import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { GraduationCap, Save, RotateCcw, Upload, FileDown } from 'lucide-react';

const StudentRegistrationPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };
  
  const [mode, setMode] = useState('register'); // 'register' or 'update'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    smStudentId: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    parentId: '',
    routeId: '',
    schoolId: localStorage.getItem("adminSchoolId") || '',
    status: 'ACTIVE'
  });

  // Dropdown data
  const [parents, setParents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [schools, setSchools] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getAuthToken = () => {
    return localStorage.getItem("admintoken") || "YOUR_AUTH_TOKEN";
  };

  // Fetch dropdown data
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const token = getAuthToken();
      const schoolId = localStorage.getItem("adminSchoolId");
      
      // Fetch parents, routes, and schools
      const [parentsRes, routesRes, schoolsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/parent/school/${schoolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/route/school/${schoolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/school`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setParents(Array.isArray(parentsRes.data) ? parentsRes.data : []);
      setRoutes(Array.isArray(routesRes.data) ? routesRes.data : []);
      setSchools(Array.isArray(schoolsRes.data) ? schoolsRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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
    
    // Validation
    if (!formData.smStudentId || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getAuthToken();
      const url = mode === 'register' 
        ? `${API_BASE_URL}/student`
        : `${API_BASE_URL}/student/${formData.smStudentId}`;
      
      const method = mode === 'register' ? 'post' : 'put';
      
      await axios[method](url, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess(`Student ${mode === 'register' ? 'registered' : 'updated'} successfully!`);
      
      if (mode === 'register') {
        handleReset();
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || `Failed to ${mode} student`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      smStudentId: '',
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      parentId: '',
      routeId: '',
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
          'SM Student ID': 'STU001',
          'First Name': 'John',
          'Last Name': 'Doe',
          'Age': '12',
          'Gender': 'Male',
          'Parent ID': 'PAR001',
          'Route ID': 'RT001',
          'School ID': formData.schoolId,
          'Status': 'ACTIVE'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Template");
      XLSX.writeFile(workbook, `student_registration_template.xlsx`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 mr-3" />
              Student Registration
            </h1>
            <p className="text-gray-300">Register and manage student information</p>
          </div>

          {/* Mode Toggle */}
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
                Register Student
              </button>
              <button
                onClick={() => setMode('update')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  mode === 'update' 
                    ? 'bg-yellow-500 text-black font-semibold' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Update Student
              </button>
            </div>
          </div>

          {/* Form */}
          <Card className="bg-slate-800/80 border-yellow-400 border-2 p-8 rounded-2xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SM Student ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    SM Student ID <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.smStudentId}
                    onChange={(e) => handleInputChange('smStudentId', e.target.value)}
                    placeholder="Enter SM Student ID"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                    required
                  />
                </div>

                {/* First Name */}
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

                {/* Last Name */}
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

                {/* Age */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter Age"
                    className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Gender</label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)} value={formData.gender}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Parent */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Parent</label>
                  <Select onValueChange={(value) => handleInputChange('parentId', value)} value={formData.parentId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {parents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id.toString()}>
                          {parent.firstName} {parent.lastName} ({parent.smParentId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Route */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Route ID</label>
                  <Select onValueChange={(value) => handleInputChange('routeId', value)} value={formData.routeId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 rounded-lg text-white focus:border-yellow-400">
                      <SelectValue placeholder="Select Route ID" />
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

                {/* Status */}
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

              {/* Error/Success Messages */}
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

              {/* Action Buttons */}
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
                      {mode === 'register' ? 'Register Student' : 'Update Student'}
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

export default StudentRegistrationPage;