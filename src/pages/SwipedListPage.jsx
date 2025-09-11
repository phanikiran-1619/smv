import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { MapPin, BarChart3, Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SwipedListPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Super Admin' };
  
  const [schools, setSchools] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [resultFilter, setResultFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [swipeRecords, setSwipeRecords] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sortColumn, setSortColumn] = useState("studentId");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAnalyticsPopup, setShowAnalyticsPopup] = useState(false);
  const [searchSchool, setSearchSchool] = useState("");
  const [searchRoute, setSearchRoute] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [schoolIdError, setSchoolIdError] = useState(false);
  const [routeIdError, setRouteIdError] = useState(false);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Get authentication token (either superadmintoken or admintoken)
  const getAuthToken = () => {
    return localStorage.getItem("superadmintoken") || localStorage.getItem("admintoken") || "YOUR_AUTH_TOKEN";
  };

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setSchoolsLoading(true);
        setError(null);
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/school`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!Array.isArray(response.data)) throw new Error('Invalid schools data format');
        setSchools(response.data);
      } catch (error) {
        console.error('Schools fetch error:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load schools');
      } finally {
        setSchoolsLoading(false);
      }
    };
    fetchSchools();
  }, [API_BASE_URL]);

  useEffect(() => {
    // Reset all dropdowns and date inputs when schoolId changes
    setRouteId("");
    setStudentId("");
    setSessionFilter("all");
    setResultFilter("all");
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setRoutes([]);
    setStudents([]);
    setSwipeRecords([]);
    setAnalyticsData(null);
    setRouteIdError(false);
    setSearchRoute("");
    setSearchStudent("");
    setCurrentPage(1);

    const fetchRoutes = async () => {
      if (!schoolId) {
        setRoutes([]);
        return;
      }
      try {
        const token = getAuthToken();
        const response = await axios.get(`${API_BASE_URL}/route/school/${schoolId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!Array.isArray(response.data)) throw new Error('Invalid routes data format');
        const filteredRoutes = response.data.map((route) => ({
          id: route.id,
          smRouteId: route.smRouteId,
          routeName: route.routeName
        }));
        setRoutes(filteredRoutes);
      } catch (error) {
        console.error('Routes fetch error:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load routes');
        setRoutes([]);
      }
    };
    fetchRoutes();
  }, [schoolId, API_BASE_URL]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!routeId) {
        setStudents([]);
        return;
      }
      try {
        const token = getAuthToken();
        const selectedRoute = routes.find(route => route.smRouteId === routeId);
        if (!selectedRoute) throw new Error('Route not found');
        const response = await axios.get(`${API_BASE_URL}/student/route/${selectedRoute.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!Array.isArray(response.data)) throw new Error('Invalid students data format');
        const filteredStudents = response.data.map((student) => ({
          id: student.id,
          smStudentId: student.smStudentId,
          firstName: student.firstName
        }));
        setStudents(filteredStudents);
      } catch (error) {
        console.error('Students fetch error:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load students');
        setStudents([]);
      }
    };
    fetchStudents();
  }, [routeId, routes, API_BASE_URL]);

  useEffect(() => {
    setSwipeRecords([]);
    setAnalyticsData(null);
    setError(null);
    setCurrentPage(1);
  }, [routeId, studentId]);

  const getResultLabel = (reserv) => {
    const code = reserv.substring(0, 2).toUpperCase();
    if (code === "00") return "Matched";
    if (code === "AA") return "Duplicate";
    if (["01", "02", "03", "04", "05", "06", "07"].includes(code)) return "Mismatched";
    return reserv;
  };

  const fetchSwipeRecords = async () => {
    if (!schoolId) {
      setSchoolIdError(true);
      setError("Please select a School ID");
      return;
    }
    if (!routeId) {
      setRouteIdError(true);
      setError("Please select a Route ID");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both Start and End dates");
      return;
    }
    setSchoolIdError(false);
    setRouteIdError(false);
    setLoading(true);
    setError(null);
    setSwipeRecords([]);
    setAnalyticsData(null);
    setShowAnalytics(false);
    setCurrentPage(1);

    try {
      const token = getAuthToken();
      const params = {
        schoolId: schoolId,
        startDate: startDate,
        endDate: endDate,
        routeId: routeId,
        studentId: studentId || "",
      };
      
      if (resultFilter !== "all") {
        params.result = resultFilter;
      }

      let apiUrl = "";
      if (sessionFilter === "morning") {
        apiUrl = `${API_BASE_URL}/swipe-students/morning-swipes`;
      } else if (sessionFilter === "evening") {
        apiUrl = `${API_BASE_URL}/swipe-students/evening-swipes`;
      } else {
        apiUrl = `${API_BASE_URL}/swipe-students/ids-by-date`;
      }

      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 204 || !response.data) {
        setSwipeRecords([]);
        setError("No records found for the selected filters");
        return;
      }

      let data = response.data;
      if (data.swipes && Array.isArray(data.swipes)) {
        setSwipeRecords(data.swipes);
        const matchedCount = data.swipes.filter((record) => record.reserv.substring(0, 2) === "00").length;
        const mismatchedCount = data.swipes.filter((record) => 
          ["01", "02", "03", "04", "05", "06", "07"].includes(record.reserv.substring(0, 2))).length;
        const duplicateCount = data.swipes.filter((record) => record.reserv.substring(0, 2) === "AA").length;
        setAnalyticsData({
          totalSwipes: data.totalSwipes || data.swipes.length,
          mismatchedCount: mismatchedCount,
          dateRange: data.dateRange || `${startDate} to ${endDate}`,
          duplicateCount: duplicateCount,
          matchedCount: matchedCount,
          swipeType: data.swipeType,
          timeRange: data.timeRange
        });
      } else if (Array.isArray(data)) {
        setSwipeRecords(data);
        const matchedCount = data.filter((record) => record.reserv.substring(0, 2) === "00").length;
        const mismatchedCount = data.filter((record) => 
          ["01", "02", "03", "04", "05", "06", "07"].includes(record.reserv.substring(0, 2))).length;
        const duplicateCount = data.filter((record) => record.reserv.substring(0, 2) === "AA").length;
        setAnalyticsData({
          totalSwipes: data.length,
          mismatchedCount: mismatchedCount,
          dateRange: `${startDate} to ${endDate}`,
          duplicateCount: duplicateCount,
          matchedCount: matchedCount
        });
      } else {
        throw new Error("Invalid swipe records data format");
      }

      if (data.length === 0 || (data.swipes && data.swipes.length === 0)) {
        setError("No records found for the selected filters");
      } else if (analyticsData) {
        setShowAnalyticsPopup(true);
      }
    } catch (error) {
      console.error("Error fetching swipe records:", error);
      setError(error.response?.data?.message || error.message || "Failed to load swipe records");
      setSwipeRecords([]);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (latitude, longitude) => {
    if (latitude && longitude) {
      setSelectedLocation({ lat: latitude, lng: longitude });
    }
  };

  const exportToExcel = async () => {
    try {
      // Dynamic import of xlsx
      const XLSX = await import('xlsx');
      const worksheetData = filteredSwipeRecords.map(record => ({
        "Student ID": record.studentId,
        "School ID": record.schoolId,
        "Route ID": record.routeId,
        "Source": record.source || '',
        "Route Point Name": record.routePointName || record.routePointname || '',
        "Timestamp": record.timestamp,
        "Result": getResultLabel(record.reserv),
        "Latitude": record.latitude || '',
        "Longitude": record.longitude || ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Swipe Records");
      XLSX.writeFile(workbook, `Student_Swipe_Records_${startDate}_to_${endDate}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data to Excel');
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter swipe records based on resultFilter
  const filteredSwipeRecords = swipeRecords.filter(record => {
    if (resultFilter === "all") return true;
    if (resultFilter === "matched") return record.reserv.substring(0, 2) === "00";
    if (resultFilter === "mismatched") return ["01", "02", "03", "04", "05", "06", "07"].includes(record.reserv.substring(0, 2));
    if (resultFilter === "duplicate") return record.reserv.substring(0, 2) === "AA";
    return true;
  });

  const sortedSwipeRecords = [...filteredSwipeRecords].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedSwipeRecords.length / itemsPerPage);
  const paginatedRecords = sortedSwipeRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAnalyticsBoxClick = (filter) => {
    setResultFilter(filter);
    setShowAnalytics(true);
    setCurrentPage(1);
  };

  const renderAnalytics = () => {
    if (!analyticsData) return null;

    const { totalSwipes, mismatchedCount, matchedCount, duplicateCount } = analyticsData;
    
    return (
      <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-xl border-4 border-yellow-500">
        <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Swipe Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-700 p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4 text-center">Swipe Results Distribution</h4>
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalSwipes}</div>
                  <div className="text-sm text-gray-300">Total Swipes</div>
                </div>
              </div>
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="20"
                  strokeDasharray={`${(matchedCount / totalSwipes) * 251.2} 251.2`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                  strokeDasharray={`${(mismatchedCount / totalSwipes) * 251.2} 251.2`}
                  strokeDashoffset={-((matchedCount / totalSwipes) * 251.2)}
                />
                {duplicateCount > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="20"
                    strokeDasharray={`${(duplicateCount / totalSwipes) * 251.2} 251.2`}
                    strokeDashoffset={-(((matchedCount + mismatchedCount) / totalSwipes) * 251.2)}
                  />
                )}
              </svg>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-300">Matched: {matchedCount}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-gray-300">Mismatched: {mismatchedCount}</span>
              </div>
              {duplicateCount > 0 && (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-300">Duplicates: {duplicateCount}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-xl">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4 text-center">Swipe Results Comparison</h4>
            <div className="h-64 flex items-end justify-center space-x-4">
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-green-500 rounded-t transition-all" 
                  style={{ height: `${(matchedCount / totalSwipes) * 200}px` }}
                ></div>
                <div className="text-xs text-gray-300 mt-2">Matched</div>
                <div className="text-xs text-gray-300">{matchedCount}</div>
              </div>
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 bg-red-500 rounded-t transition-all" 
                  style={{ height: `${(mismatchedCount / totalSwipes) * 200}px` }}
                ></div>
                <div className="text-xs text-gray-300 mt-2">Mismatched</div>
                <div className="text-xs text-gray-300">{mismatchedCount}</div>
              </div>
              {duplicateCount > 0 && (
                <div className="flex flex-col items-center">
                  <div 
                    className="w-12 bg-yellow-500 rounded-t transition-all" 
                    style={{ height: `${(duplicateCount / totalSwipes) * 200}px` }}
                  ></div>
                  <div className="text-xs text-gray-300 mt-2">Duplicates</div>
                  <div className="text-xs text-gray-300">{duplicateCount}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="bg-gray-900 p-4 rounded-xl text-center cursor-pointer hover:bg-gray-700 transition-all"
            onClick={() => handleAnalyticsBoxClick("all")}
          >
            <div className="text-2xl font-bold text-yellow-400">{totalSwipes}</div>
            <div className="text-sm text-gray-300">Total Swipes</div>
          </div>
          <div 
            className="bg-gray-900 p-4 rounded-xl text-center cursor-pointer hover:bg-gray-700 transition-all"
            onClick={() => handleAnalyticsBoxClick("matched")}
          >
            <div className="text-2xl font-bold text-green-400">{matchedCount}</div>
            <div className="text-sm text-gray-300">Matched</div>
          </div>
          <div 
            className="bg-gray-900 p-4 rounded-xl text-center cursor-pointer hover:bg-gray-700 transition-all"
            onClick={() => handleAnalyticsBoxClick("mismatched")}
          >
            <div className="text-2xl font-bold text-red-400">{mismatchedCount}</div>
            <div className="text-sm text-gray-300">Mismatched</div>
          </div>
          <div 
            className="bg-gray-900 p-4 rounded-xl text-center cursor-pointer hover:bg-gray-700 transition-all"
            onClick={() => handleAnalyticsBoxClick("duplicate")}
          >
            <div className="text-2xl font-bold text-yellow-400">{duplicateCount}</div>
            <div className="text-sm text-gray-300">Duplicates</div>
          </div>
        </div>

        {analyticsData.swipeType && (
          <div className="mt-4 text-center text-gray-300">
            Session: {analyticsData.swipeType.toUpperCase()} {analyticsData.timeRange && `(${analyticsData.timeRange})`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gray-800 p-8 rounded-2xl shadow-xl border-4 border-yellow-500">
            <div className="flex items-center space-x-3 mb-6">
              <h1 className="text-3xl font-bold text-yellow-400">Student Swiped List</h1>
            </div>
            <p className="text-gray-300 mb-6">Easily view and manage student swipe records with pagination.</p>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500 text-red-300 rounded-xl">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-sm text-red-400 hover:text-red-300">
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">School ID *</label>
                <Select 
                  onValueChange={(value) => {
                    setSchoolId(value);
                    setSchoolIdError(false);
                  }} 
                  disabled={schoolsLoading} 
                  value={schoolId}
                >
                  <SelectTrigger className={`border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full ${schoolIdError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={schoolsLoading ? "Loading schools..." : "Select School ID"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <Input
                      type="text"
                      placeholder="Search Schools..."
                      value={searchSchool}
                      onChange={(e) => setSearchSchool(e.target.value)}
                      className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 mb-2 w-full px-2 py-1"
                    />
                    {schools
                      .filter(school => 
                        school.name.toLowerCase().includes(searchSchool.toLowerCase()) || 
                        school.id.toLowerCase().includes(searchSchool.toLowerCase())
                      )
                      .map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name} ({school.id})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Route ID *</label>
                <Select 
                  onValueChange={(value) => {
                    setRouteId(value);
                    setRouteIdError(false);
                  }} 
                  disabled={!schoolId || routes.length === 0} 
                  value={routeId}
                >
                  <SelectTrigger className={`border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full ${routeIdError ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={routes.length === 0 ? "No routes available" : "Select Route ID"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <Input
                      type="text"
                      placeholder="Search Routes..."
                      value={searchRoute}
                      onChange={(e) => setSearchRoute(e.target.value)}
                      className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 mb-2 w-full px-2 py-1"
                    />
                    {routes
                      .filter(route => 
                        route.smRouteId.toLowerCase().includes(searchRoute.toLowerCase()) || 
                        route.routeName.toLowerCase().includes(searchRoute.toLowerCase())
                      )
                      .map((route) => (
                        <SelectItem key={route.id} value={route.smRouteId}>
                          {route.smRouteId} - {route.routeName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Student ID</label>
                <Select onValueChange={setStudentId} disabled={!routeId || students.length === 0} value={studentId}>
                  <SelectTrigger className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full">
                    <SelectValue placeholder={students.length === 0 ? "No students available" : "Select Student ID"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <Input
                      type="text"
                      placeholder="Search Students..."
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 mb-2 w-full px-2 py-1"
                    />
                    {students
                      .filter(student => 
                        student.smStudentId.toLowerCase().includes(searchStudent.toLowerCase()) || 
                        student.firstName.toLowerCase().includes(searchStudent.toLowerCase())
                      )
                      .map((student) => (
                        <SelectItem key={student.id} value={student.smStudentId}>
                          {student.smStudentId} - {student.firstName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Session</label>
                <Select onValueChange={setSessionFilter} value={sessionFilter}>
                  <SelectTrigger className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="morning">Pickup session</SelectItem>
                    <SelectItem value="evening">Drop session</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Result</label>
                <Select onValueChange={setResultFilter} value={resultFilter}>
                  <SelectTrigger className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full">
                    <SelectValue placeholder="Select Result" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="mismatched">Mismatched</SelectItem>
                    <SelectItem value="duplicate">Duplicate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchSwipeRecords}
                  disabled={loading}
                  className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-xl hover:bg-yellow-600 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : "Submit"}
                </Button>
              </div>
            </div>
          </Card>

          {swipeRecords.length > 0 && analyticsData && (
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-yellow-400">Swipe Records ({sortedSwipeRecords.length} total)</h3>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-600 transition-all flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-green-600 transition-all"
                  >
                    Export to Excel
                  </Button>
                </div>
              </div>

              {showAnalytics && renderAnalytics()}

              {/* Pagination Controls */}
              <div className="bg-gray-800 p-4 rounded-2xl shadow-xl border-4 border-yellow-500 mt-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300">Items per page:</span>
                    <Select onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }} value={itemsPerPage.toString()}>
                      <SelectTrigger className="w-20 border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedSwipeRecords.length)} of {sortedSwipeRecords.length} results
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={currentPage === pageNum 
                              ? "bg-yellow-500 text-black" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border-4 border-yellow-500 mt-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-700 text-gray-200">
                      <TableHead onClick={() => handleSort("studentId")} className="cursor-pointer">
                        Student ID {sortColumn === "studentId" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("schoolId")} className="cursor-pointer">
                        School ID {sortColumn === "schoolId" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("routeId")} className="cursor-pointer">
                        Route ID {sortColumn === "routeId" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("source")} className="cursor-pointer">
                        Source {sortColumn === "source" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("routePointName")} className="cursor-pointer">
                        Route Point Name {sortColumn === "routePointName" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("timestamp")} className="cursor-pointer">
                        Timestamp {sortColumn === "timestamp" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead onClick={() => handleSort("reserv")} className="cursor-pointer">
                        Result {sortColumn === "reserv" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record, index) => (
                      <TableRow key={index} className="border-b border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
                        <TableCell>{record.studentId}</TableCell>
                        <TableCell>{record.schoolId}</TableCell>
                        <TableCell>{record.routeId}</TableCell>
                        <TableCell>{record.source || 'N/A'}</TableCell>
                        <TableCell>
                          {record.routePointName || record.routePointname || 'N/A'}
                        </TableCell>
                        <TableCell>{record.timestamp}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getResultLabel(record.reserv) === 'Matched' ? 'bg-green-100 text-green-800' :
                            getResultLabel(record.reserv) === 'Mismatched' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getResultLabel(record.reserv)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {record.latitude && record.longitude ? (
                            <MapPin 
                              onClick={() => handleLocationClick(record.latitude, record.longitude)}
                              className="w-6 h-6 text-yellow-400 hover:text-yellow-300 cursor-pointer transition-colors"
                              title={`View location: ${record.latitude}, ${record.longitude}`}
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">No location</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {!loading && swipeRecords.length === 0 && analyticsData && (
            <div className="text-center mt-12">
              <p className="text-gray-400 text-xl font-semibold bg-gray-800 p-4 rounded-xl border-2 border-yellow-500 inline-block">
                No records found
              </p>
            </div>
          )}

          {showAnalyticsPopup && analyticsData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border-4 border-yellow-500 max-w-md w-full mx-4 text-center">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Analytics Available!</h3>
                <p className="text-gray-300 mb-4">Data analytics for {analyticsData.totalSwipes} swipes is ready. Click Show Analytics to view detailed charts.</p>
                <Button
                  onClick={() => {
                    setShowAnalytics(true);
                    setShowAnalyticsPopup(false);
                  }}
                  className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-blue-600 transition-all mr-2"
                >
                  Show Analytics
                </Button>
                <Button
                  onClick={() => setShowAnalyticsPopup(false)}
                  className="bg-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-600 transition-all"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Google Maps Modal */}
        {selectedLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-4 sm:p-6 border-4 border-yellow-500">
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-yellow-400 hover:text-yellow-300 transition-colors z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h3 className="text-lg sm:text-2xl font-bold text-yellow-400 mb-3 sm:mb-4 text-center pr-8">Student Location</h3>
              <div className="bg-gray-700 p-2 rounded-lg mb-3 sm:mb-4 text-center">
                <p className="text-gray-300 text-xs sm:text-sm">
                  Coordinates: <span className="text-green-400">{selectedLocation.lat}</span>, <span className="text-blue-400">{selectedLocation.lng}</span>
                </p>
              </div>
              {GOOGLE_MAPS_API_KEY ? (
                <iframe
                  width="100%"
                  height="300"
                  className="sm:h-80"
                  style={{ border: 0, borderRadius: '0.75rem' }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${selectedLocation.lat},${selectedLocation.lng}&zoom=15&maptype=roadmap`}
                  title="Student Location Map"
                ></iframe>
              ) : (
                <div className="bg-gray-700 p-4 rounded-lg text-center h-64 sm:h-80 flex flex-col justify-center">
                  <p className="text-red-400 mb-2">Google Maps API key not configured</p>
                  <p className="text-gray-300 text-sm mb-3">Location: {selectedLocation.lat}, {selectedLocation.lng}</p>
                  <a
                    href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mx-auto"
                  >
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipedListPage;