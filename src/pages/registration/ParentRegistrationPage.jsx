import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { getToken } from "../../lib/token";
import { countryCodes } from "../../lib/countryCodes";
import Navbar from '../../components/Navbar';
import { Users, Save, RotateCcw, Upload, FileDown } from 'lucide-react';
import * as XLSX from "xlsx";

export function ParentRegistrationPage() {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };

  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    countryCode: "IN",
    schoolId: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [parents, setParents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedParentForUpdate, setSelectedParentForUpdate] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(""); // Store smParentId for updates
  const [loadingStates, setLoadingStates] = useState({
    parents: false,
    schools: false,
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
        fetchParents(),
        fetchSchools()
      ]);
    };
    initializePage();
  }, []);

  // Fetch parents for update mode dropdown
  const fetchParents = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, parents: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/parent/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setParents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, parents: false }));
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

  // Fetch individual parent details for auto-fill
  const fetchParentDetails = async (smParentId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/parent/by-parentId?smParentId=${smParentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData({
            username: data.user?.username || "",
            password: "", // Don't populate password for security
            email: data.user?.email || "",
            phone: data.user?.phone || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            countryCode: data.countryCode || "IN",
            schoolId: data.schId || "",
          });
          // Store the smParentId for update API calls
          setSelectedParentId(data.smParentId || smParentId);
        }
      }
    } catch (error) {
      console.error('Error fetching parent details:', error);
      setAlertMessage("Failed to fetch parent details");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username: At least 3 characters, alphanumeric only
    if (!isUpdateMode || formData.username) {
      if (!formData.username || formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters long";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        newErrors.username = "Username must be alphanumeric";
      }
    }

    // Password: Minimum 8 characters, one uppercase, one lowercase, one number (not required in update mode)
    if (!isUpdateMode) {
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain at least one uppercase, one lowercase, and one number";
      }
    }

    // Email: Valid email format
    if (!isUpdateMode || formData.email) {
      if (!formData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Phone: 10 digits only
    if (!isUpdateMode || formData.phone) {
      if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
    }

    // First Name: Letters only, minimum 2 characters
    if (!isUpdateMode || formData.firstName) {
      if (!formData.firstName || formData.firstName.length < 3) {
        newErrors.firstName = "First name must be at least 3 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain letters only";
      }
    }

    // Last Name: Letters only, minimum 2 characters
    if (!isUpdateMode || formData.lastName) {
      if (!formData.lastName || formData.lastName.length < 3) {
        newErrors.lastName = "Last name must be at least 3 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain letters only";
      }
    }

    // Country Code: Must be selected
    if (!isUpdateMode || formData.countryCode) {
      if (!formData.countryCode) {
        newErrors.countryCode = "Please select a country code";
      }
    }

    // School ID: Must be selected (only in registration mode)
    if (!isUpdateMode) {
      if (!formData.schoolId) {
        newErrors.schoolId = "Please select a school";
      } else if (formData.schoolId.length !== 8) {
        newErrors.schoolId = "School ID must be exactly 8 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    // Special handling for phone number - only allow digits
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({
        ...formData,
        [name]: digitsOnly,
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
    setFormData({
      ...formData,
      [field]: value,
    });
    setErrors({ ...errors, [field]: undefined });
  };

  const resetForm = (newUpdateMode = false) => {
    setFormData({
      username: "",
      password: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      countryCode: "IN",
      schoolId: "",
    });
    setIsUpdateMode(newUpdateMode);
    setExcelError(null);
    setErrors({});
    setSelectedParentForUpdate("");
    setSelectedParentId(""); // Reset the parent ID
  };

  const handleParentSelection = async (smParentId) => {
    setSelectedParentForUpdate(smParentId);
    if (smParentId) {
      await fetchParentDetails(smParentId);
    } else {
      setSelectedParentId(""); // Clear the ID if no parent selected
    }
  };

  const checkExistingUser = async (field, value) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent/check?${field}=${value}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await response.json();
      if (data.exists && !isUpdateMode) {
        setAlertMessage(`This ${field} is already in use`);
        return false;
      }
      return !data.exists || isUpdateMode;
    } catch {
      setAlertMessage(`Error checking ${field}`);
      return false;
    }
  };

  const checkExcelDuplicates = (parentDataArray) => {
    const seenUsernames = new Set();
    const seenEmails = new Set();

    for (let i = 0; i < parentDataArray.length; i++) {
      const parent = parentDataArray[i];
      if (seenUsernames.has(parent.username)) {
        setExcelError(`Row ${i + 2}: Duplicate username: ${parent.username}`);
        return false;
      }
      if (seenEmails.has(parent.email)) {
        setExcelError(`Row ${i + 2}: Duplicate email: ${parent.email}`);
        return false;
      }
      seenUsernames.add(parent.username);
      seenEmails.add(parent.email);
    }
    return true;
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateData = [
        {
          'Username': 'johndoe',
          'Password': 'Password123',
          'Email': 'john.doe@email.com',
          'Phone': '9876543210',
          'First Name': 'John',
          'Last Name': 'Doe',
          'Country Code': 'IN',
          'School ID': 'SC001234',
          'Action': 'Register'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Parent Template");
      XLSX.writeFile(workbook, `parent_registration_template.xlsx`);
      
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
              Enhanced Parent Registration
            </h1>
            <p className={themeClasses.subtitle}>Advanced parent registration with comprehensive validation and Excel support</p>
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
            {/* Parent Selection Dropdown for Update Mode */}
            {isUpdateMode && (
              <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-300'} border rounded-xl`}>
                <Label className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 block`}>
                  Select Parent to Update
                </Label>
                {loadingStates.parents ? (
                  <SkeletonLoader />
                ) : (
                  <SearchableSelect
                    options={parents.map(parent => ({
                      value: parent.smParentId,
                      label: `${parent.firstName} ${parent.lastName} (${parent.smParentId}) - ${parent.user?.username || 'No Username'}`
                    }))}
                    value={selectedParentForUpdate}
                    onValueChange={handleParentSelection}
                    placeholder="Search and select a parent..."
                    searchPlaceholder="Type to search parents..."
                    className={themeClasses.input}
                  />
                )}
                <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} text-sm mt-2`}>
                  Select a parent from the dropdown to auto-fill the form with their current data
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
                if (isUpdateMode && !selectedParentId) {
                  setAlertMessage("Please select a parent to update");
                  return;
                }

                setIsSubmitting(true);

                const token = getToken();
                if (!token) {
                  setAlertMessage("Please log in again.");
                  setIsSubmitting(false);
                  return;
                }

                // Validate username and email for registration
                if (!isUpdateMode) {
                  if (!(await checkExistingUser("username", formData.username))) {
                    setIsSubmitting(false);
                    return;
                  }
                  if (!(await checkExistingUser("email", formData.email))) {
                    setIsSubmitting(false);
                    return;
                  }
                }

                try {
                  if (isUpdateMode) {
                    const updateBody = {};
                    if (formData.username) updateBody.username = formData.username;
                    if (formData.password) updateBody.password = formData.password;
                    if (formData.email) updateBody.email = formData.email.toLowerCase();
                    if (formData.phone) updateBody.phone = formData.phone;
                    if (formData.firstName) updateBody.firstName = formData.firstName;
                    if (formData.lastName) updateBody.lastName = formData.lastName;
                    if (formData.countryCode) updateBody.countryCode = formData.countryCode;

                    const response = await fetch(
                      `${API_BASE_URL}/parent/update?smParentId=${selectedParentId}`,
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

                    setAlertMessage(responseData.message || "Parent updated successfully");
                    resetForm(false);
                  } else {
                    const registerBody = {
                      username: formData.username,
                      password: formData.password,
                      email: formData.email.toLowerCase(),
                      phone: formData.phone,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      countryCode: formData.countryCode,
                      schoolId: formData.schoolId,
                    };

                    const response = await fetch(`${API_BASE_URL}/parent/register`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                      },
                      body: JSON.stringify(registerBody),
                    });

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

                    setAlertMessage("Parent registered successfully");
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
                Parent {isUpdateMode ? "Update" : "Registration"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className={themeClasses.label}>
                    Username:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter Username"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.username ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>

                {!isUpdateMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className={themeClasses.label}>
                      Password: <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isUpdateMode}
                      className={`${themeClasses.input} ${errors.password ? "border-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className={themeClasses.label}>
                    Email:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.email ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className={themeClasses.label}>
                    Contact Number:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter 10-digit contact number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onKeyPress={(e) => {
                      // Only allow digits
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                        e.preventDefault();
                      }
                    }}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.phone ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  <p className="text-xs text-gray-500">Only numbers allowed, exactly 10 digits</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className={themeClasses.label}>
                    First Name:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.firstName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className={themeClasses.label}>
                    Last Name:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.lastName ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryCode" className={themeClasses.label}>
                    Country Code:{!isUpdateMode && <span className="text-red-400"> *</span>}
                  </Label>
                  <SearchableSelect
                    options={countryCodes.map(code => ({
                      value: code.id,
                      label: `${code.country} - ${code.id}`
                    }))}
                    value={formData.countryCode}
                    onValueChange={(value) => handleSelectChange('countryCode', value)}
                    placeholder="Select Country Code"
                    searchPlaceholder="Search countries..."
                    error={!!errors.countryCode}
                    disabled={isSubmitting}
                    className={themeClasses.input}
                  />
                  {errors.countryCode && <p className="text-red-500 text-sm">{errors.countryCode}</p>}
                </div>

                {/* School field - only show in registration mode and make it non-editable in update mode */}
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
                        onValueChange={(value) => handleSelectChange('schoolId', value)}
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
                            "Username", "Password", "Email", "Phone", "First Name", "Last Name", "Country Code", "School ID"
                          ];
                          const missingRequiredHeaders = requiredHeaders.filter((header) => !headers.includes(header));
                          if (missingRequiredHeaders.length > 0) {
                            setExcelError(`Missing required headers: ${missingRequiredHeaders.join(", ")}`);
                            return;
                          }

                          const parentDataArray = [];
                          for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (!row || row.length === 0) continue;

                            const rowObject = headers.reduce((obj, header, index) => {
                              obj[header] = String(row[index] ?? "");
                              return obj;
                            }, {});

                            // Validate required fields
                            const errors = [];
                            if (!rowObject["Username"]) errors.push("Username is missing");
                            if (!rowObject["Password"]) errors.push("Password is missing");
                            if (!rowObject["Email"]) errors.push("Email is missing");
                            if (!rowObject["Phone"]) errors.push("Phone is missing");
                            if (!rowObject["First Name"]) errors.push("First Name is missing");
                            if (!rowObject["Last Name"]) errors.push("Last Name is missing");
                            if (!rowObject["Country Code"]) errors.push("Country Code is missing");
                            if (!rowObject["School ID"]) errors.push("School ID is missing");

                            if (errors.length > 0) {
                              setExcelError(`Row ${i + 1}: ${errors.join(", ")}`);
                              return;
                            }

                            if (!countryCodes.some((code) => code.id === rowObject["Country Code"])) {
                              setExcelError(`Row ${i + 1}: Invalid Country Code: ${rowObject["Country Code"]}`);
                              return;
                            }

                            const action = rowObject["Action"] ? rowObject["Action"].toLowerCase() : "register";
                            if (action !== "register") {
                              setExcelError(`Row ${i + 1}: Excel bulk operations only support "Register" action. Update operations must be done individually through Update Mode.`);
                              return;
                            }

                            parentDataArray.push({
                              username: rowObject["Username"].trim(),
                              password: rowObject["Password"],
                              email: rowObject["Email"].trim().toLowerCase(),
                              phone: rowObject["Phone"].replace(/\D/g, ''),
                              firstName: rowObject["First Name"].trim(),
                              lastName: rowObject["Last Name"].trim(),
                              countryCode: rowObject["Country Code"],
                              schoolId: rowObject["School ID"],
                              action: action,
                            });
                          }

                          if (parentDataArray.length === 0) {
                            setExcelError("Excel file contains no valid data rows.");
                            return;
                          }

                          if (!checkExcelDuplicates(parentDataArray)) {
                            return;
                          }

                          setIsSubmitting(true);
                          const failedRegistrations = [];
                          let successCount = 0;

                          for (const parentData of parentDataArray) {
                            try {
                              const response = await fetch(`${API_BASE_URL}/parent/register`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  username: parentData.username,
                                  password: parentData.password,
                                  email: parentData.email,
                                  phone: parentData.phone,
                                  firstName: parentData.firstName,
                                  lastName: parentData.lastName,
                                  countryCode: parentData.countryCode,
                                  schoolId: parentData.schoolId,
                                }),
                              });

                              if (!response.ok) {
                                const errorData = await response.json();
                                failedRegistrations.push(
                                  `${parentData.username}: ${errorData.message || response.statusText}`
                                );
                              } else {
                                successCount++;
                              }
                            } catch {
                              failedRegistrations.push(`${parentData.username}: Network or unexpected error`);
                            }
                          }

                          setIsSubmitting(false);

                          if (failedRegistrations.length === 0) {
                            setAlertMessage(`${successCount} parents processed successfully`);
                            resetForm(false);
                            setExcelError(null);
                          } else {
                            const message = [
                              `${successCount} parents processed successfully`,
                              `Failed to process ${failedRegistrations.length} parents:`,
                              ...failedRegistrations,
                            ].join("\n");
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
                    ? "Update Parent"
                    : "Register Parent"}
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

export default ParentRegistrationPage;