import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users, Download, Search, Filter, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const AllUsersPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Admin' };
  
  // State management
  const [selectedOption, setSelectedOption] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [adminSchoolId, setAdminSchoolId] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Handle big data with pagination
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem("admintoken") || "YOUR_AUTH_TOKEN";
  };

  // Get admin school ID from localStorage
  useEffect(() => {
    const storedSchoolId = localStorage.getItem("adminSchoolId") || "ADMIN_SCHOOL_001";
    setAdminSchoolId(storedSchoolId);
  }, []);

  const fetchData = async () => {
    if (!selectedOption) {
      setError("Please select a data type");
      return;
    }
    setLoading(true);
    setError(null);
    setData([]);
    setCurrentPage(1);

    try {
      const token = getAuthToken();
      let apiUrl = "";
      
      switch (selectedOption) {
        case "route":
          apiUrl = `${API_BASE_URL}/route/school/${adminSchoolId}`;
          break;
        case "student":
          apiUrl = `${API_BASE_URL}/student/school?schoolId=${adminSchoolId}`;
          break;
        case "driver":
          apiUrl = `${API_BASE_URL}/driver/school/${adminSchoolId}`;
          break;
        case "attender":
          apiUrl = `${API_BASE_URL}/attender/school/${adminSchoolId}`;
          break;
        default:
          setError("Invalid option selected");
          return;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      setData(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.response?.data?.message || error.message || "Failed to load data");
    } finally {
      setLoading(false);
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

  const getNestedValue = (obj, path) => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (typeof current !== 'object' || current === null) {
        return null;
      }
      current = current[key];
    }
    return current;
  };

  // Memoized sorting and filtering for big data performance
  const processedData = useMemo(() => {
    let filtered = data.filter(item => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      
      switch (selectedOption) {
        case "route":
          return (
            item.routeName?.toLowerCase().includes(query) ||
            item.smRouteId?.toLowerCase().includes(query) ||
            item.title?.toLowerCase().includes(query) ||
            (item.cityCode?.toLowerCase().includes(query) || false) ||
            item.routePoints?.some(rp => 
              rp.routePointName?.toLowerCase().includes(query) ||
              rp.smRoutePointId?.toLowerCase().includes(query) ||
              rp.title?.toLowerCase().includes(query)
            )
          );
        case "student":
          return (
            item.firstName?.toLowerCase().includes(query) ||
            item.lastName?.toLowerCase().includes(query) ||
            item.parentUsername?.toLowerCase().includes(query) ||
            item.smParentId?.toLowerCase().includes(query) ||
            (item.parentFirstName?.toLowerCase().includes(query) || false) ||
            (item.parentLastName?.toLowerCase().includes(query) || false) ||
            item.smStudentId?.toLowerCase().includes(query) ||
            item.routeName?.toLowerCase().includes(query) ||
            item.schoolName?.toLowerCase().includes(query)
          );
        case "driver":
          return (
            item.firstName?.toLowerCase().includes(query) ||
            item.lastName?.toLowerCase().includes(query) ||
            item.smDriverId?.toLowerCase().includes(query) ||
            item.user?.phone?.toLowerCase().includes(query) ||
            item.user?.username?.toLowerCase().includes(query) ||
            item.routeName?.toLowerCase().includes(query) ||
            item.schoolName?.toLowerCase().includes(query) ||
            item.user?.status?.toLowerCase().includes(query)
          );
        case "attender":
          return (
            item.firstName?.toLowerCase().includes(query) ||
            item.lastName?.toLowerCase().includes(query) ||
            item.smAttenderId?.toLowerCase().includes(query) ||
            item.phone?.toLowerCase().includes(query) ||
            item.user?.username?.toLowerCase().includes(query) ||
            item.routeName?.toLowerCase().includes(query) ||
            item.schoolName?.toLowerCase().includes(query) ||
            item.user?.status?.toLowerCase().includes(query)
          );
        default:
          return true;
      }
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = getNestedValue(a, sortColumn);
      let bValue = getNestedValue(b, sortColumn);
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" 
          ? aValue - bValue 
          : bValue - aValue;
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === "asc" 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      } else {
        return sortDirection === "asc" 
          ? String(aValue).localeCompare(String(bValue)) 
          : String(bValue).localeCompare(String(aValue));
      }
    });

    return filtered;
  }, [data, searchQuery, selectedOption, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const downloadExcel = async () => {
    if (processedData.length === 0) return;
    
    try {
      const XLSX = await import('xlsx');
      let excelData = [];
      
      switch (selectedOption) {
        case "route":
          excelData = processedData.map(route => ({
            "Route ID": route.smRouteId,
            "Route Name": route.routeName,
            "Title": route.title,
            "Status": route.status ? "Active" : "Inactive",
            "City Code": route.cityCode,
            "Route Points": route.routePoints?.map(rp => 
              `${rp.routePointName} (${rp.latitude}, ${rp.longitude}) - ${rp.smRoutePointId}`
            ).join("; ") || ""
          }));
          break;
        case "student":
          excelData = processedData.map(student => ({
            "Student ID": student.smStudentId,
            "First Name": student.firstName,
            "Last Name": student.lastName,
            "parentUsername": student.parentUsername,
            "SM Parent ID": student.smParentId,
            "Parent First Name": student.parentFirstName || "N/A",
            "Parent Last Name": student.parentLastName || "N/A",
            "Route Name": student.routeName,
            "School Name": student.schoolName
          }));
          break;
        case "driver":
          excelData = processedData.map(driver => ({
            "Driver ID": driver.smDriverId,
            "First Name": driver.firstName,
            "Last Name": driver.lastName,
            "Username": driver.user?.username,
            "Phone": driver.user?.phone,
            "Route Name": driver.routeName || "N/A",
            "School Name": driver.schoolName || "N/A",
            "Status": driver.user?.status
          }));
          break;
        case "attender":
          excelData = processedData.map(attender => ({
            "Attender ID": attender.smAttenderId,
            "First Name": attender.firstName,
            "Last Name": attender.lastName,
            "Username": attender.user?.username,
            "Phone": attender.phone,
            "Route Name": attender.routeName || "N/A",
            "School Name": attender.schoolName || "N/A",
            "Status": attender.user?.status
          }));
          break;
      }
      
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${selectedOption}_data_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data to Excel');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with School ID */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center">
                <Users className="w-10 h-10 mr-3" />
                All Users Management
              </h1>
              <p className="text-gray-300 text-lg">Comprehensive data management for all user types</p>
            </div>
            
            {/* Admin School ID Box */}
            <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 p-4 min-w-[200px]">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-300">Admin School ID</p>
                  <p className="text-lg font-bold text-yellow-400">{adminSchoolId}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Control Panel */}
          <Card className="bg-gray-800 p-8 rounded-2xl shadow-xl border-4 border-yellow-500 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Filter className="w-6 h-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-yellow-400">Data Management Panel</h3>
            </div>
            <p className="text-gray-300 mb-6">Select data type and manage school-related information efficiently.</p>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500 text-red-300 rounded-xl">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
                <button onClick={() => setError(null)} className="mt-2 text-sm text-red-400 hover:text-red-300">
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Data Type</label>
                <Select 
                  onValueChange={(value) => {
                    setSelectedOption(value);
                    setData([]);
                    setSearchQuery("");
                    setError(null);
                    setSortColumn("id");
                    setSortDirection("asc");
                    setCurrentPage(1);
                  }} 
                  value={selectedOption}
                >
                  <SelectTrigger className="border-gray-600 focus:ring-yellow-400 focus:border-yellow-400 rounded-xl text-gray-300 bg-gray-700 transition-all w-full">
                    <SelectValue placeholder="Select Data Type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-auto">
                    <SelectItem value="route">🛣️ Routes</SelectItem>
                    <SelectItem value="student">🎓 Students</SelectItem>
                    <SelectItem value="driver">🚗 Drivers</SelectItem>
                    <SelectItem value="attender">👥 Attenders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchData}
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
                  ) : "Fetch Data"}
                </Button>
              </div>
            </div>

            {/* Search and Controls */}
            {data.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                  <div className="relative w-full md:w-2/3">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={`Search ${selectedOption}s...`}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-4 py-2 w-full rounded-xl bg-gray-700 border-gray-600 text-white focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={downloadExcel}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
                
                {/* Data Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{data.length}</p>
                    <p className="text-gray-300">Total Records</p>
                  </Card>
                  <Card className="bg-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">{processedData.length}</p>
                    <p className="text-gray-300">Filtered Results</p>
                  </Card>
                  <Card className="bg-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{totalPages}</p>
                    <p className="text-gray-300">Total Pages</p>
                  </Card>
                </div>
              </div>
            )}
          </Card>

          {/* Data Table */}
          {data.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border-4 border-yellow-500 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-700 text-gray-200">
                    {selectedOption === "route" && (
                      <>
                        <TableHead onClick={() => handleSort("smRouteId")} className="cursor-pointer py-3">
                          Route ID {sortColumn === "smRouteId" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("routeName")} className="cursor-pointer py-3">
                          Route Name {sortColumn === "routeName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("title")} className="cursor-pointer py-3">
                          Title {sortColumn === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("status")} className="cursor-pointer py-3">
                          Status {sortColumn === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("cityCode")} className="cursor-pointer py-3">
                          City Code {sortColumn === "cityCode" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead className="py-3">Route Points</TableHead>
                      </>
                    )}
                    {selectedOption === "student" && (
                      <>
                        <TableHead onClick={() => handleSort("smStudentId")} className="cursor-pointer py-3">
                          Student ID {sortColumn === "smStudentId" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer py-3">
                          First Name {sortColumn === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("lastName")} className="cursor-pointer py-3">
                          Last Name {sortColumn === "lastName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("parentUsername")} className="cursor-pointer py-3">
                          parentUsername {sortColumn === "parentUsername" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("smParentId")} className="cursor-pointer py-3">
                          Parent ID {sortColumn === "smParentId" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("routeName")} className="cursor-pointer py-3">
                          Route Name {sortColumn === "routeName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("schoolName")} className="cursor-pointer py-3">
                          School Name {sortColumn === "schoolName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                      </>
                    )}
                    {selectedOption === "driver" && (
                      <>
                        <TableHead onClick={() => handleSort("smDriverId")} className="cursor-pointer py-3">
                          Driver ID {sortColumn === "smDriverId" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer py-3">
                          First Name {sortColumn === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("lastName")} className="cursor-pointer py-3">
                          Last Name {sortColumn === "lastName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("user.username")} className="cursor-pointer py-3">
                          Username {sortColumn === "user.username" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("user.phone")} className="cursor-pointer py-3">
                          Phone {sortColumn === "user.phone" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("routeName")} className="cursor-pointer py-3">
                          Route Name {sortColumn === "routeName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("user.status")} className="cursor-pointer py-3">
                          Status {sortColumn === "user.status" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                      </>
                    )}
                    {selectedOption === "attender" && (
                      <>
                        <TableHead onClick={() => handleSort("smAttenderId")} className="cursor-pointer py-3">
                          Attender ID {sortColumn === "smAttenderId" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("firstName")} className="cursor-pointer py-3">
                          First Name {sortColumn === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("lastName")} className="cursor-pointer py-3">
                          Last Name {sortColumn === "lastName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("user.username")} className="cursor-pointer py-3">
                          Username {sortColumn === "user.username" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("phone")} className="cursor-pointer py-3">
                          Phone {sortColumn === "phone" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("routeName")} className="cursor-pointer py-3">
                          Route Name {sortColumn === "routeName" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                        <TableHead onClick={() => handleSort("user.status")} className="cursor-pointer py-3">
                          Status {sortColumn === "user.status" && (sortDirection === "asc" ? "↑" : "↓")}
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <TableRow key={index} className="border-b border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
                        {selectedOption === "route" && (
                          <>
                            <TableCell className="py-3 font-medium">{item.smRouteId}</TableCell>
                            <TableCell className="py-3">{item.routeName}</TableCell>
                            <TableCell className="py-3">{item.title}</TableCell>
                            <TableCell className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.status ? "Active" : "Inactive"}
                              </span>
                            </TableCell>
                            <TableCell className="py-3">{item.cityCode}</TableCell>
                            <TableCell className="py-3">
                              <div className="max-h-32 overflow-y-auto">
                                {item.routePoints?.map((rp, i) => (
                                  <div key={i} className="text-sm mb-1">
                                    {i+1}. {rp.routePointName} ({rp.latitude}, {rp.longitude})
                                  </div>
                                )) || "No route points"}
                              </div>
                            </TableCell>
                          </>
                        )}
                        {selectedOption === "student" && (
                          <>
                            <TableCell className="py-3 font-medium">{item.smStudentId}</TableCell>
                            <TableCell className="py-3">{item.firstName}</TableCell>
                            <TableCell className="py-3">{item.lastName}</TableCell>
                            <TableCell className="py-3">{item.username}</TableCell>
                            <TableCell className="py-3">{item.smParentId}</TableCell>
                            <TableCell className="py-3">{item.routeName}</TableCell>
                            <TableCell className="py-3">{item.schoolName}</TableCell>
                          </>
                        )}
                        {selectedOption === "driver" && (
                          <>
                            <TableCell className="py-3 font-medium">{item.smDriverId}</TableCell>
                            <TableCell className="py-3">{item.firstName}</TableCell>
                            <TableCell className="py-3">{item.lastName}</TableCell>
                            <TableCell className="py-3">{item.user?.username}</TableCell>
                            <TableCell className="py-3">{item.user?.phone}</TableCell>
                            <TableCell className="py-3">{item.routeName || "N/A"}</TableCell>
                            <TableCell className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.user?.status}
                              </span>
                            </TableCell>
                          </>
                        )}
                        {selectedOption === "attender" && (
                          <>
                            <TableCell className="py-3 font-medium">{item.smAttenderId}</TableCell>
                            <TableCell className="py-3">{item.firstName}</TableCell>
                            <TableCell className="py-3">{item.lastName}</TableCell>
                            <TableCell className="py-3">{item.user?.username}</TableCell>
                            <TableCell className="py-3">{item.phone}</TableCell>
                            <TableCell className="py-3">{item.routeName || "N/A"}</TableCell>
                            <TableCell className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {item.user?.status}
                              </span>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={selectedOption === "route" ? 6 : 7} className="text-center py-8 text-gray-400">
                        No matching records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} results
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
              )}
            </div>
          )}

          {!loading && data.length === 0 && !error && (
            <div className="text-center mt-12">
              <Card className="bg-gray-800 p-8 border-2 border-yellow-500 inline-block">
                <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-400 text-xl font-semibold">
                  Select a data type and click "Fetch Data" to load information
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Manage routes, students, drivers, and attenders efficiently
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsersPage;