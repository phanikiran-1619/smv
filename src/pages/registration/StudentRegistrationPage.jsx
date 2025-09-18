import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { getToken } from "../../lib/token";
import { countryCodes, cityCodes } from "../../lib/countryCodes";
import Navbar from '../../components/Navbar';
import { Users, Save, RotateCcw, Upload, FileDown } from 'lucide-react';
import * as XLSX from "xlsx";

export function StudentRegistrationFormPage() {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };

  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [formData, setFormData] = useState({
    smStudentId: "", // Keep for internal use but won't be shown in form
    schoolId: "",
    parentId: 0,
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    status: true,
    routeId: 0,
    routePointId: 0,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Data arrays for dropdowns
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [parents, setParents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routePoints, setRoutePoints] = useState([]);
  const [selectedStudentForUpdate, setSelectedStudentForUpdate] = useState("");
  
  // Loading states for skeleton
  const [loadingStates, setLoadingStates] = useState({
    students: false,
    schools: false,
    parents: false,
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
      
      await Promise.all([
        fetchStudents(),
        fetchSchools()
      ]);
    };
    initializePage();
  }, []);

  // Fetch students for update mode dropdown
  const fetchStudents = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, students: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, students: false }));
    }
  };

  // Fetch schools
  const fetchSchools = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, schools: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/school/mine`, {
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

  // Fetch parents based on selected schoolId
  useEffect(() => {
    const fetchParents = async () => {
      if (!formData.schoolId) {
        setParents([]);
        return;
      }

      try {
        setLoadingStates(prev => ({ ...prev, parents: true }));
        const token = getToken();
        if (!token) return;

        const response = await fetch(
          `${API_BASE_URL}/parent/by-school?schoolId=${formData.schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setParents(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching parents:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, parents: false }));
      }
    };

    fetchParents();
  }, [formData.schoolId]);

  // Fetch routes based on selected schoolId
  useEffect(() => {
    const fetchRoutesForSchool = async () => {
      if (!formData.schoolId) {
        setRoutes([]);
        return;
      }

      try {
        setLoadingStates(prev => ({ ...prev, routes: true }));
        const token = getToken();
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/route/school/${formData.schoolId}`, {
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

    fetchRoutesForSchool();
  }, [formData.schoolId]);

  // Fetch route points based on selected routeId
  useEffect(() => {
    const fetchRoutePoints = async () => {
      if (!formData.routeId) {
        setRoutePoints([]);
        return;
      }

      try {
        setLoadingStates(prev => ({ ...prev, routePoints: true }));
        const token = getToken();
        if (!token) return;

        const routeResponse = await fetch(
          `${API_BASE_URL}/route/${formData.routeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (routeResponse.ok) {
          const routeData = await routeResponse.json();
          const smRouteId = routeData.smRouteId;

          const response = await fetch(
            `${API_BASE_URL}/route/smid/${smRouteId}/route-points`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setRoutePoints(Array.isArray(data) ? data : []);
          }
        }
      } catch (error) {
        console.error("Error fetching route points:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, routePoints: false }));
      }
    };

    fetchRoutePoints();
  }, [formData.routeId]);

  // Fetch individual student details for auto-fill
  const fetchStudentDetails = async (smStudentId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/student/by-smStudentId?smStudentId=${smStudentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const student = await response.json();
        setFormData({
          smStudentId: student.smStudentId || "",
          schoolId: student.schoolId || "",
          parentId: student.parentId || 0,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          age: student.age?.toString() || "",
          gender: student.gender || "",
          status: student.status !== undefined ? student.status : true,
          routeId: student.routeId || 0,
          routePointId: student.routePointId || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      setAlertMessage("Failed to fetch student details");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isUpdateMode) {
      // Registration mode - all fields mandatory except smStudentId (auto-generated)
      if (!formData.schoolId) {
        newErrors.schoolId = "Please select a school";
      }

      if (!formData.parentId || formData.parentId <= 0) {
        newErrors.parentId = "Please select a parent";
      }

      if (!formData.firstName || formData.firstName.length < 3) {
        newErrors.firstName = "First name must be at least 3 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain letters only";
      } else if (formData.firstName.length > 20) {
        newErrors.firstName = "First name must be 20 characters or less";
      }

      if (!formData.lastName || formData.lastName.length < 3) {
        newErrors.lastName = "Last name must be at least 3 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain letters only";
      } else if (formData.lastName.length > 20) {
        newErrors.lastName = "Last name must be 20 characters or less";
      }

      const ageNum = Number(formData.age);
      if (!formData.age || isNaN(ageNum)) {
        newErrors.age = "Please enter a valid age";
      } else if (ageNum < 3 || ageNum > 18) {
        newErrors.age = "Age must be between 3 and 18";
      }

      if (!formData.gender) {
        newErrors.gender = "Please select a gender";
      }

      if (formData.routeId <= 0) {
        newErrors.routeId = "Please select a route";
      }

      if (formData.routePointId <= 0) {
        newErrors.routePointId = "Please select a route point";
      }
    } else {
      // Update mode - smStudentId required for identification
      if (!formData.smStudentId) {
        newErrors.smStudentId = "Please select a student to update";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value.trim(),
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
      smStudentId: "", // Keep for internal use
      schoolId: "",
      parentId: 0,
      firstName: "",
      lastName: "",
      age: "",
      gender: "",
      status: true,
      routeId: 0,
      routePointId: 0,
    });
    setIsUpdateMode(newUpdateMode);
    setExcelError(null);
    setErrors({});
    setSelectedStudentForUpdate("");
    setParents([]);
    setRoutePoints([]);
  };

  const handleStudentSelection = async (smStudentId) => {
    setSelectedStudentForUpdate(smStudentId);
    if (smStudentId) {
      await fetchStudentDetails(smStudentId);
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateData = [
        {
          'School ID': 'SC001234',
          'Parent ID': '1',
          'First Name': 'John',
          'Last Name': 'Doe',
          'Age': '15',
          'Gender': 'Male',
          'Route ID': '1',
          'Route Point ID': '1',
          'Status': 'Active',
          'Action': 'Register'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Template");
      XLSX.writeFile(workbook, `student_registration_template.xlsx`);
      
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
              <Users className="w-10 h-10 mr-3" />
              Enhanced Student Registration
            </h1>
            <p className={themeClasses.subtitle}>Advanced student registration with comprehensive validation and Excel support</p>
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
            {/* Student Selection Dropdown for Update Mode */}
            {isUpdateMode && (
              <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-300'} border rounded-xl`}>
                <Label className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 block`}>
                  Select Student to Update
                </Label>
                {loadingStates.students ? (
                  <SkeletonLoader />
                ) : (
                  <SearchableSelect
                    options={students.map(student => ({
                      value: student.smStudentId,
                      label: `${student.firstName} ${student.lastName} (${student.smStudentId})`
                    }))}
                    value={selectedStudentForUpdate}
                    onValueChange={handleStudentSelection}
                    placeholder="Search and select a student..."
                    searchPlaceholder="Type to search students..."
                    className={themeClasses.input}
                  />
                )}
                <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} text-sm mt-2`}>
                  Select a student from the dropdown to auto-fill the form with current data
                </p>
              </div>
            )}

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (isSubmitting) return;

                if (!validateForm()) {
                  setAlertMessage("Please fill all fields before submitting");
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
                  const selectedRoutePoint = routePoints.find((rp) => rp.id === formData.routePointId);
                  const requestBody = isUpdateMode
                    ? { smStudentId: formData.smStudentId }
                    : { ...formData, seqOrder: selectedRoutePoint?.seqOrder };

                  // Remove smStudentId from registration request as it will be auto-generated
                  if (!isUpdateMode) {
                    delete requestBody.smStudentId;
                  }

                  if (isUpdateMode) {
                    if (formData.schoolId) requestBody.schoolId = formData.schoolId;
                    if (formData.parentId > 0) requestBody.parentId = formData.parentId;
                    if (formData.firstName) requestBody.firstName = formData.firstName;
                    if (formData.lastName) requestBody.lastName = formData.lastName;
                    if (formData.age) requestBody.age = formData.age;
                    if (formData.gender) requestBody.gender = formData.gender;
                    if (formData.routeId > 0) requestBody.routeId = formData.routeId;
                    if (formData.routePointId > 0) {
                      requestBody.routePointId = formData.routePointId;
                      requestBody.seqOrder = selectedRoutePoint?.seqOrder;
                    }
                    requestBody.status = formData.status;
                  }

                  const response = await fetch(
                    isUpdateMode
                      ? `${API_BASE_URL}/student/update?smStudentId=${formData.smStudentId}`
                      : `${API_BASE_URL}/student/register`,
                    {
                      method: isUpdateMode ? "PUT" : "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(requestBody),
                    }
                  );

                  const responseData = await response.json();
                  if (!response.ok) {
                    throw new Error(responseData.detail || responseData.message || `${isUpdateMode ? "Update" : "Registration"} failed`);
                  }

                  setAlertMessage(`Successfully ${isUpdateMode ? "updated" : "registered"}`);
                  resetForm(false);
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
                Student {isUpdateMode ? "Update" : "Registration"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolId" className={themeClasses.label}>
                    School: {!isUpdateMode && <span className="text-red-400">*</span>}
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
                      onValueChange={(value) => handleSelectChange('schoolId', value)}
                      placeholder="Search and select a school..."
                      searchPlaceholder="Type to search schools..."
                      error={!!errors.schoolId}
                      disabled={isSubmitting || isUpdateMode}
                      className={`${themeClasses.input} ${isUpdateMode ? "opacity-50" : ""}`}
                    />
                  )}
                  {errors.schoolId && <p className="text-red-500 text-sm">{errors.schoolId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentId" className={themeClasses.label}>
                    Parent: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  {loadingStates.parents ? (
                    <SkeletonLoader />
                  ) : (
                    <SearchableSelect
                      options={parents.map(parent => ({
                        value: parent.id,
                        label: `${parent.smParentId} - ${parent.firstName} ${parent.lastName}`
                      }))}
                      value={formData.parentId || ""}
                      onValueChange={(value) => handleSelectChange('parentId', Number(value))}
                      placeholder="Search and select a parent..."
                      searchPlaceholder="Type to search parents..."
                      error={!!errors.parentId}
                      disabled={!formData.schoolId || isSubmitting}
                      className={themeClasses.input}
                    />
                  )}
                  {errors.parentId && <p className="text-red-500 text-sm">{errors.parentId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className={themeClasses.label}>
                    First Name: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.firstName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className={themeClasses.label}>
                    Last Name: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.lastName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className={themeClasses.label}>
                    Age: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Enter Age (3-18)"
                    value={formData.age}
                    onChange={handleChange}
                    min={3}
                    max={18}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.age ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className={themeClasses.label}>
                    Gender: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <SearchableSelect
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" }
                    ]}
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                    placeholder="Select Gender"
                    searchPlaceholder="Search gender..."
                    error={!!errors.gender}
                    disabled={isSubmitting}
                    className={themeClasses.input}
                  />
                  {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routeId" className={themeClasses.label}>
                    Route: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  {loadingStates.routes ? (
                    <SkeletonLoader />
                  ) : (
                    <SearchableSelect
                      options={routes.map(route => ({
                        value: route.id,
                        label: `${route.routeName} (${route.smRouteId})`
                      }))}
                      value={formData.routeId || ""}
                      onValueChange={(value) => {
                        handleSelectChange('routeId', Number(value));
                        setFormData(prev => ({ ...prev, routePointId: 0 }));
                      }}
                      placeholder="Search and select a route..."
                      searchPlaceholder="Type to search routes..."
                      error={!!errors.routeId}
                      disabled={isSubmitting}
                      className={themeClasses.input}
                    />
                  )}
                  {errors.routeId && <p className="text-red-500 text-sm">{errors.routeId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routePointId" className={themeClasses.label}>
                    Route Point: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  {loadingStates.routePoints ? (
                    <SkeletonLoader />
                  ) : (
                    <SearchableSelect
                      options={routePoints.map(point => ({
                        value: point.id,
                        label: `${point.routePointName} (Seq: ${point.seqOrder})`
                      }))}
                      value={formData.routePointId || ""}
                      onValueChange={(value) => handleSelectChange('routePointId', Number(value))}
                      placeholder="Search and select a route point..."
                      searchPlaceholder="Type to search route points..."
                      error={!!errors.routePointId}
                      disabled={!formData.routeId || isSubmitting}
                      className={themeClasses.input}
                    />
                  )}
                  {errors.routePointId && <p className="text-red-500 text-sm">{errors.routePointId}</p>}
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
                    ? "Update Student"
                    : "Register Student"}
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

export default StudentRegistrationFormPage;