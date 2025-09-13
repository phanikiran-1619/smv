import React, { useState, useRef, useEffect } from 'react';
//import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Upload, X, ChevronDown, Search } from 'lucide-react';

const PhotoUploadPage = () => {
  // const location = useLocation();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    schoolId: '',
    studentId: '',
    routeId: '',
    devId: '',
    vehNum: '',
    detectType: '',
    reserve: '1',
    command: 'detect'
  });
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [successNotification, setSuccessNotification] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Data states
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  
  // Search states
  const [schoolSearch, setSchoolSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  
  // Dropdown states
  const [isSchoolOpen, setIsSchoolOpen] = useState(false);
  const [isStudentOpen, setIsStudentOpen] = useState(false);
  const [isRouteOpen, setIsRouteOpen] = useState(false);

  const maxFiles = 4;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      const token = localStorage.getItem('superadmintoken');
      if (!token) {
        setUploadMessage('Authentication token not found. Please log in again.');
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/school`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSchools(response.data);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setUploadMessage('Failed to load schools. Please try again.');
      }
    };

    fetchSchools();
  }, []);

  // Fetch routes when schoolId changes
  useEffect(() => {
    if (!formData.schoolId) {
      setRoutes([]);
      setFormData(prev => ({ ...prev, routeId: '', studentId: '' }));
      return;
    }

    const fetchRoutes = async () => {
      const token = localStorage.getItem('superadmintoken');
      if (!token) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/route/school/${encodeURIComponent(formData.schoolId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedRoutes = response.data.map(route => ({
          smRouteId: route.smRouteId,
          name: route.routeName,
        }));
        
        setRoutes(formattedRoutes);
      } catch (error) {
        console.error('Error fetching routes:', error);
        setUploadMessage('Failed to load routes. Please try again.');
      }
    };

    fetchRoutes();
  }, [formData.schoolId]);

  // Fetch students when routeId changes
  useEffect(() => {
    if (!formData.routeId) {
      setStudents([]);
      setFormData(prev => ({ ...prev, studentId: '' }));
      return;
    }

    const fetchStudents = async () => {
      const token = localStorage.getItem('superadmintoken');
      if (!token) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/student/route/smid/${encodeURIComponent(formData.routeId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setUploadMessage('Failed to load students. Please try again.');
      }
    };

    fetchStudents();
  }, [formData.routeId]);

  const validateFileType = (file) => {
    return allowedTypes.includes(file.type);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.schoolId.trim()) errors.schoolId = 'School is required';
    if (!formData.studentId.trim()) errors.studentId = 'Student is required';
    if (!formData.routeId.trim()) errors.routeId = 'Route is required';
    if (!formData.devId.trim()) errors.devId = 'Device ID is required';
    if (!/^[A-Za-z0-9-]+$/.test(formData.devId)) errors.devId = 'Device ID must be alphanumeric with hyphens only';
    if (!formData.vehNum.trim()) errors.vehNum = 'Vehicle Number is required';
    if (!/^[A-Za-z0-9]+$/.test(formData.vehNum)) errors.vehNum = 'Vehicle Number must be alphanumeric';
    if (!formData.detectType.trim()) errors.detectType = 'Detect Type is required';
    if (!/^[0-9]+$/.test(formData.detectType)) errors.detectType = 'Detect Type must be numeric';
    if (uploadedFiles.length === 0) errors.files = 'At least 1 image is required';
    if (uploadedFiles.length > maxFiles) errors.files = `Maximum ${maxFiles} images allowed`;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(validateFileType);
    
    if (validFiles.length + uploadedFiles.length > maxFiles) {
      setUploadMessage(`You can upload a maximum of ${maxFiles} images.`);
      return;
    }
    
    if (validFiles.length < files.length) {
      setUploadMessage('Some files were rejected. Only JPG and PNG files are allowed.');
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file)
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setFormErrors(prev => ({ ...prev, files: '' }));
    setUploadMessage('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem('superadmintoken');
    if (!token) {
      setUploadMessage('Authentication token not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();
    formDataToSend.append('schoolId', formData.schoolId);
    formDataToSend.append('studentId', formData.studentId);
    formDataToSend.append('routeId', formData.routeId);
    formDataToSend.append('command', formData.command);
    formDataToSend.append('devId', formData.devId);
    formDataToSend.append('vehNum', formData.vehNum);
    formDataToSend.append('detectType', formData.detectType);
    formDataToSend.append('reserve', formData.reserve);
    
    uploadedFiles.forEach(fileObj => {
      formDataToSend.append('file', fileObj.file);
    });

    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/images/upload`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setSuccessNotification(true);
      setTimeout(() => setSuccessNotification(false), 3000);
      
      // Reset form after successful upload
      setFormData({
        schoolId: '',
        studentId: '',
        routeId: '',
        devId: '',
        vehNum: '',
        detectType: '',
        reserve: '1',
        command: 'detect'
      });
      setUploadedFiles([]);
      setUploadProgress(0);
      setFormErrors({});
      
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response) {
        setUploadMessage(error.response.data?.message || 'Upload failed. Please try again.');
      } else if (error.request) {
        setUploadMessage('Network error. Please check your connection and try again.');
      } else {
        setUploadMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.id.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    school.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    student.smStudentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.lastName.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredRoutes = routes.filter(route =>
    route.smRouteId.toLowerCase().includes(routeSearch.toLowerCase()) ||
    route.name.toLowerCase().includes(routeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
      <Navbar showBackButton={true} />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 dark:border-yellow-400 border-blue-500"></div>
            </div>
            <p className="mt-6 dark:text-yellow-400 text-blue-600 text-xl font-semibold animate-pulse">
              Uploading... {uploadProgress}%
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg text-center animate-fade-in-out">
            Upload completed successfully!
          </div>
        </div>
      )}

      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold dark:text-yellow-400 text-blue-600 mb-2">Student Media Upload</h1>
            <p className="dark:text-gray-300 text-gray-600">Upload student photos and manage their information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Information Form */}
            <Card className="dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold dark:text-yellow-400 text-blue-600 mb-6">Student Information</h2>
              
              <div className="space-y-4">
                {/* School Dropdown */}
                <div>
                  <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">School</label>
                  <div className="relative">
                    <div
                      className={`w-full dark:bg-slate-700 dark:border-slate-600 bg-gray-100 border-gray-300 border ${formErrors.schoolId ? 'dark:border-red-500 border-red-500' : ''} rounded-lg px-4 py-3 dark:text-white text-gray-800 cursor-pointer focus:outline-none dark:focus:border-yellow-400 focus:border-blue-500 transition-colors ${isSchoolOpen ? 'rounded-b-none' : ''}`}
                      onClick={() => setIsSchoolOpen(!isSchoolOpen)}
                    >
                      {formData.schoolId ? schools.find(s => s.id === formData.schoolId)?.name || formData.schoolId : 'Select a School'}
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-5 h-5 pointer-events-none" />
                    </div>
                    
                    {isSchoolOpen && (
                      <div className="absolute z-10 w-full dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300 border rounded-b-lg shadow-lg mt-1">
                        <div className="p-2 dark:border-slate-600 border-gray-300 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-4 h-4" />
                            <input
                              type="text"
                              value={schoolSearch}
                              onChange={(e) => setSchoolSearch(e.target.value)}
                              placeholder="Search school..."
                              className="w-full dark:bg-slate-600 dark:text-white bg-gray-100 text-gray-800 px-8 py-2 rounded-md focus:outline-none focus:ring-2 dark:focus:ring-yellow-400 focus:ring-blue-500"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredSchools.map((school) => (
                            <div
                              key={school.id}
                              className="px-4 py-2 dark:text-white text-gray-800 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => {
                                handleInputChange('schoolId', school.id);
                                setIsSchoolOpen(false);
                                setSchoolSearch('');
                              }}
                            >
                              {school.id} - {school.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {formErrors.schoolId && <p className="text-red-400 text-sm mt-1">{formErrors.schoolId}</p>}
                  </div>
                </div>

                {/* Route Dropdown */}
                <div>
                  <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">Route</label>
                  <div className="relative">
                    <div
                      className={`w-full dark:bg-slate-700 dark:border-slate-600 bg-gray-100 border-gray-300 border ${formErrors.routeId ? 'dark:border-red-500 border-red-500' : ''} rounded-lg px-4 py-3 dark:text-white text-gray-800 cursor-pointer focus:outline-none dark:focus:border-yellow-400 focus:border-blue-500 transition-colors ${isRouteOpen ? 'rounded-b-none' : ''}`}
                      onClick={() => formData.schoolId && setIsRouteOpen(!isRouteOpen)}
                      style={{ opacity: formData.schoolId ? 1 : 0.6 }}
                    >
                      {formData.routeId ? routes.find(r => r.smRouteId === formData.routeId)?.name || formData.routeId : 'Select a Route'}
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-5 h-5 pointer-events-none" />
                    </div>
                    
                    {isRouteOpen && (
                      <div className="absolute z-10 w-full dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300 border rounded-b-lg shadow-lg mt-1">
                        <div className="p-2 dark:border-slate-600 border-gray-300 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-4 h-4" />
                            <input
                              type="text"
                              value={routeSearch}
                              onChange={(e) => setRouteSearch(e.target.value)}
                              placeholder="Search route..."
                              className="w-full dark:bg-slate-600 dark:text-white bg-gray-100 text-gray-800 px-8 py-2 rounded-md focus:outline-none focus:ring-2 dark:focus:ring-yellow-400 focus:ring-blue-500"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredRoutes.map((route) => (
                            <div
                              key={route.smRouteId}
                              className="px-4 py-2 dark:text-white text-gray-800 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => {
                                handleInputChange('routeId', route.smRouteId);
                                setIsRouteOpen(false);
                                setRouteSearch('');
                              }}
                            >
                              {route.smRouteId} - {route.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {formErrors.routeId && <p className="text-red-400 text-sm mt-1">{formErrors.routeId}</p>}
                  </div>
                </div>

                {/* Student Dropdown */}
                <div>
                  <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">Student</label>
                  <div className="relative">
                    <div
                      className={`w-full dark:bg-slate-700 dark:border-slate-600 bg-gray-100 border-gray-300 border ${formErrors.studentId ? 'dark:border-red-500 border-red-500' : ''} rounded-lg px-4 py-3 dark:text-white text-gray-800 cursor-pointer focus:outline-none dark:focus:border-yellow-400 focus:border-blue-500 transition-colors ${isStudentOpen ? 'rounded-b-none' : ''}`}
                      onClick={() => formData.routeId && setIsStudentOpen(!isStudentOpen)}
                      style={{ opacity: formData.routeId ? 1 : 0.6 }}
                    >
                      {formData.studentId ? students.find(s => s.smStudentId === formData.studentId)?.firstName + ' ' + 
                        (students.find(s => s.smStudentId === formData.studentId)?.lastName || '') || formData.studentId : 'Select a Student'}
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-5 h-5 pointer-events-none" />
                    </div>
                    
                    {isStudentOpen && (
                      <div className="absolute z-10 w-full dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300 border rounded-b-lg shadow-lg mt-1">
                        <div className="p-2 dark:border-slate-600 border-gray-300 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-4 h-4" />
                            <input
                              type="text"
                              value={studentSearch}
                              onChange={(e) => setStudentSearch(e.target.value)}
                              placeholder="Search student..."
                              className="w-full dark:bg-slate-600 dark:text-white bg-gray-100 text-gray-800 px-8 py-2 rounded-md focus:outline-none focus:ring-2 dark:focus:ring-yellow-400 focus:ring-blue-500"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredStudents.map((student) => (
                            <div
                              key={student.smStudentId}
                              className="px-4 py-2 dark:text-white text-gray-800 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => {
                                handleInputChange('studentId', student.smStudentId);
                                setIsStudentOpen(false);
                                setStudentSearch('');
                              }}
                            >
                              {student.smStudentId} - {student.firstName} {student.lastName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {formErrors.studentId && <p className="text-red-400 text-sm mt-1">{formErrors.studentId}</p>}
                  </div>
                </div>

                {/* Device ID */}
                <div>
                  <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">Device ID</label>
                  <input
                    type="text"
                    className={`w-full dark:bg-slate-700 dark:border-slate-600 bg-gray-100 border-gray-300 border ${formErrors.devId ? 'dark:border-red-500 border-red-500' : ''} rounded-lg px-4 py-3 dark:text-white dark:placeholder-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none dark:focus:border-yellow-400 focus:border-blue-500 transition-colors`}
                    value={formData.devId}
                    onChange={(e) => handleInputChange('devId', e.target.value)}
                    placeholder="Enter Device ID"
                  />
                  {formErrors.devId && <p className="text-red-400 text-sm mt-1">{formErrors.devId}</p>}
                </div>

                {/* Vehicle Number */}
                <div>
                  <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">Vehicle Number</label>
                  <input
                    type="text"
                    className={`w-full dark:bg-slate-700 dark:border-slate-600 bg-gray-100 border-gray-300 border ${formErrors.vehNum ? 'dark:border-red-500 border-red-500' : ''} rounded-lg px-4 py-3 dark:text-white dark:placeholder-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none dark:focus:border-yellow-400 focus:border-blue-500 transition-colors`}
                    value={formData.vehNum}
                    onChange={(e) => handleInputChange('vehNum', e.target.value)}
                    placeholder="Enter Vehicle Number"
                  />
                  {formErrors.vehNum && <p className="text-red-400 text-sm mt-1">{formErrors.vehNum}</p>}
                </div>

                {/* Detect Type */}
                <div>
                  <label className="block dark:text-white text-gray-700 text-sm font-medium mb-2">Detect Type</label>
                  <input
                    type="text"
                    className={`w-full dark:bg-slate-700 dark:border-slate-600 bg-gray-100 border-gray-300 border ${formErrors.detectType ? 'dark:border-red-500 border-red-500' : ''} rounded-lg px-4 py-3 dark:text-white dark:placeholder-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none dark:focus:border-yellow-400 focus:border-blue-500 transition-colors`}
                    value={formData.detectType}
                    onChange={(e) => handleInputChange('detectType', e.target.value)}
                    placeholder="Enter Detect Type"
                  />
                  {formErrors.detectType && <p className="text-red-400 text-sm mt-1">{formErrors.detectType}</p>}
                </div>
              </div>
            </Card>

            {/* Image Upload Section */}
            <Card className="dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold dark:text-yellow-400 text-blue-600 mb-6">Image Upload</h2>
              
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? 'dark:border-yellow-400 dark:bg-yellow-400/10 border-blue-500 bg-blue-500/10'
                    : 'dark:border-yellow-400/50 dark:hover:border-yellow-400 dark:hover:bg-yellow-400/5 border-blue-500/50 hover:border-blue-500 hover:bg-blue-500/5'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
              >
                <Upload className="w-16 h-16 dark:text-yellow-400 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold dark:text-white text-gray-800 mb-2">Drag & Drop or Click to Upload</h3>
                <p className="dark:text-yellow-400 text-blue-600 mb-2">
                  Up to {maxFiles} images ({uploadedFiles.length}/{maxFiles} selected)
                </p>
                <p className="dark:text-gray-400 text-gray-600 text-sm">JPG, PNG only</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {formErrors.files && <p className="text-red-400 text-sm mt-2">{formErrors.files}</p>}
              {uploadMessage && <p className="dark:text-yellow-400 text-blue-600 text-sm mt-2">{uploadMessage}</p>}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold dark:text-white text-gray-800 mb-4">Uploaded Images ({uploadedFiles.length})</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="relative dark:bg-slate-700/50 bg-gray-100/70 rounded-lg p-3 group">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={file.preview} 
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium dark:text-white text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs dark:text-gray-400 text-gray-600">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                            disabled={isLoading}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  {isLoading && (
                    <div className="mt-4">
                      <div className="w-full dark:bg-slate-700 bg-gray-200 rounded-full h-2">
                        <div
                          className="dark:bg-yellow-400 bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="dark:text-yellow-400 text-blue-600 text-sm mt-2 text-center">
                        Upload Progress: {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="w-full mt-6 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:disabled:bg-gray-600 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 dark:text-black dark:disabled:text-gray-400 text-white disabled:text-gray-600 font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    {isLoading ? 'Uploading...' : 'Upload Student Media'}
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PhotoUploadPage;