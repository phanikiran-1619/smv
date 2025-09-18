import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import SearchableSelect from "../../components/ui/SearchableSelect";
import SchoolSelect from "../../components/ui/SchoolSelect";
import SkeletonForm from "../../components/ui/SkeletonForm";
import { getToken } from "../../lib/token";
import { countryCodes, cityCodes } from "../../lib/countryCodes";
import Navbar from '../../components/Navbar';
import { MapPin, Save, RotateCcw, Upload, FileDown } from 'lucide-react';
import * as XLSX from "xlsx";

const RouteRegistrationPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };

  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [formData, setFormData] = useState({
    routeName: "",
    title: "",
    status: "true",
    reserve: 0,
    smRouteId: "", // Keep for internal use but won't be shown in registration form
    content: "",
    schoolId: "",
    cityCode: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [routes, setRoutes] = useState([]);
  const [selectedRouteForUpdate, setSelectedRouteForUpdate] = useState("");
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState(null);
  const [filteredCityCodes, setFilteredCityCodes] = useState(cityCodes);
  const [loadingStates, setLoadingStates] = useState({
    routes: false,
    routeDetails: false,
    schoolDetails: false,
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Listen for theme changes from navbar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Initial data loading
  useEffect(() => {
    const initializePage = async () => {
      const token = getToken();
      if (!token) {
        setAlertMessage("Please log in again.");
        return;
      }
      
      if (isUpdateMode) {
        await fetchRoutes();
      }
    };
    initializePage();
  }, [isUpdateMode]);

  // Fetch school details when school is selected to filter city codes
  useEffect(() => {
    const fetchSchoolDetails = async () => {
      if (!formData.schoolId) {
        setFilteredCityCodes(cityCodes);
        setSelectedSchoolDetails(null);
        setFormData(prev => ({ ...prev, cityCode: "" }));
        return;
      }

      try {
        setLoadingStates(prev => ({ ...prev, schoolDetails: true }));
        const token = getToken();
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/school/${formData.schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const schoolData = await response.json();
          setSelectedSchoolDetails(schoolData);
          
          // Filter city codes based on school's provId (like "KA" for Karnataka)
          if (schoolData.provId) {
            const filtered = cityCodes.filter(city => city.state === schoolData.provId);
            setFilteredCityCodes(filtered);
            
            // Reset city code if current selection is not in filtered list
            if (formData.cityCode && !filtered.some(city => city.id === formData.cityCode)) {
              setFormData(prev => ({ ...prev, cityCode: "" }));
            }
          } else {
            setFilteredCityCodes(cityCodes);
          }
        } else {
          // If school fetch fails, reset to all cities
          setFilteredCityCodes(cityCodes);
          setSelectedSchoolDetails(null);
        }
      } catch (error) {
        console.error('Error fetching school details:', error);
        setFilteredCityCodes(cityCodes);
        setSelectedSchoolDetails(null);
      } finally {
        setLoadingStates(prev => ({ ...prev, schoolDetails: false }));
      }
    };

    fetchSchoolDetails();
  }, [formData.schoolId]);

  // Fetch routes for update mode dropdown
  const fetchRoutes = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, routes: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/route`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, routes: false }));
    }
  };

  // Fetch individual route details for auto-fill
  const fetchRouteDetails = async (smRouteId) => {
    try {
      setLoadingStates(prev => ({ ...prev, routeDetails: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/route/by-routeId?smRouteId=${smRouteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          routeName: data.routeName || "",
          title: data.title || "",
          status: data.status !== null ? (data.status ? "true" : "false") : "true",
          reserve: data.reserve !== null ? data.reserve : 0,
          smRouteId: data.smRouteId || "",
          content: data.content || "",
          schoolId: data.schId || "",
          cityCode: data.cityCode || "",
        });
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
      setAlertMessage("Failed to fetch route details");
    } finally {
      setLoadingStates(prev => ({ ...prev, routeDetails: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Route Name: At least 2 characters, max 20 characters
    if (!isUpdateMode || formData.routeName) {
      if (!formData.routeName || formData.routeName.length < 2) {
        newErrors.routeName = "Route Name must be at least 2 characters long";
      } else if (formData.routeName.length > 20) {
        newErrors.routeName = "Route Name must be 20 characters or less";
      }
    }

    // Title: At least 2 characters, max 20 characters
    if (!isUpdateMode || formData.title) {
      if (!formData.title || formData.title.length < 2) {
        newErrors.title = "Title must be at least 2 characters long";
      } else if (formData.title.length > 20) {
        newErrors.title = "Title must be 20 characters or less";
      }
    }

    // School ID: Must be exactly 8 characters, alphanumeric
    if (!isUpdateMode || formData.schoolId) {
      if (!formData.schoolId) {
        newErrors.schoolId = "Please select a school";
      } else if (formData.schoolId.length !== 8) {
        newErrors.schoolId = "School ID must be exactly 8 characters";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.schoolId)) {
        newErrors.schoolId = "School ID must be alphanumeric";
      }
    }

    // City Code: Must be provided
    if (!isUpdateMode || formData.cityCode) {
      if (!formData.cityCode) {
        newErrors.cityCode = "Please select a city code";
      } else if (!filteredCityCodes.some((option) => option.id === formData.cityCode)) {
        newErrors.cityCode = "Invalid city code";
      }
    }

    // Update mode: smRouteId required for identification
    if (isUpdateMode) {
      if (!formData.smRouteId) {
        newErrors.smRouteId = "Please select a route to update";
      }
    }

    // Content: Optional, max 8 characters
    if (formData.content && formData.content.length > 8) {
      newErrors.content = "Content must be 8 characters or less";
    }

    // Reserve: Between 0 and 100
    if (formData.reserve < 0 || formData.reserve > 100) {
      newErrors.reserve = "Reserve must be a number between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value.trim(),
    });
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSelectChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    setErrors({ ...errors, [field]: undefined });
  };

  const resetForm = (newUpdateMode = false) => {
    setFormData({
      routeName: "",
      title: "",
      status: "true",
      reserve: 0,
      smRouteId: "", // Keep for internal use
      content: "",
      schoolId: "",
      cityCode: "",
    });
    setIsUpdateMode(newUpdateMode);
    setExcelError(null);
    setErrors({});
    setSelectedRouteForUpdate("");
    setSelectedSchoolDetails(null);
    setFilteredCityCodes(cityCodes);
  };

  const handleRouteSelection = async (smRouteId) => {
    setSelectedRouteForUpdate(smRouteId);
    if (smRouteId) {
      await fetchRouteDetails(smRouteId);
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateData = [
        {
          'Route Name': 'MG Road → Whitefield',
          'Title': 'Main Route',
          'School ID': 'SC1F0001',
          'City Code': 'BNG',
          'Content': 'Express',
          'Reserve': '5',
          'Status': 'Active',
          'Action': 'Register'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Route Template");
      XLSX.writeFile(workbook, `route_registration_template.xlsx`);
      
      setAlertMessage("Excel template downloaded successfully!");
    } catch (error) {
      console.error('Download failed:', error);
      setAlertMessage("Failed to download template");
    }
  };

  const SkeletonLoader = ({ height = "h-10" }) => (
    <div className={`${height} bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse`}></div>
  );

  const themeClasses = {
    background: theme === 'dark' 
      ? 'min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white'
      : 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900',
    card: theme === 'dark'
      ? 'bg-slate-800/80 border-yellow-400 border-2'
      : 'bg-white/80 border-blue-400 border-2',
    input: theme === 'dark'
      ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500'
      : 'bg-gray-50/50 border-gray-300 text-gray-900 placeholder:text-gray-400',
    label: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
    title: theme === 'dark' ? 'text-yellow-400' : 'text-blue-600',
    subtitle: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    alert: theme === 'dark' 
      ? 'bg-slate-800 border-slate-700' 
      : 'bg-white border-gray-300',
  };

  // Show loading skeleton while data is being fetched
  if (loadingStates.routeDetails) {
    return (
      <div className={themeClasses.background}>
        <Navbar showBackButton={true} />
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-bold ${themeClasses.title} mb-2 flex items-center justify-center`}>
                <MapPin className="w-10 h-10 mr-3" />
                Enhanced Route Registration
              </h1>
              <p className={themeClasses.subtitle}>Loading route data...</p>
            </div>
            <SkeletonForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={themeClasses.background}>
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${themeClasses.title} mb-2 flex items-center justify-center`}>
              <MapPin className="w-10 h-10 mr-3" />
              Enhanced Route Registration
            </h1>
            <p className={themeClasses.subtitle}>Advanced route registration with comprehensive validation and Excel support</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className={`${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'} rounded-xl p-1`}>
              <button
                onClick={() => resetForm(false)}
                className={`px-6 py-2 rounded-lg transition-all ${
                  !isUpdateMode 
                    ? `${theme === 'dark' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'} font-semibold` 
                    : `${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                Register Mode
              </button>
              <button
                onClick={() => resetForm(true)}
                className={`px-6 py-2 rounded-lg transition-all ${
                  isUpdateMode 
                    ? `${theme === 'dark' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'} font-semibold` 
                    : `${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                Update Mode
              </button>
            </div>
          </div>

          {/* Alert Modal */}
          {alertMessage && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className={`${themeClasses.alert} rounded-lg p-6 max-w-md w-full mx-4 shadow-lg transform transition-all duration-300 scale-100`}>
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>Notification</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 whitespace-pre-wrap break-words overflow-auto max-h-40`}>{alertMessage}</p>
                <button
                  onClick={() => setAlertMessage(null)}
                  className={`w-full ${theme === 'dark' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-blue-500 hover:bg-blue-600 text-white'} font-semibold py-2 rounded-lg transition duration-200`}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <Card className={`${themeClasses.card} p-8 rounded-2xl`}>
            {/* Route Selection Dropdown for Update Mode */}
            {isUpdateMode && (
              <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-300'} border rounded-xl`}>
                <Label className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 block`}>
                  Select Route to Update
                </Label>
                {loadingStates.routes ? (
                  <SkeletonLoader />
                ) : (
                  <SearchableSelect
                    options={routes.map(route => ({
                      value: route.smRouteId,
                      label: `${route.routeName} (${route.smRouteId})`
                    }))}
                    value={selectedRouteForUpdate}
                    onValueChange={handleRouteSelection}
                    placeholder="Search and select a route..."
                    searchPlaceholder="Type to search routes..."
                    className={themeClasses.input}
                  />
                )}
                <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} text-sm mt-2`}>
                  Select a route from the dropdown to auto-fill the form with current data
                </p>
              </div>
            )}

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (isSubmitting) return;

                if (!validateForm()) {
                  setAlertMessage("Please fix the form errors before submitting");
                  return;
                }

                setIsSubmitting(true);

                const token = getToken();
                if (!token) {
                  setAlertMessage("Please log in again.");
                  setIsSubmitting(false);
                  return;
                }

                try {
                  if (isUpdateMode) {
                    const updateBody = {};
                    if (formData.routeName) updateBody.routeName = formData.routeName;
                    if (formData.title) updateBody.title = formData.title;
                    if (formData.status !== undefined) updateBody.status = formData.status === "true" ? 1 : 0;
                    if (formData.reserve !== undefined) updateBody.reserve = formData.reserve;
                    if (formData.content) updateBody.content = formData.content;
                    if (formData.schoolId) updateBody.schoolId = formData.schoolId;
                    if (formData.cityCode) updateBody.cityCode = formData.cityCode;

                    const response = await fetch(
                      `${API_BASE_URL}/route/update/${formData.smRouteId}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(updateBody),
                      }
                    );

                    // Handle text response for update (not JSON)
                    const responseText = await response.text();
                    if (!response.ok) {
                      throw new Error(responseText || "Update failed");
                    }

                    setAlertMessage("Successfully updated");
                    resetForm();
                  } else {
                    // Remove smRouteId from registration request as it will be auto-generated
                    const registerBody = {
                      routeName: formData.routeName,
                      title: formData.title,
                      status: formData.status === "true" ? 1 : 0,
                      reserve: formData.reserve,
                      content: formData.content,
                      schoolId: formData.schoolId,
                      cityCode: formData.cityCode,
                    };

                    const response = await fetch(`${API_BASE_URL}/route/register`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                      },
                      body: JSON.stringify(registerBody),
                    });

                    const responseData = await response.json();
                    if (!response.ok) {
                      throw new Error(responseData.detail || responseData.message || "Registration failed");
                    }

                    setAlertMessage("Successfully registered");
                    resetForm();
                  }
                } catch (error) {
                  console.error("Error:", error);
                  setAlertMessage(error instanceof Error ? error.message : `${isUpdateMode ? "Update" : "Registration"} failed`);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-6"
            >
              <div className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                Route {isUpdateMode ? "Update" : "Registration"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="routeName" className={themeClasses.label}>
                    Route Name: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="routeName"
                    name="routeName"
                    placeholder="Enter Route Name"
                    value={formData.routeName}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.routeName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.routeName && <p className="text-red-500 text-sm">{errors.routeName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className={themeClasses.label}>
                    Title: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter Title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.title ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                <div className={`space-y-2 ${errors.schoolId ? "border border-red-500 rounded p-2" : ""}`}>
                  <Label className={themeClasses.label}>
                    School: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <div className={`${isUpdateMode ? "pointer-events-none opacity-50" : ""}`}>
                    <SchoolSelect
                      value={formData.schoolId}
                      onChange={(value) => handleSelectChange('schoolId', value)}
                      error={!!errors.schoolId}
                      disabled={isUpdateMode}
                    />
                  </div>
                  {errors.schoolId && <p className="text-red-500 text-sm">{errors.schoolId}</p>}
                  {isUpdateMode && formData.schoolId && (
                    <p className="text-xs text-gray-500">School cannot be changed in update mode</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cityCode" className={themeClasses.label}>
                    City Code: {!isUpdateMode && <span className="text-red-400">*</span>}
                    {selectedSchoolDetails?.provId && (
                      <span className="text-xs text-blue-500 ml-2">
                        (Filtered by {selectedSchoolDetails.provId})
                      </span>
                    )}
                  </Label>
                  {loadingStates.schoolDetails ? (
                    <SkeletonLoader />
                  ) : (
                    <SearchableSelect
                      options={filteredCityCodes.map(city => ({
                        value: city.id,
                        label: `${city.name} - ${city.id}`
                      }))}
                      value={formData.cityCode}
                      onValueChange={(value) => handleSelectChange('cityCode', value)}
                      placeholder="Select City Code"
                      searchPlaceholder="Search cities..."
                      error={!!errors.cityCode}
                      disabled={isSubmitting || !formData.schoolId}
                      className={themeClasses.input}
                    />
                  )}
                  {errors.cityCode && <p className="text-red-500 text-sm">{errors.cityCode}</p>}
                  {!formData.schoolId && (
                    <p className="text-xs text-gray-500">Please select a school first to filter city codes</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className={themeClasses.label}>
                    Content:
                  </Label>
                  <Input
                    id="content"
                    name="content"
                    placeholder="Enter Content"
                    value={formData.content}
                    onChange={handleChange}
                    maxLength={8}
                    className={`${themeClasses.input} ${errors.content ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserve" className={themeClasses.label}>
                    Reserve Info:
                  </Label>
                  <Input
                    id="reserve"
                    name="reserve"
                    type="number"
                    placeholder="Enter Reserve Info"
                    value={formData.reserve}
                    onChange={handleChange}
                    className={`${themeClasses.input} ${errors.reserve ? "border-red-500" : ""}`}
                    min={0}
                    max={100}
                    disabled={isSubmitting}
                  />
                  {errors.reserve && <p className="text-red-500 text-sm">{errors.reserve}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={themeClasses.label}>
                    Status:
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" }
                    ]}
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    placeholder="Select Status"
                    searchPlaceholder="Search status..."
                    disabled={isSubmitting}
                    className={themeClasses.input}
                  />
                </div>
              </div>

              {/* Excel Upload and Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <label className="flex-1 min-w-0">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;

                      setAlertMessage("Excel upload functionality will be implemented with backend integration.");
                    }}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <span className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg cursor-pointer transition-colors duration-200">
                    <Upload className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Processing..." : "Upload Excel"}
                  </span>
                </label>

                <Button
                  type="submit"
                  className={`flex-1 ${theme === 'dark' ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : 'bg-blue-500 hover:bg-blue-600 text-white'} font-semibold py-2.5`}
                  disabled={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting
                    ? isUpdateMode
                      ? "Updating..."
                      : "Registering..."
                    : isUpdateMode
                    ? "Update Route"
                    : "Register Route"}
                </Button>

                <Button
                  type="button"
                  onClick={() => resetForm(!isUpdateMode)}
                  className={`flex-1 ${theme === 'dark' ? 'bg-blue-400 hover:bg-blue-500' : 'bg-gray-400 hover:bg-gray-500'} text-white font-semibold py-2.5`}
                  disabled={isSubmitting}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isUpdateMode ? "Switch to Register" : "Switch to Update"}
                </Button>

                <Button
                  type="button"
                  onClick={downloadExcelTemplate}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5"
                  disabled={isSubmitting}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {excelError && (
                <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-red-500/10 border-red-500 text-red-300' : 'bg-red-50 border-red-300 text-red-700'} border rounded-xl whitespace-pre-wrap`}>
                  <p className="font-bold">Excel Processing Error:</p>
                  <p className="text-sm">{excelError}</p>
                  <button
                    onClick={() => setExcelError(null)}
                    className={`mt-2 text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'} underline`}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RouteRegistrationPage;