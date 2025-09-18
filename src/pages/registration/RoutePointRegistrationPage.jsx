import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { getToken } from "../../lib/token";
import Navbar from '../../components/Navbar';
import { MapPin, Save, RotateCcw, Upload, FileDown } from 'lucide-react';
import * as XLSX from "xlsx";

export function RoutePointRegistrationPage() {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };

  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [formData, setFormData] = useState({
    schoolId: "",
    routeId: "",
    routePointName: "",
    title: "",
    latitude: "",
    longitude: "",
    status: false,
    reserve: "",
    content: "",
    seqOrder: 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [routePoints, setRoutePoints] = useState([]);
  const [schools, setSchools] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoutePointForUpdate, setSelectedRoutePointForUpdate] = useState("");
  const [selectedRoutePointId, setSelectedRoutePointId] = useState(""); // Store smRoutePointId for updates
  const [loadingStates, setLoadingStates] = useState({
    routePoints: false,
    schools: false,
    routes: false,
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
      
      await Promise.all([
        fetchRoutePoints(),
        fetchSchools()
      ]);
    };
    initializePage();
  }, []);

  // Fetch routes when school changes
  useEffect(() => {
    if (formData.schoolId) {
      fetchRoutesForSchool(formData.schoolId);
    } else {
      setRoutes([]);
    }
  }, [formData.schoolId]);

  // Fetch route points for update mode dropdown
  const fetchRoutePoints = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, routePoints: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/route/route-points`, {
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

  // Fetch schools for dropdown
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

  // Fetch routes for specific school using smSchoolId
  const fetchRoutesForSchool = async (schoolId) => {
    try {
      setLoadingStates(prev => ({ ...prev, routes: true }));
      const token = getToken();
      if (!token) return;
      
      // Find the selected school to get its smSchoolId or use the schoolId directly
      const selectedSchool = schools.find(school => school.id === schoolId);
      const smSchoolId = selectedSchool?.smSchoolId || selectedSchool?.id || schoolId;
      
      const response = await fetch(`${API_BASE_URL}/route/school/${smSchoolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoutes(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch routes:', response.status, response.statusText);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes for school:', error);
      setRoutes([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, routes: false }));
    }
  };

  // Fetch individual route point details for auto-fill
  const fetchRoutePointDetails = async (smRoutePointId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/route/route-point/by-id?smRoutePointId=${smRoutePointId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData({
            schoolId: data.schoolId || "",
            routeId: data.routeId || "",
            routePointName: data.routePointName || "",
            title: data.title || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            status: data.status || false,
            reserve: data.reserve || "",
            content: data.content || "",
            seqOrder: data.seqOrder || 0,
          });
          // Store the smRoutePointId for update API calls
          setSelectedRoutePointId(data.smRoutePointId || smRoutePointId);
        }
      }
    } catch (error) {
      console.error('Error fetching route point details:', error);
      setAlertMessage("Failed to fetch route point details");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // School ID: Must be selected in registration mode
    if (!isUpdateMode) {
      if (!formData.schoolId) {
        newErrors.schoolId = "Please select a school";
      }
    }

    // Route ID: Must be selected in registration mode
    if (!isUpdateMode) {
      if (!formData.routeId) {
        newErrors.routeId = "Please select a route";
      }
    }

    // Route Point Name: Required in registration mode, at least 2 characters, max 20 characters
    if (!isUpdateMode) {
      if (!formData.routePointName || formData.routePointName.length < 2) {
        newErrors.routePointName = "Route Point Name must be at least 2 characters long";
      } else if (formData.routePointName.length > 20) {
        newErrors.routePointName = "Route Point Name must be 20 characters or less";
      }
    } else if (formData.routePointName) {
      if (formData.routePointName.length < 2) {
        newErrors.routePointName = "Route Point Name must be at least 2 characters long";
      } else if (formData.routePointName.length > 20) {
        newErrors.routePointName = "Route Point Name must be 20 characters or less";
      }
    }

    // Title: Required in registration mode, at least 2 characters, max 20 characters
    if (!isUpdateMode) {
      if (!formData.title || formData.title.length < 2) {
        newErrors.title = "Title must be at least 2 characters long";
      } else if (formData.title.length > 20) {
        newErrors.title = "Title must be 20 characters or less";
      }
    } else if (formData.title) {
      if (formData.title.length < 2) {
        newErrors.title = "Title must be at least 2 characters long";
      } else if (formData.title.length > 20) {
        newErrors.title = "Title must be 20 characters or less";
      }
    }

    // Latitude: Optional, valid format (e.g., -90 to 90), max 10 characters
    if (formData.latitude) {
      const latValue = parseFloat(formData.latitude);
      if (isNaN(latValue) || latValue < -90 || latValue > 90) {
        newErrors.latitude = "Latitude must be a number between -90 and 90";
      } else if (formData.latitude.length > 10) {
        newErrors.latitude = "Latitude must be 10 characters or less";
      }
    }

    // Longitude: Optional, valid format (e.g., -180 to 180), max 10 characters
    if (formData.longitude) {
      const lonValue = parseFloat(formData.longitude);
      if (isNaN(lonValue) || lonValue < -180 || lonValue > 180) {
        newErrors.longitude = "Longitude must be a number between -180 and 180";
      } else if (formData.longitude.length > 10) {
        newErrors.longitude = "Longitude must be 10 characters or less";
      }
    }

    // Sequence Order: Required and non-negative in registration mode
    if (!isUpdateMode) {
      if (formData.seqOrder === undefined || formData.seqOrder === null || formData.seqOrder < 0) {
        newErrors.seqOrder = "Sequence Order must be a non-negative number";
      }
    } else if (formData.seqOrder !== undefined && formData.seqOrder < 0) {
      newErrors.seqOrder = "Sequence Order must be a non-negative number";
    }

    // Reserve: Optional, max 50 characters
    if (formData.reserve && formData.reserve.length > 50) {
      newErrors.reserve = "Reserve must be 50 characters or less";
    }

    // Content: Optional, max 100 characters
    if (formData.content && formData.content.length > 100) {
      newErrors.content = "Content must be 100 characters or less";
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

  const handleSchoolChange = (schoolId) => {
    setFormData({
      ...formData,
      schoolId: schoolId,
      routeId: "", // Reset route when school changes
    });
    setErrors({ ...errors, schoolId: undefined, routeId: undefined });
  };

  const resetForm = (newUpdateMode = false) => {
    setFormData({
      schoolId: "",
      routeId: "",
      routePointName: "",
      title: "",
      latitude: "",
      longitude: "",
      status: false,
      reserve: "",
      content: "",
      seqOrder: 0,
    });
    setIsUpdateMode(newUpdateMode);
    setExcelError(null);
    setErrors({});
    setSelectedRoutePointForUpdate("");
    setSelectedRoutePointId(""); // Reset the route point ID
    setRoutes([]); // Clear routes when resetting
  };

  const handleRoutePointSelection = async (smRoutePointId) => {
    setSelectedRoutePointForUpdate(smRoutePointId);
    if (smRoutePointId) {
      await fetchRoutePointDetails(smRoutePointId);
    } else {
      setSelectedRoutePointId(""); // Clear the ID if no route point selected
    }
  };

  const checkExistingRoutePoint = async (field, value, schoolId, routeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/route/route-point/check?${field}=${value}&schoolId=${schoolId}&routeId=${routeId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await response.json();
      if (data.exists && !isUpdateMode) {
        setAlertMessage(`This ${field} is already in use for the selected school and route`);
        return false;
      }
      return !data.exists || isUpdateMode;
    } catch {
      setAlertMessage(`Error checking ${field}`);
      return false;
    }
  };

  const checkExcelDuplicates = (routePointDataArray) => {
    const seenRoutePoints = new Map();
    const seenSeqOrders = new Map();

    for (let i = 0; i < routePointDataArray.length; i++) {
      const routePoint = routePointDataArray[i];
      const key = `${routePoint.schoolId}-${routePoint.routeId}`;

      if (!seenRoutePoints.has(key)) {
        seenRoutePoints.set(key, new Set());
        seenSeqOrders.set(key, new Set());
      }

      const routePointsSet = seenRoutePoints.get(key);
      const seqOrdersSet = seenSeqOrders.get(key);

      if (routePointsSet.has(routePoint.routePointName)) {
        setExcelError(`Row ${i + 2}: Duplicate route point name: ${routePoint.routePointName} for School ID ${routePoint.schoolId} and Route ID ${routePoint.routeId}`);
        return false;
      }
      if (seqOrdersSet.has(routePoint.seqOrder)) {
        setExcelError(`Row ${i + 2}: Duplicate sequence order: ${routePoint.seqOrder} for School ID ${routePoint.schoolId} and Route ID ${routePoint.routeId}`);
        return false;
      }

      routePointsSet.add(routePoint.routePointName);
      seqOrdersSet.add(routePoint.seqOrder);
    }
    return true;
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateData = [
        {
          'School ID': 'SC001234',
          'Route ID': '1',
          'Route Point Name': 'ITPL Main Gate',
          'Title': 'ITPL Main Gate',
          'Latitude': '12.986132',
          'Longitude': '77.731275',
          'Status': 'Active',
          'Reserve': '0',
          'Content': 'Route point description',
          'Sequence Order': '1',
          'Action': 'Register'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RoutePoint Template");
      XLSX.writeFile(workbook, `routepoint_registration_template.xlsx`);
      
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

  return (
    <div className={themeClasses.background}>
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${themeClasses.title} mb-2 flex items-center justify-center`}>
              <MapPin className="w-10 h-10 mr-3" />
              Enhanced Route Point Registration
            </h1>
            <p className={themeClasses.subtitle}>Advanced route point registration with comprehensive validation and Excel support</p>
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
            {/* Route Point Selection Dropdown for Update Mode */}
            {isUpdateMode && (
              <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-300'} border rounded-xl`}>
                <Label className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 block`}>
                  Select Route Point to Update
                </Label>
                {loadingStates.routePoints ? (
                  <SkeletonLoader />
                ) : (
                  <SearchableSelect
                    options={routePoints.map(routePoint => ({
                      value: routePoint.smRoutePointId,
                      label: `${routePoint.routePointName} (${routePoint.smRoutePointId}) - ${routePoint.title}`
                    }))}
                    value={selectedRoutePointForUpdate}
                    onValueChange={handleRoutePointSelection}
                    placeholder="Search and select a route point..."
                    searchPlaceholder="Type to search route points..."
                    className={themeClasses.input}
                  />
                )}
                <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} text-sm mt-2`}>
                  Select a route point from the dropdown to auto-fill the form with its current data
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

                // Additional validation for update mode
                if (isUpdateMode && !selectedRoutePointId) {
                  setAlertMessage("Please select a route point to update");
                  return;
                }

                setIsSubmitting(true);

                const token = getToken();
                if (!token) {
                  setAlertMessage("Please log in again.");
                  setIsSubmitting(false);
                  return;
                }

                // Check for existing route point in registration mode
                if (!isUpdateMode) {
                  if (!(await checkExistingRoutePoint("routePointName", formData.routePointName, formData.schoolId, formData.routeId))) {
                    setIsSubmitting(false);
                    return;
                  }
                  if (!(await checkExistingRoutePoint("seqOrder", formData.seqOrder.toString(), formData.schoolId, formData.routeId))) {
                    setIsSubmitting(false);
                    return;
                  }
                }

                try {
                  if (isUpdateMode) {
                    const updateBody = {};
                    if (formData.schoolId) updateBody.schoolId = formData.schoolId;
                    if (formData.routeId) updateBody.routeId = formData.routeId;
                    if (formData.routePointName) updateBody.routePointName = formData.routePointName;
                    if (formData.title) updateBody.title = formData.title;
                    if (formData.latitude) updateBody.latitude = formData.latitude;
                    if (formData.longitude) updateBody.longitude = formData.longitude;
                    if (formData.status !== undefined) updateBody.status = formData.status;
                    if (formData.reserve) updateBody.reserve = formData.reserve;
                    if (formData.content) updateBody.content = formData.content;
                    if (formData.seqOrder !== undefined) updateBody.seqOrder = formData.seqOrder;

                    const response = await fetch(
                      `${API_BASE_URL}/route/update/route-point/${selectedRoutePointId}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(updateBody),
                      }
                    );

                    const responseText = await response.text();
                    let responseData;
                    try {
                      responseData = JSON.parse(responseText);
                    } catch {
                      responseData = { message: responseText };
                    }

                    if (!response.ok) {
                      throw new Error(responseData.message || `Update failed with status ${response.status}`);
                    }

                    setAlertMessage(responseData.message || "Route point updated successfully");
                    resetForm(false);
                  } else {
                    const response = await fetch(
                      `${API_BASE_URL}/route/route-point/register`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          schoolId: formData.schoolId,
                          routeId: formData.routeId,
                          routePointName: formData.routePointName,
                          title: formData.title,
                          latitude: formData.latitude,
                          longitude: formData.longitude,
                          status: formData.status,
                          reserve: formData.reserve,
                          content: formData.content,
                          seqOrder: formData.seqOrder,
                        }),
                      }
                    );

                    const responseText = await response.text();
                    let responseData;
                    try {
                      responseData = JSON.parse(responseText);
                    } catch {
                      responseData = { message: responseText };
                    }

                    if (!response.ok) {
                      throw new Error(responseData.message || `Registration failed with status ${response.status}`);
                    }

                    setAlertMessage("Route point registered successfully");
                    resetForm(false);
                  }
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
                Route Point {isUpdateMode ? "Update" : "Registration"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School field - only show in registration mode */}
                {!isUpdateMode && (
                  <div className="space-y-2">
                    <Label htmlFor="schoolId" className={themeClasses.label}>
                      School: <span className="text-red-400">*</span>
                    </Label>
                    {loadingStates.schools ? (
                      <SkeletonLoader />
                    ) : (
                      <SearchableSelect
                        options={schools.map(school => ({
                          value: school.id,
                          label: `${school.name} (${school.id})`
                        }))}
                        value={formData.schoolId}
                        onValueChange={handleSchoolChange}
                        placeholder="Search and select a school..."
                        searchPlaceholder="Search schools..."
                        error={!!errors.schoolId}
                        disabled={isSubmitting}
                        className={themeClasses.input}
                      />
                    )}
                    {errors.schoolId && <p className="text-red-500 text-sm">{errors.schoolId}</p>}
                  </div>
                )}

                {/* Route field - only show in registration mode */}
                {!isUpdateMode && (
                  <div className="space-y-2">
                    <Label htmlFor="routeId" className={themeClasses.label}>
                      Route: <span className="text-red-400">*</span>
                    </Label>
                    {loadingStates.routes ? (
                      <SkeletonLoader />
                    ) : (
                      <SearchableSelect
                        options={routes.map(route => ({
                          value: route.id,
                          label: `${route.routeName || route.name || route.title} (${route.id})`
                        }))}
                        value={formData.routeId}
                        onValueChange={(value) => handleSelectChange('routeId', value)}
                        placeholder="Search and select a route..."
                        searchPlaceholder="Search routes..."
                        error={!!errors.routeId}
                        disabled={isSubmitting || !formData.schoolId}
                        className={themeClasses.input}
                      />
                    )}
                    {errors.routeId && <p className="text-red-500 text-sm">{errors.routeId}</p>}
                    {!formData.schoolId && (
                      <p className="text-yellow-600 text-sm">Please select a school first to load routes</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="routePointName" className={themeClasses.label}>
                    Route Point Name:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="routePointName"
                    name="routePointName"
                    placeholder="Enter Route Point Name"
                    value={formData.routePointName}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.routePointName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.routePointName && <p className="text-red-500 text-sm">{errors.routePointName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className={themeClasses.label}>
                    Title:{!isUpdateMode && <span className="text-red-400"> *</span>}
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

                <div className="space-y-2">
                  <Label htmlFor="latitude" className={themeClasses.label}>
                    Latitude:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    placeholder="Enter Latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    maxLength={10}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.latitude ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.latitude && <p className="text-red-500 text-sm">{errors.latitude}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude" className={themeClasses.label}>
                    Longitude:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    placeholder="Enter Longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    maxLength={10}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.longitude ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.longitude && <p className="text-red-500 text-sm">{errors.longitude}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seqOrder" className={themeClasses.label}>
                    Sequence Order:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="seqOrder"
                    name="seqOrder"
                    type="number"
                    placeholder="Enter Sequence Order"
                    value={formData.seqOrder}
                    onChange={handleChange}
                    min={0}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.seqOrder ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.seqOrder && <p className="text-red-500 text-sm">{errors.seqOrder}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserve" className={themeClasses.label}>
                    Reserve:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="reserve"
                    name="reserve"
                    placeholder="Enter Reserve Information"
                    value={formData.reserve}
                    onChange={handleChange}
                    maxLength={50}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.reserve ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.reserve && <p className="text-red-500 text-sm">{errors.reserve}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className={themeClasses.label}>
                    Content:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="content"
                    name="content"
                    placeholder="Enter Content"
                    value={formData.content}
                    onChange={handleChange}
                    maxLength={100}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.content ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={themeClasses.label}>
                    Status:{!isUpdateMode && <span className="text-red-400"> *</span>}
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

                      const token = getToken();
                      if (!token) {
                        setAlertMessage("Please log in again.");
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        try {
                          const data = new Uint8Array(e.target?.result);
                          const workbook = XLSX.read(data, { type: "array" });
                          const sheetName = workbook.SheetNames[0];
                          const worksheet = workbook.Sheets[sheetName];
                          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                          const headers = jsonData[0];
                          const requiredHeaders = [
                            "School ID", "Route ID", "Route Point Name", "Title", "Latitude", "Longitude", "Sequence Order", "Reserve", "Content"
                          ];
                          const missingRequiredHeaders = requiredHeaders.filter((header) => !headers.includes(header));
                          if (missingRequiredHeaders.length > 0) {
                            setExcelError(`Missing required headers: ${missingRequiredHeaders.join(", ")}`);
                            return;
                          }

                          const routePointDataArray = [];
                          for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (!row || row.length === 0) continue;

                            const rowObject = headers.reduce((obj, header, index) => {
                              obj[header] = row[index] !== undefined ? String(row[index]) : "";
                              return obj;
                            }, {});

                            // Validate required fields
                            const errors = [];
                            if (!rowObject["School ID"]) errors.push("School ID is missing");
                            if (!rowObject["Route ID"]) errors.push("Route ID is missing");
                            if (!rowObject["Route Point Name"]) errors.push("Route Point Name is missing");
                            if (!rowObject["Title"]) errors.push("Title is missing");
                            if (!rowObject["Latitude"]) errors.push("Latitude is missing");
                            if (!rowObject["Longitude"]) errors.push("Longitude is missing");
                            if (!rowObject["Sequence Order"]) errors.push("Sequence Order is missing");
                            if (!rowObject["Reserve"]) errors.push("Reserve is missing");
                            if (!rowObject["Content"]) errors.push("Content is missing");

                            if (errors.length > 0) {
                              setExcelError(`Row ${i + 1}: ${errors.join(", ")}`);
                              return;
                            }

                            const action = rowObject["Action"] ? rowObject["Action"].toLowerCase() : "register";
                            if (action !== "register") {
                              setExcelError(`Row ${i + 1}: Excel bulk operations only support "Register" action. Update operations must be done individually through Update Mode.`);
                              return;
                            }

                            routePointDataArray.push({
                              schoolId: rowObject["School ID"].trim(),
                              routeId: rowObject["Route ID"].trim(),
                              routePointName: rowObject["Route Point Name"].trim(),
                              title: rowObject["Title"].trim(),
                              latitude: rowObject["Latitude"]?.trim() || "",
                              longitude: rowObject["Longitude"]?.trim() || "",
                              status: rowObject["Status"] === "Active" || rowObject["Status"] === "true" || rowObject["Status"] === "1",
                              reserve: rowObject["Reserve"]?.trim() || "",
                              content: rowObject["Content"]?.trim() || "",
                              seqOrder: Number(rowObject["Sequence Order"]),
                              action: action,
                            });
                          }

                          if (routePointDataArray.length === 0) {
                            setExcelError("Excel file contains no valid data rows.");
                            return;
                          }

                          if (!checkExcelDuplicates(routePointDataArray)) {
                            return;
                          }

                          setIsSubmitting(true);
                          const failedRegistrations = [];
                          let successCount = 0;

                          for (const routePointData of routePointDataArray) {
                            try {
                              const response = await fetch(`${API_BASE_URL}/route/route-point/register`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  schoolId: routePointData.schoolId,
                                  routeId: routePointData.routeId,
                                  routePointName: routePointData.routePointName,
                                  title: routePointData.title,
                                  latitude: routePointData.latitude,
                                  longitude: routePointData.longitude,
                                  status: routePointData.status,
                                  reserve: routePointData.reserve,
                                  content: routePointData.content,
                                  seqOrder: routePointData.seqOrder,
                                }),
                              });

                              if (!response.ok) {
                                const errorData = await response.json();
                                failedRegistrations.push(
                                  `${routePointData.routePointName}: ${errorData.message || response.statusText}`
                                );
                              } else {
                                successCount++;
                              }
                            } catch {
                              failedRegistrations.push(`${routePointData.routePointName}: Network or unexpected error`);
                            }
                          }

                          setIsSubmitting(false);

                          if (failedRegistrations.length === 0) {
                            setAlertMessage(`${successCount} route points processed successfully`);
                            resetForm(false);
                            setExcelError(null);
                          } else {
                            const message = [
                              `${successCount} route points processed successfully`,
                              `Failed to process ${failedRegistrations.length} route points:`,
                              ...failedRegistrations,
                            ].join("\
");
                            setExcelError(message);
                          }
                        } catch {
                          console.error("Error parsing Excel file:");
                          setExcelError("Failed to parse Excel file. Ensure it is a valid Excel file.");
                        }
                      };
                      reader.readAsArrayBuffer(file);
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
                    ? "Update Route Point"
                    : "Register Route Point"}
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

export default RoutePointRegistrationPage;