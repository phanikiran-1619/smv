import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { getToken } from "../../lib/token";
import { 
  countryCodes, 
  cityCodes, 
  indianStates, 
  allIndianCities,
  getCitiesByState 
} from "../../lib/countryCodes";
import Navbar from '../../components/Navbar';
import { Building2, Save, RotateCcw, Upload, FileDown } from 'lucide-react';
import * as XLSX from "xlsx";

export function SchoolRegistrationFormPage() {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };

  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [formData, setFormData] = useState({
    schoolId: "",
    name: "",
    countryId: "IN",
    provId: "",
    areaId: "",
    entityId: "",
    contactName: "",
    contactNum: "",
    status: true,
  });

  // Available options based on selections
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [schools, setSchools] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [selectedSchoolForUpdate, setSelectedSchoolForUpdate] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    schools: false,
    routes: false,
    routePoints: false,
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
      
      // Initialize provinces for default India selection
      setAvailableProvinces(indianStates);
      
      await Promise.all([
        fetchSchools(),
        fetchRoutes(),
        fetchRoutePoints()
      ]);
    };
    initializePage();
  }, []);

  // Fetch schools for update mode dropdown
  const fetchSchools = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, schools: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/school`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSchools(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, schools: false }));
    }
  };

  // Fetch routes for dropdown
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

  // Fetch route points for dropdown
  const fetchRoutePoints = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, routePoints: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/routepoint`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutePoints(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching route points:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, routePoints: false }));
    }
  };

  // Fetch individual school details for auto-fill
  const fetchSchoolDetails = async (schoolId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/school/${schoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const school = data[0];
          setFormData({
            schoolId: school.id || "",
            name: school.name || "",
            countryId: school.countryId || "IN",
            provId: school.provId || "",
            areaId: school.areaId || "",
            entityId: school.entityId || "",
            contactName: school.contactName || "",
            contactNum: school.contactNum || "",
            status: school.status !== undefined ? school.status : true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
      setAlertMessage("Failed to fetch school details");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // School ID: Alphanumeric, exactly 8 characters, ALWAYS REQUIRED
    if (!formData.schoolId) {
      newErrors.schoolId = "School ID is required";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.schoolId)) {
      newErrors.schoolId = "School ID must be alphanumeric";
    } else if (formData.schoolId.length !== 8) {
      newErrors.schoolId = "School ID must be exactly 8 characters";
    }

    // In registration mode, all fields are required. In update mode, only School ID is required.
    if (!isUpdateMode) {
      // Name: Letters only, minimum 2 characters, max 20 characters, REQUIRED in registration
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = "School name is required and must be at least 2 characters long";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
        newErrors.name = "School name must contain letters only (spaces allowed)";
      } else if (formData.name.length > 20) {
        newErrors.name = "School name must be 20 characters or less";
      }

      // Country ID: REQUIRED in registration
      if (!formData.countryId) {
        newErrors.countryId = "Country Code is required";
      }

      // Province ID: REQUIRED in registration
      if (!formData.provId) {
        newErrors.provId = "Province ID is required";
      }

      // Area ID: REQUIRED in registration
      if (!formData.areaId) {
        newErrors.areaId = "Area ID is required";
      }

      // Entity ID: Alphanumeric, 3-10 characters, REQUIRED in registration
      if (!formData.entityId) {
        newErrors.entityId = "Entity ID is required";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.entityId)) {
        newErrors.entityId = "Entity ID must be alphanumeric";
      } else if (formData.entityId.length < 3 || formData.entityId.length > 10) {
        newErrors.entityId = "Entity ID must be between 3 and 10 characters";
      }

      // Contact Name: Letters only, max 20 characters, REQUIRED in registration
      if (!formData.contactName) {
        newErrors.contactName = "Contact name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(formData.contactName)) {
        newErrors.contactName = "Contact name must contain letters only (spaces allowed)";
      } else if (formData.contactName.length > 20) {
        newErrors.contactName = "Contact name must be 20 characters or less";
      }

      // Contact Number: exactly 10 digits, REQUIRED in registration
      if (!formData.contactNum) {
        newErrors.contactNum = "Contact number is required";
      } else if (!/^\d{10}$/.test(formData.contactNum)) {
        newErrors.contactNum = "Contact number must be exactly 10 digits";
      }
    } else {
      // In update mode, validate only if fields are provided
      if (formData.name && formData.name.length > 0) {
        if (formData.name.length < 2) {
          newErrors.name = "School name must be at least 2 characters long";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
          newErrors.name = "School name must contain letters only (spaces allowed)";
        } else if (formData.name.length > 20) {
          newErrors.name = "School name must be 20 characters or less";
        }
      }

      if (formData.entityId && formData.entityId.length > 0) {
        if (!/^[a-zA-Z0-9]+$/.test(formData.entityId)) {
          newErrors.entityId = "Entity ID must be alphanumeric";
        } else if (formData.entityId.length < 3 || formData.entityId.length > 10) {
          newErrors.entityId = "Entity ID must be between 3 and 10 characters";
        }
      }

      if (formData.contactName && formData.contactName.length > 0) {
        if (!/^[a-zA-Z\s]+$/.test(formData.contactName)) {
          newErrors.contactName = "Contact name must contain letters only (spaces allowed)";
        } else if (formData.contactName.length > 20) {
          newErrors.contactName = "Contact name must be 20 characters or less";
        }
      }

      if (formData.contactNum && formData.contactNum.length > 0) {
        if (!/^\d{10}$/.test(formData.contactNum)) {
          newErrors.contactNum = "Contact number must be exactly 10 digits";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    // For contactNum, only allow digits
    if (name === "contactNum") {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value.trim(),
      });
    }
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSelectChange = (field, value) => {
    let newFormData = { ...formData, [field]: value };
    
    // Reset dependent fields when parent changes
    if (field === 'countryId') {
      newFormData.provId = '';
      newFormData.areaId = '';
    } else if (field === 'provId') {
      newFormData.areaId = '';
    }
    
    setFormData(newFormData);
    setErrors({ ...errors, [field]: undefined });
  };

  // Update available provinces when country changes
  useEffect(() => {
    if (formData.countryId === 'IN') {
      setAvailableProvinces(indianStates);
    } else {
      setAvailableProvinces([]);
    }
  }, [formData.countryId]);

  // Update available cities when province changes
  useEffect(() => {
    if (formData.countryId === 'IN' && formData.provId) {
      const citiesForState = getCitiesByState(formData.provId);
      setAvailableCities(citiesForState);
    } else if (formData.countryId !== 'IN') {
      // For international countries, show international cities for that country
      const internationalCities = cityCodes.filter(city => city.country === formData.countryId);
      setAvailableCities(internationalCities);
    } else {
      setAvailableCities([]);
    }
  }, [formData.provId, formData.countryId]);

  const resetForm = (newUpdateMode = false) => {
    setFormData({
      schoolId: "",
      name: "",
      countryId: "IN",
      provId: "",
      areaId: "",
      entityId: "",
      contactName: "",
      contactNum: "",
      status: true,
    });
    setIsUpdateMode(newUpdateMode);
    setExcelError(null);
    setErrors({});
    setSelectedSchoolForUpdate("");
    setAvailableProvinces(indianStates);
    setAvailableCities([]);
  };

  const handleSchoolSelection = async (schoolId) => {
    setSelectedSchoolForUpdate(schoolId);
    if (schoolId) {
      await fetchSchoolDetails(schoolId);
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateData = [
        {
          'School ID': 'SC001234',
          'School Name': 'Sample School',
          'Country Code': 'IN',
          'Province ID': 'KA',
          'Area ID': 'BLR',
          'Entity ID': 'EDU1234567',
          'Contact Name': 'John Smith',
          'Contact Number': '9876543210',
          'Status': 'Active',
          'Action': 'Register'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "School Template");
      XLSX.writeFile(workbook, `school_registration_template.xlsx`);
      
      setAlertMessage("Excel template downloaded successfully! Note: All fields marked with * are mandatory.");
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

  return (
    <div className={themeClasses.background}>
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${themeClasses.title} mb-2 flex items-center justify-center`}>
              <Building2 className="w-10 h-10 mr-3" />
              Enhanced School Registration
            </h1>
            <p className={themeClasses.subtitle}>Advanced school registration with comprehensive validation and Excel support</p>
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
            {/* School Selection Dropdown for Update Mode */}
            {isUpdateMode && (
              <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-300'} border rounded-xl`}>
                <Label className={`${theme === 'dark' ? 'text-blue-900' : 'text-blue-700'} font-medium mb-2 block`}>
                  Select School to Update
                </Label>
                {loadingStates.schools ? (
                  <SkeletonLoader />
                ) : (
                  <SearchableSelect
                    options={schools.map(school => ({
                      value: school.id,
                      label: `${school.name} (${school.id})`
                    }))}
                    value={selectedSchoolForUpdate}
                    onValueChange={handleSchoolSelection}
                    placeholder="Search and select a school..."
                    searchPlaceholder="Type to search schools..."
                    className={themeClasses.input}
                  />
                )}
                <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} text-sm mt-2`}>
                  Select a school from the dropdown to auto-fill the form with its current data
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
                  const response = await fetch(
                    isUpdateMode
                      ? `${API_BASE_URL}/school/update?id=${formData.schoolId}`
                      : `${API_BASE_URL}/school/register`,
                    {
                      method: isUpdateMode ? "PUT" : "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        schoolId: formData.schoolId,
                        name: formData.name,
                        countryId: formData.countryId,
                        provId: formData.provId,
                        areaId: formData.areaId,
                        entityId: formData.entityId,
                        contactName: formData.contactName,
                        contactNum: formData.contactNum,
                        status: formData.status ? 1 : 0,
                      }),
                    }
                  );

                  const responseText = await response.text();

                  if (!response.ok) {
                    let responseData;
                    try {
                      responseData = JSON.parse(responseText);
                    } catch {
                      responseData = { message: responseText };
                    }
                    throw new Error(responseData.message || `${isUpdateMode ? "Update" : "Registration"} failed with status ${response.status}`);
                  }

                  setAlertMessage(`School ${isUpdateMode ? "updated" : "registered"} successfully`);
                  resetForm(false);
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : `${isUpdateMode ? "Update" : "Registration"} failed`;
                  setAlertMessage(errorMessage);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-6"
            >
              <div className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                School {isUpdateMode ? "Update" : "Registration"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolId" className={themeClasses.label}>
                    School ID: <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="schoolId"
                    name="schoolId"
                    placeholder="Enter School ID (8 characters)"
                    value={formData.schoolId}
                    onChange={handleChange}
                    maxLength={8}
                    required
                    disabled={isUpdateMode && formData.schoolId}
                    className={`${themeClasses.input} ${errors.schoolId ? "border-red-500" : ""} ${isUpdateMode && formData.schoolId ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {errors.schoolId && <p className="text-red-500 text-sm">{errors.schoolId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className={themeClasses.label}>
                    School Name: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter School Name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    disabled={isUpdateMode && formData.name}
                    className={`${themeClasses.input} ${errors.name ? "border-red-500" : ""} ${isUpdateMode && formData.name ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryId" className={themeClasses.label}>
                    Country Code: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <SearchableSelect
                    options={countryCodes.map(code => ({
                      value: code.id,
                      label: `${code.country} - ${code.id}`
                    }))}
                    value={formData.countryId}
                    onValueChange={(value) => handleSelectChange('countryId', value)}
                    placeholder="Select Country Code"
                    searchPlaceholder="Search countries..."
                    error={!!errors.countryId}
                    disabled={isSubmitting}
                    className={themeClasses.input}
                  />
                  {errors.countryId && <p className="text-red-500 text-sm">{errors.countryId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provId" className={themeClasses.label}>
                    Province ID: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <SearchableSelect
                    options={availableProvinces.map(province => ({
                      value: province.id,
                      label: `${province.name} - ${province.id}`
                    }))}
                    value={formData.provId}
                    onValueChange={(value) => handleSelectChange('provId', value)}
                    placeholder="Select Province/State"
                    searchPlaceholder="Search provinces/states..."
                    error={!!errors.provId}
                    disabled={isSubmitting || !formData.countryId || (formData.countryId !== 'IN')}
                    className={themeClasses.input}
                  />
                  {errors.provId && <p className="text-red-500 text-sm">{errors.provId}</p>}
                  {!formData.countryId && (
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">Please select a country first</p>
                  )}
                  {formData.countryId && formData.countryId !== 'IN' && (
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">Province selection not available for international countries</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaId" className={themeClasses.label}>
                    Area ID: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <SearchableSelect
                    options={availableCities.map(city => ({
                      value: city.id,
                      label: `${city.name} - ${city.id}`
                    }))}
                    value={formData.areaId}
                    onValueChange={(value) => handleSelectChange('areaId', value)}
                    placeholder="Select Area/City"
                    searchPlaceholder="Search cities..."
                    error={!!errors.areaId}
                    disabled={isSubmitting || (!formData.provId && formData.countryId === 'IN') || (!formData.countryId)}
                    className={themeClasses.input}
                  />
                  {errors.areaId && <p className="text-red-500 text-sm">{errors.areaId}</p>}
                  {formData.countryId === 'IN' && !formData.provId && (
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">Please select a province first</p>
                  )}
                  {!formData.countryId && (
                    <p className="text-yellow-600 dark:text-yellow-400 text-sm">Please select a country first</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entityId" className={themeClasses.label}>
                    Entity ID: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="entityId"
                    name="entityId"
                    placeholder="Enter Entity ID (3-10 characters)"
                    value={formData.entityId}
                    onChange={handleChange}
                    maxLength={10}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.entityId ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.entityId && <p className="text-red-500 text-sm">{errors.entityId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName" className={themeClasses.label}>
                    Contact Name: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="Enter Contact Name"
                    value={formData.contactName}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.contactName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.contactName && <p className="text-red-500 text-sm">{errors.contactName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNum" className={themeClasses.label}>
                    Contact Number: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="contactNum"
                    name="contactNum"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter Contact Number (10 digits)"
                    value={formData.contactNum}
                    onChange={handleChange}
                    maxLength={10}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.contactNum ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.contactNum && <p className="text-red-500 text-sm">{errors.contactNum}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={themeClasses.label}>
                    Status: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" }
                    ]}
                    value={formData.status.toString()}
                    onValueChange={(value) => setFormData({ ...formData, status: value === "true" })}
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
                    ? "Update School"
                    : "Register School"}
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
}

export default SchoolRegistrationFormPage;