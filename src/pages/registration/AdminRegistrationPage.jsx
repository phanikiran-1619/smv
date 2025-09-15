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
import { countryCodes } from "../../lib/countryCodes";
import Navbar from '../../components/Navbar';
import { Shield, Save, RotateCcw, Upload, FileDown } from 'lucide-react';
import * as XLSX from "xlsx";

const AdminRegistrationPage = () => {
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
    smAdminId: "",
    status: "true",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [admins, setAdmins] = useState([]);
  const [selectedAdminForUpdate, setSelectedAdminForUpdate] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    admins: false,
    adminDetails: false,
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
        await fetchAdmins();
      }
    };
    initializePage();
  }, [isUpdateMode]);

  // Fetch admins for update mode dropdown
  const fetchAdmins = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, admins: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmins(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, admins: false }));
    }
  };

  // Fetch individual admin details for auto-fill
  const fetchAdminDetails = async (smAdminId) => {
    try {
      setLoadingStates(prev => ({ ...prev, adminDetails: true }));
      const token = getToken();
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/admin/by-adminId?smAdminId=${smAdminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData({
          username: data.user?.username || "",
          password: "", // Don't populate password for security
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          countryCode: "IN", // Default as API doesn't provide this
          schoolId: data.schId || "",
          smAdminId: data.smAdminId || "",
          status: data.user?.status ? "true" : "false",
        });
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
      setAlertMessage("Failed to fetch admin details");
    } finally {
      setLoadingStates(prev => ({ ...prev, adminDetails: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username: At least 3 characters, alphanumeric only, max 20 characters (Required only in register mode)
    if (!isUpdateMode) {
      if (!formData.username || formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters long";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        newErrors.username = "Username must be alphanumeric";
      } else if (formData.username.length > 20) {
        newErrors.username = "Username must be 20 characters or less";
      }
    } else if (formData.username) {
      if (formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters long";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        newErrors.username = "Username must be alphanumeric";
      } else if (formData.username.length > 20) {
        newErrors.username = "Username must be 20 characters or less";
      }
    }

    // Password: Only validate in register mode (removed from update mode entirely)
    if (!isUpdateMode) {
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Password must contain at least one uppercase, one lowercase, and one number";
      } else if (formData.password.length > 20) {
        newErrors.password = "Password must be 20 characters or less";
      }
    }

    // Email: Valid email format, max 50 characters (Required only in register mode)
    if (!isUpdateMode) {
      if (!formData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      } else if (formData.email.length > 50) {
        newErrors.email = "Email must be 50 characters or less";
      }
    } else if (formData.email) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      } else if (formData.email.length > 50) {
        newErrors.email = "Email must be 50 characters or less";
      }
    }

    // Phone: 10-12 digits only (Required only in register mode)
    if (!isUpdateMode) {
      if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    } else if (formData.phone) {
      if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = "Phone number must be 10 digits";
      }
    }

    // First Name: Letters only, minimum 2 characters, max 20 characters (Required only in register mode)
    if (!isUpdateMode) {
      if (!formData.firstName || formData.firstName.length < 2) {
        newErrors.firstName = "First name must be at least 2 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain letters only";
      } else if (formData.firstName.length > 20) {
        newErrors.firstName = "First name must be 20 characters or less";
      }
    } else if (formData.firstName) {
      if (formData.firstName.length < 2) {
        newErrors.firstName = "First name must be at least 2 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name must contain letters only";
      } else if (formData.firstName.length > 20) {
        newErrors.firstName = "First name must be 20 characters or less";
      }
    }

    // Last Name: Letters only, minimum 2 characters, max 20 characters (Required only in register mode)
    if (!isUpdateMode) {
      if (!formData.lastName || formData.lastName.length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain letters only";
      } else if (formData.lastName.length > 20) {
        newErrors.lastName = "Last name must be 20 characters or less";
      }
    } else if (formData.lastName) {
      if (formData.lastName.length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters long";
      } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name must contain letters only";
      } else if (formData.lastName.length > 20) {
        newErrors.lastName = "Last name must be 20 characters or less";
      }
    }

    // Country Code: Optional in both modes
    // No validation needed for optional field

    // School ID: Must be exactly 8 characters, alphanumeric (Required only in register mode)
    if (!isUpdateMode) {
      if (!formData.schoolId) {
        newErrors.schoolId = "Please select a school";
      } else if (formData.schoolId.length !== 8) {
        newErrors.schoolId = "School ID must be exactly 8 characters";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.schoolId)) {
        newErrors.schoolId = "School ID must be alphanumeric";
      }
    } else if (formData.schoolId) {
      if (formData.schoolId.length !== 8) {
        newErrors.schoolId = "School ID must be exactly 8 characters";
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.schoolId)) {
        newErrors.schoolId = "School ID must be alphanumeric";
      }
    }

    // SM Admin ID: Required in both modes, alphanumeric, max 10 characters
    if (!formData.smAdminId) {
      newErrors.smAdminId = "SM Admin ID is required";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.smAdminId)) {
      newErrors.smAdminId = "SM Admin ID must be alphanumeric";
    } else if (formData.smAdminId.length > 10) {
      newErrors.smAdminId = "SM Admin ID must be 10 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value.trim(),
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
      username: "",
      password: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      countryCode: "IN",
      schoolId: "",
      smAdminId: "",
      status: "true",
    });
    setIsUpdateMode(newUpdateMode);
    setExcelError(null);
    setErrors({});
    setSelectedAdminForUpdate("");
  };

  const handleAdminSelection = async (smAdminId) => {
    setSelectedAdminForUpdate(smAdminId);
    if (smAdminId) {
      await fetchAdminDetails(smAdminId);
    }
  };

  const checkExistingAdmin = async (field, value) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/check?${field}=${value}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      const data = await response.json();
      if (data.exists) {
        setAlertMessage(`This ${field} is already in use`);
        return false;
      }
      return true;
    } catch {
      setAlertMessage(`Error checking ${field}`);
      return false;
    }
  };

  const checkExcelDuplicates = (adminDataArray) => {
    const seenUsernames = new Set();
    const seenEmails = new Set();
    const seenSmAdminIds = new Set();

    for (let i = 0; i < adminDataArray.length; i++) {
      const admin = adminDataArray[i];
      if (seenUsernames.has(admin.username)) {
        setExcelError(`Row ${i + 2}: Duplicate username: ${admin.username}`);
        return false;
      }
      if (seenEmails.has(admin.email)) {
        setExcelError(`Row ${i + 2}: Duplicate email: ${admin.email}`);
        return false;
      }
      if (admin.smAdminId && seenSmAdminIds.has(admin.smAdminId)) {
        setExcelError(`Row ${i + 2}: Duplicate SM Admin ID: ${admin.smAdminId}`);
        return false;
      }
      seenUsernames.add(admin.username);
      seenEmails.add(admin.email);
      if (admin.smAdminId) seenSmAdminIds.add(admin.smAdminId);
    }
    return true;
  };

  const downloadExcelTemplate = async () => {
    try {
      const templateData = [
        {
          'Username': 'rameshgowda2',
          'Password': 'Password123',
          'Email': 'ramesh.gowda@gmail.com',
          'Phone': '6542873780',
          'First Name': 'Ramesh',
          'Last Name': 'Gowda',
          'Country Code': 'IN',
          'School ID': 'SC1F0001',
          'SM Admin ID': 'AD1F0001',
          'Action': 'Register'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Template");
      XLSX.writeFile(workbook, `admin_registration_template.xlsx`);
      
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
  if (loadingStates.adminDetails) {
    return (
      <div className={themeClasses.background}>
        <Navbar showBackButton={true} />
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className={`text-4xl font-bold ${themeClasses.title} mb-2 flex items-center justify-center`}>
                <Shield className="w-10 h-10 mr-3" />
                Enhanced Admin Registration
              </h1>
              <p className={themeClasses.subtitle}>Loading admin data...</p>
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
              <Shield className="w-10 h-10 mr-3" />
              Enhanced Admin Registration
            </h1>
            <p className={themeClasses.subtitle}>Advanced admin registration with comprehensive validation and Excel support</p>
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
            {/* Admin Selection Dropdown for Update Mode */}
            {isUpdateMode && (
              <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-300'} border rounded-xl`}>
                <Label className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 block`}>
                  Select Admin to Update
                </Label>
                {loadingStates.admins ? (
                  <SkeletonLoader />
                ) : (
                  <SearchableSelect
                    options={admins.map(admin => ({
                      value: admin.smAdminId,
                      label: `${admin.firstName} ${admin.lastName} (${admin.smAdminId}) - ${admin.user?.username}`
                    }))}
                    value={selectedAdminForUpdate}
                    onValueChange={handleAdminSelection}
                    placeholder="Search and select an admin..."
                    searchPlaceholder="Type to search admins..."
                    className={themeClasses.input}
                  />
                )}
                <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} text-sm mt-2`}>
                  Select an admin from the dropdown to auto-fill the form with current data
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

                // Validate username and email for registration
                if (!isUpdateMode) {
                  if (!(await checkExistingAdmin("username", formData.username))) {
                    setIsSubmitting(false);
                    return;
                  }
                  if (!(await checkExistingAdmin("email", formData.email))) {
                    setIsSubmitting(false);
                    return;
                  }
                }

                try {
                  if (isUpdateMode) {
                    const updateBody = {};
                    if (formData.username) updateBody.username = formData.username;
                    if (formData.email) updateBody.email = formData.email.toLowerCase();
                    if (formData.phone) updateBody.phone = formData.phone;
                    if (formData.firstName) updateBody.firstName = formData.firstName;
                    if (formData.lastName) updateBody.lastName = formData.lastName;
                    if (formData.countryCode) updateBody.countryCode = formData.countryCode;
                    if (formData.schoolId) updateBody.schoolId = formData.schoolId;

                    const response = await fetch(
                      `${API_BASE_URL}/admin/update/${formData.smAdminId}`,
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
                    if (!response.ok) {
                      throw new Error(responseText || "Update failed");
                    }

                    setAlertMessage(responseText);
                    resetForm();
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
                      smAdminId: formData.smAdminId,
                    };

                    const response = await fetch(`${API_BASE_URL}/admin/register`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                      },
                      body: JSON.stringify(registerBody),
                    });

                    const responseData = await response.json();
                    if (!response.ok) {
                      if (responseData.message.includes("Query did not return a unique result")) {
                        throw new Error("Registration failed: Username or Email already exists. Please use unique values.");
                      }
                      throw new Error(responseData.message || "Registration failed");
                    }

                    setAlertMessage(`Registration successful: ${JSON.stringify(responseData)}`);
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
                Admin {isUpdateMode ? "Update" : "Registration"}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className={themeClasses.label}>
                    Username: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter Username"
                    value={formData.username}
                    onChange={handleChange}
                    maxLength={20}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.username ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>

                {/* Password field - only show in register mode */}
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
                      maxLength={20}
                      required={!isUpdateMode}
                      className={`${themeClasses.input} ${errors.password ? "border-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className={themeClasses.label}>
                    Email: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    maxLength={50}
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.email ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className={themeClasses.label}>
                    Phone: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    pattern="\d*"
                    required={!isUpdateMode}
                    className={`${themeClasses.input} ${errors.phone ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
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
                  <Label htmlFor="countryCode" className={themeClasses.label}>
                    Country Code: {!isUpdateMode && <span className="text-red-400">*</span>}
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

                <div className={`space-y-2 ${errors.schoolId ? "border border-red-500 rounded p-2" : ""}`}>
                  <Label className={themeClasses.label}>
                    School: {!isUpdateMode && <span className="text-red-400">*</span>}
                  </Label>
                  <SchoolSelect
                    value={formData.schoolId}
                    onChange={(value) => handleSelectChange('schoolId', value)}
                    error={!!errors.schoolId}
                  />
                  {errors.schoolId && <p className="text-red-500 text-sm">{errors.schoolId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smAdminId" className={themeClasses.label}>
                    SM Admin ID: <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="smAdminId"
                    name="smAdminId"
                    placeholder="Enter SM Admin ID"
                    value={formData.smAdminId}
                    onChange={handleChange}
                    maxLength={10}
                    required
                    disabled={isUpdateMode && formData.smAdminId}
                    className={`${themeClasses.input} ${errors.smAdminId ? "border-red-500" : ""} ${isUpdateMode && formData.smAdminId ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  {errors.smAdminId && <p className="text-red-500 text-sm">{errors.smAdminId}</p>}
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
                            "Username", "Password", "Email", "Phone", "First Name", "Last Name", 
                            "Country Code", "School ID", "SM Admin ID"
                          ];
                          const missingRequiredHeaders = requiredHeaders.filter(
                            (header) => !headers.includes(header)
                          );
                          if (missingRequiredHeaders.length > 0) {
                            setExcelError(`Missing required headers: ${missingRequiredHeaders.join(", ")}`);
                            return;
                          }

                          const adminDataArray = [];
                          for (let i = 1; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (!row || row.length === 0) continue;

                            const rowObject = headers.reduce((obj, header, index) => {
                              obj[header] = String(row[index] ?? "");
                              return obj;
                            }, {});

                            // Validation for required fields
                            const requiredFields = ["Username", "Password", "Email", "Phone", "First Name", "Last Name", "Country Code", "School ID", "SM Admin ID"];
                            const missingFields = requiredFields.filter(field => !rowObject[field]);
                            if (missingFields.length > 0) {
                              setExcelError(`Row ${i + 1}: Missing required fields: ${missingFields.join(", ")}`);
                              return;
                            }

                            // Additional validations...
                            if (!countryCodes.some((code) => code.id === rowObject["Country Code"])) {
                              setExcelError(`Row ${i + 1}: Invalid Country Code: ${rowObject["Country Code"]}`);
                              return;
                            }

                            const action = rowObject["Action"] ? rowObject["Action"].toLowerCase() : "register";
                            if (action !== "register" && action !== "update") {
                              setExcelError(`Row ${i + 1}: Invalid Action value. Must be "Register" or "Update"`);
                              return;
                            }

                            adminDataArray.push({
                              username: rowObject["Username"].trim(),
                              password: rowObject["Password"],
                              email: rowObject["Email"].trim().toLowerCase(),
                              phone: rowObject["Phone"].trim(),
                              firstName: rowObject["First Name"].trim(),
                              lastName: rowObject["Last Name"].trim(),
                              countryCode: rowObject["Country Code"],
                              schoolId: rowObject["School ID"],
                              smAdminId: rowObject["SM Admin ID"]?.trim() || "",
                              action: action,
                            });
                          }

                          if (adminDataArray.length === 0) {
                            setExcelError("Excel file contains no valid data rows.");
                            return;
                          }

                          if (!checkExcelDuplicates(adminDataArray)) {
                            return;
                          }

                          setIsSubmitting(true);
                          const failedRegistrations = [];
                          let successCount = 0;

                          for (const adminData of adminDataArray) {
                            try {
                              const isUpdate = adminData.action === "update";
                              const url = isUpdate
                                ? `${API_BASE_URL}/admin/update/${adminData.smAdminId}`
                                : `${API_BASE_URL}/admin/register`;
                              const method = isUpdate ? "PUT" : "POST";

                              if (isUpdate && !adminData.smAdminId) {
                                failedRegistrations.push(`${adminData.username}: SM Admin ID required for update`);
                                continue;
                              }

                              if (!isUpdate) {
                                if (!(await checkExistingAdmin("username", adminData.username))) {
                                  failedRegistrations.push(`${adminData.username}: Username already exists`);
                                  continue;
                                }
                                if (!(await checkExistingAdmin("email", adminData.email))) {
                                  failedRegistrations.push(`${adminData.username}: Email already exists`);
                                  continue;
                                }
                              }

                              const requestBody = {
                                username: adminData.username,
                                password: adminData.password,
                                email: adminData.email.toLowerCase(),
                                phone: adminData.phone,
                                firstName: adminData.firstName,
                                lastName: adminData.lastName,
                                countryCode: adminData.countryCode,
                                schoolId: adminData.schoolId,
                                smAdminId: adminData.smAdminId,
                              };

                              const response = await fetch(url, {
                                method,
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${token}`,
                                },
                                body: JSON.stringify(requestBody),
                              });

                              if (isUpdate) {
                                const responseText = await response.text();
                                if (!response.ok) {
                                  failedRegistrations.push(`${adminData.username}: ${responseText || "Update failed"}`);
                                } else {
                                  successCount++;
                                }
                              } else {
                                const responseData = await response.json();
                                if (!response.ok) {
                                  if (responseData.message.includes("Query did not return a unique result")) {
                                    failedRegistrations.push(`${adminData.username}: Username or Email already exists`);
                                  } else {
                                    failedRegistrations.push(`${adminData.username}: ${responseData.message || "Registration failed"}`);
                                  }
                                } else {
                                  successCount++;
                                }
                              }
                            } catch {
                              failedRegistrations.push(`${adminData.username}: Network or unexpected error`);
                            }
                          }

                          setIsSubmitting(false);

                          if (failedRegistrations.length === 0) {
                            setAlertMessage(`${successCount} admins processed successfully`);
                            resetForm();
                            setExcelError(null);
                          } else {
                            const message = [`${successCount} admins processed successfully`, `Failed to process ${failedRegistrations.length} admins:`, ...failedRegistrations].join("\
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
                    ? "Update Admin"
                    : "Register Admin"}
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

export default AdminRegistrationPage;