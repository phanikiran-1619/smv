import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../components/ui/pagination';
import { 
  MapPin, Users, Bus, UserCheck, 
  Plus, Search, ChevronDown, X, Trash2, Edit
} from 'lucide-react';

// Skeleton Components
const SkeletonCard = ({ className = "" }) => (
  <Card className={`dark:bg-slate-800/60 dark:border-slate-700 bg-white/80 border-gray-200 p-6 text-center rounded-xl shadow-lg ${className}`}>
    <div className="animate-pulse">
      <div className="w-8 h-8 dark:bg-slate-700 bg-gray-300 rounded mx-auto mb-2"></div>
      <div className="h-8 dark:bg-slate-700 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 dark:bg-slate-700 bg-gray-300 rounded w-3/4 mx-auto"></div>
    </div>
  </Card>
);

const SkeletonTable = () => (
  <Card className="dark:bg-slate-800/60 dark:border-slate-700 bg-white/80 border-gray-200 overflow-hidden rounded-xl shadow-lg">
    <div className="p-6">
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 dark:bg-slate-700 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 dark:bg-slate-700 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-600 border-gray-300">
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="text-left py-3 px-4">
                    <div className="h-4 dark:bg-slate-700 bg-gray-300 rounded w-full"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b dark:border-slate-600/50 border-gray-300/50">
                  {[...Array(4)].map((_, colIndex) => (
                    <td key={colIndex} className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 dark:bg-slate-700 bg-gray-300 rounded"></div>
                        <div className="h-4 dark:bg-slate-700 bg-gray-300 rounded flex-1"></div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Card>
);

const SkeletonModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="dark:bg-slate-800 bg-white rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl">
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 dark:bg-slate-700 bg-gray-300 rounded w-1/2"></div>
          <div className="w-6 h-6 dark:bg-slate-700 bg-gray-300 rounded"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-4 dark:bg-slate-700 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-xl"></div>
            </div>
          ))}
          <div className="flex justify-end gap-4 pt-6">
            <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-xl w-24"></div>
            <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-xl w-32"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const RouteAssignPage = () => {
  const location = useLocation();
  const { pageTitle, userType, username } = location.state || { 
    pageTitle: 'Route Assign', 
    userType: 'admin', 
    username: 'Admin' 
  };

  // State management
  const [assignments, setAssignments] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [attenders, setAttenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [showAttenderDropdown, setShowAttenderDropdown] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [attenderSearch, setAttenderSearch] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    schoolId: '',
    smRouteId: '',
    smDriverID: '',
    smAttenderId: ''
  });

  // API base URL from environment
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Helper functions
  const getAuthToken = () => localStorage.getItem("admintoken");
  const getSchoolId = () => localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId");

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const makeApiCall = async (url, method = 'GET', body = null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authorization token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return method === 'DELETE' ? response : response.json();
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const schoolId = getSchoolId();
      if (!schoolId) {
        throw new Error('School ID not found in localStorage');
      }

      setFormData(prev => ({ ...prev, schoolId }));

      // Fetch required data first
      const [routesData, driversData, attendersData] = await Promise.all([
        makeApiCall(`${API_BASE_URL}/route/school/${schoolId}`).catch(() => []),
        makeApiCall(`${API_BASE_URL}/driver/school/${schoolId}`).catch(() => []),
        makeApiCall(`${API_BASE_URL}/attender/school/${schoolId}`).catch(() => [])
      ]);

      setRoutes(routesData || []);
      setDrivers(driversData || []);
      setAttenders(attendersData || []);

      // Try to fetch assignments, but don't fail if endpoint doesn't exist  
      try {
        const assignmentsData = await makeApiCall(`${API_BASE_URL}/assignments/active?schoolId=${schoolId}&date=${new Date().toISOString().split('T')[0]}`);
        setAssignments(assignmentsData || []);
      } catch (error) {
        console.log('Assignments endpoint not available, using empty state');
        setAssignments([]);
      }

      setCurrentPage(1); // Reset to first page when data is loaded
    } catch (error) {
      console.error('Error fetching data:', error);
      setRoutes([]);
      setDrivers([]);
      setAttenders([]);
      setAssignments([]);
    } finally {
      // Add minimum loading time for better UX
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Create new assignment
  const createAssignment = async () => {
    setModalLoading(true);
    try {
      // For demo purposes, create local assignment since API might not exist
      const newAssignment = {
        id: Date.now(),
        ...formData,
        routeName: routes.find(r => r.smRouteId === formData.smRouteId)?.routeName || 'Unknown Route',
        driverName: drivers.find(d => d.smDriverId === formData.smDriverID)?.user?.username || 'Unknown Driver',
        attenderName: attenders.find(a => a.smAttenderId === formData.smAttenderId)?.user?.username || 'Unknown Attender'
      };

      setAssignments(prev => [...prev, newAssignment]);
      setShowModal(false);
      resetForm();
      showNotification('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      showNotification('Failed to create assignment. Please try again.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Update assignment
  const updateAssignment = async () => {
    setModalLoading(true);
    try {
      const updatedAssignment = {
        ...editingAssignment,
        ...formData,
        routeName: routes.find(r => r.smRouteId === formData.smRouteId)?.routeName || 'Unknown Route',
        driverName: drivers.find(d => d.smDriverId === formData.smDriverID)?.user?.username || 'Unknown Driver',
        attenderName: attenders.find(a => a.smAttenderId === formData.smAttenderId)?.user?.username || 'Unknown Attender'
      };

      setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? updatedAssignment : a));
      setShowModal(false);
      setEditingAssignment(null);
      resetForm();
      showNotification('Assignment updated successfully!');
    } catch (error) {
      console.error('Error updating assignment:', error);
      showNotification('Failed to update assignment. Please try again.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete assignment
  const deleteAssignment = async () => {
    try {
      setAssignments(prev => prev.filter(a => a.id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      showNotification('Assignment deleted successfully!');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      showNotification('Failed to delete assignment. Please try again.', 'error');
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      schoolId: getSchoolId() || '',
      smRouteId: '',
      smDriverID: '',
      smAttenderId: ''
    });
    setRouteSearch('');
    setDriverSearch('');
    setAttenderSearch('');
    setShowRouteDropdown(false);
    setShowDriverDropdown(false);
    setShowAttenderDropdown(false);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      schoolId: assignment.schoolId,
      smRouteId: assignment.smRouteId,
      smDriverID: assignment.smDriverID,
      smAttenderId: assignment.smAttenderId
    });
    // Set display names but clear search text (will be cleared when dropdown opens)
    setRouteSearch(routes.find(r => r.smRouteId === assignment.smRouteId)?.routeName || '');
    setDriverSearch(drivers.find(d => d.smDriverId === assignment.smDriverID)?.user?.username || '');
    setAttenderSearch(attenders.find(a => a.smAttenderId === assignment.smAttenderId)?.user?.username || '');
    setShowModal(true);
    setShowRouteDropdown(false);
    setShowDriverDropdown(false);
    setShowAttenderDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.smRouteId || !formData.smDriverID || !formData.smAttenderId) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (editingAssignment) {
      updateAssignment();
    } else {
      createAssignment();
    }
  };

  // Filter functions - show only available (unassigned) routes
  const assignedRouteIds = assignments
    .filter(a => !editingAssignment || a.id !== editingAssignment.id) // Exclude current assignment when editing
    .map(a => a.smRouteId);
  const availableRoutes = routes.filter(route => !assignedRouteIds.includes(route.smRouteId));
  
  const filteredRoutes = availableRoutes.filter(route =>
    route.routeName?.toLowerCase().includes(routeSearch.toLowerCase())
  );

  // Exclude drivers and attenders assigned to other routes (except current assignment in edit mode)
  const assignedDriverIds = assignments
    .filter(a => !editingAssignment || a.id !== editingAssignment.id)
    .map(a => a.smDriverID);
  const assignedAttenderIds = assignments
    .filter(a => !editingAssignment || a.id !== editingAssignment.id)
    .map(a => a.smAttenderId);

  const filteredDrivers = drivers.filter(driver => 
    !assignedDriverIds.includes(driver.smDriverId) && 
    driver.user?.username?.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const filteredAttenders = attenders.filter(attender =>
    !assignedAttenderIds.includes(attender.smAttenderId) && 
    attender.user?.username?.toLowerCase().includes(attenderSearch.toLowerCase())
  );

  const filteredAssignments = assignments.filter(assignment => {
    const routeName = routes.find(r => r.smRouteId === assignment.smRouteId)?.routeName || '';
    const driverName = drivers.find(d => d.smDriverID === assignment.smDriverID)?.user?.username || '';
    return routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           driverName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            isActive={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              isActive={currentPage === totalPages}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  // Calculate stats
  const totalRoutes = routes.length;
  const totalDrivers = drivers.length;
  const totalAttenders = attenders.length;
  const activeAssignments = assignments.length;
  
  // Calculate assigned vs available counts
  const assignedRoutes = assignments.length;
  const availableRoutesCount = totalRoutes - assignedRoutes;
  
  const assignedDrivers = assignments.length;
  const availableDriversCount = totalDrivers - assignedDrivers;
  
  const assignedAttenders = assignments.length;
  const availableAttendersCount = totalAttenders - assignedAttenders;

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Show skeleton loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
        <Navbar showBackButton={true} />
        
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Header skeleton */}
            <div className="text-center mb-8">
              <div className="animate-pulse">
                <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-lg mb-4 mx-auto w-1/2"></div>
                <div className="h-6 dark:bg-slate-700 bg-gray-300 rounded mx-auto w-1/3"></div>
              </div>
            </div>

            {/* Stats Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            {/* Controls skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="animate-pulse flex-1">
                <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-lg w-40"></div>
              </div>
            </div>

            {/* Table skeleton */}
            <SkeletonTable />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:via-orange-500 dark:to-red-500 from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              {pageTitle}
            </h1>
            <p className="dark:text-gray-300 text-gray-600 text-lg">Manage route assignments for drivers and students</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 p-6 text-center rounded-xl shadow-lg">
              <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold dark:text-white text-gray-800">{totalRoutes}</h3>
              <p className="text-blue-600">Total Routes</p>
              <div className="text-sm text-blue-500 mt-1">
                {assignedRoutes} assigned, {availableRoutesCount} available
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 p-6 text-center rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold dark:text-white text-gray-800">{totalDrivers}</h3>
              <p className="text-green-600">Total Drivers</p>
              <div className="text-sm text-green-500 mt-1">
                {assignedDrivers} assigned, {availableDriversCount} available
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 p-6 text-center rounded-xl shadow-lg">
              <UserCheck className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold dark:text-white text-gray-800">{totalAttenders}</h3>
              <p className="text-purple-600">Total Attenders</p>
              <div className="text-sm text-purple-500 mt-1">
                {assignedAttenders} assigned, {availableAttendersCount} available
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 p-6 text-center rounded-xl shadow-lg">
              <Bus className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold dark:text-white text-gray-800">{activeAssignments}</h3>
              <p className="text-orange-600">Active Assignments</p>
              <div className="text-sm text-orange-500 mt-1">
                Currently assigned today
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 dark:bg-slate-700/50 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-lg dark:text-white dark:placeholder-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none dark:focus:ring-2 dark:focus:ring-yellow-500 dark:focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button 
              onClick={() => {
                resetForm();
                setEditingAssignment(null);
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r dark:from-yellow-500 dark:to-orange-500 dark:text-slate-900 from-blue-500 to-blue-600 text-white font-semibold rounded-lg dark:hover:from-yellow-600 dark:hover:to-orange-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Assignment
            </button>
          </div>

          {/* Assignments Table */}
          <Card className="dark:bg-slate-800/60 dark:border-slate-700 bg-white/80 border-gray-200 overflow-hidden rounded-xl shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white text-gray-800">Current Route Assignments</h2>
                {totalPages > 1 && (
                  <div className="text-sm dark:text-gray-400 text-gray-600">
                    Page {currentPage} of {totalPages} ({currentAssignments.length} of {filteredAssignments.length} assignments)
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-slate-600 border-gray-300">
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-700 font-semibold">Route</th>
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-700 font-semibold">Driver</th>
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-700 font-semibold">Attender</th>
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.map((assignment) => {
                      const route = routes.find(r => r.smRouteId === assignment.smRouteId);
                      const driver = drivers.find(d => d.smDriverId === assignment.smDriverID);
                      const attender = attenders.find(a => a.smAttenderId === assignment.smAttenderId);

                      return (
                        <tr key={assignment.id} className="border-b dark:border-slate-600/50 border-gray-300/50 dark:hover:bg-slate-700/30 hover:bg-gray-100/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-400" />
                              <span className="dark:text-white text-gray-800 font-medium">{route?.routeName || 'Unknown Route'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-green-400" />
                              <span className="dark:text-gray-300 text-gray-700">{driver?.user?.username || 'Unknown Driver'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <UserCheck className="w-5 h-5 text-purple-400" />
                              <span className="dark:text-gray-300 text-gray-700">{attender?.user?.username || 'Unknown Attender'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEdit(assignment)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-1 shadow-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  setDeleteId(assignment.id);
                                  setShowDeleteConfirm(true);
                                }}
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-1 shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {currentAssignments.length === 0 && (
                  <div className="text-center py-8 dark:text-gray-400 text-gray-600">
                    {searchTerm ? 'No assignments found matching your search.' : 'No assignments found for today.'}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Modal with Skeleton Loading */}
      {showModal && (
        <>
          {modalLoading && <SkeletonModal />}
          {!modalLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="dark:bg-slate-800 bg-white rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold dark:text-white text-gray-800">
                    {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingAssignment(null);
                      resetForm();
                    }}
                    className="dark:text-gray-400 dark:hover:text-white text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Route Selection */}
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-2">Route *</label>
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setShowRouteDropdown(!showRouteDropdown);
                          // Clear search text when opening dropdown in edit mode
                          if (editingAssignment && !showRouteDropdown) {
                            setRouteSearch('');
                          }
                        }}
                        className="w-full px-4 py-3 dark:bg-slate-700/90 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-xl dark:text-white text-gray-800 flex items-center justify-between cursor-pointer dark:hover:bg-slate-700 hover:bg-gray-200 transition-all duration-200 shadow-md"
                      >
                        <span className="dark:text-gray-200 text-gray-700">{routeSearch || 'Select Route'}</span>
                        <ChevronDown className={`w-5 h-5 dark:text-gray-400 text-gray-500 transition-transform duration-200 ${showRouteDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {showRouteDropdown && (
                        <div className="absolute z-20 w-full mt-2 dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300 border rounded-xl max-h-64 shadow-2xl overflow-hidden">
                          <div className="px-4 py-3 sticky top-0 dark:bg-slate-700 dark:border-slate-600 bg-gray-50 border-gray-300 border-b">
                            <input
                              type="text"
                              placeholder="Search routes..."
                              value={routeSearch}
                              onChange={(e) => setRouteSearch(e.target.value)}
                              className="w-full px-3 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-white bg-white border-gray-300 border rounded-lg focus:outline-none dark:focus:ring-2 dark:focus:ring-yellow-500/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredRoutes.map((route) => (
                              <div
                                key={route.smRouteId}
                                onClick={() => {
                                  setFormData({...formData, smRouteId: route.smRouteId});
                                  setRouteSearch(route.routeName);
                                  setShowRouteDropdown(false);
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b last:border-b-0"
                              >
                                <div className="font-medium">{route.routeName}</div>
                                <div className="text-sm dark:text-gray-400 text-gray-600">{route.smRouteId}</div>
                              </div>
                            ))}
                            {filteredRoutes.length === 0 && (
                              <div className="px-4 py-3 dark:text-gray-400 text-gray-600 text-sm">No routes found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver Selection */}
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-2">Driver *</label>
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setShowDriverDropdown(!showDriverDropdown);
                          // Clear search text when opening dropdown in edit mode
                          if (editingAssignment && !showDriverDropdown) {
                            setDriverSearch('');
                          }
                        }}
                        className="w-full px-4 py-3 dark:bg-slate-700/90 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-xl dark:text-white text-gray-800 flex items-center justify-between cursor-pointer dark:hover:bg-slate-700 hover:bg-gray-200 transition-all duration-200 shadow-md"
                      >
                        <span className="dark:text-gray-200 text-gray-700">{driverSearch || 'Select Driver'}</span>
                        <ChevronDown className={`w-5 h-5 dark:text-gray-400 text-gray-500 transition-transform duration-200 ${showDriverDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {showDriverDropdown && (
                        <div className="absolute z-20 w-full mt-2 dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300 border rounded-xl max-h-64 shadow-2xl overflow-hidden">
                          <div className="px-4 py-3 sticky top-0 dark:bg-slate-700 dark:border-slate-600 bg-gray-50 border-gray-300 border-b">
                            <input
                              type="text"
                              placeholder="Search drivers..."
                              value={driverSearch}
                              onChange={(e) => setDriverSearch(e.target.value)}
                              className="w-full px-3 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-white bg-white border-gray-300 border rounded-lg focus:outline-none dark:focus:ring-2 dark:focus:ring-yellow-500/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredDrivers.map((driver) => (
                              <div
                                key={driver.smDriverId}
                                onClick={() => {
                                  setFormData({...formData, smDriverID: driver.smDriverId});
                                  setDriverSearch(driver.user?.username || '');
                                  setShowDriverDropdown(false);
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b last:border-b-0"
                              >
                                <div className="font-medium">{driver.user?.username}</div>
                                <div className="text-sm dark:text-gray-400 text-gray-600">{driver.smDriverId}</div>
                              </div>
                            ))}
                            {filteredDrivers.length === 0 && (
                              <div className="px-4 py-3 dark:text-gray-400 text-gray-600 text-sm">No available drivers found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attender Selection */}
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-2">Attender *</label>
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setShowAttenderDropdown(!showAttenderDropdown);
                          // Clear search text when opening dropdown in edit mode
                          if (editingAssignment && !showAttenderDropdown) {
                            setAttenderSearch('');
                          }
                        }}
                        className="w-full px-4 py-3 dark:bg-slate-700/90 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-xl dark:text-white text-gray-800 flex items-center justify-between cursor-pointer dark:hover:bg-slate-700 hover:bg-gray-200 transition-all duration-200 shadow-md"
                      >
                        <span className="dark:text-gray-200 text-gray-700">{attenderSearch || 'Select Attender'}</span>
                        <ChevronDown className={`w-5 h-5 dark:text-gray-400 text-gray-500 transition-transform duration-200 ${showAttenderDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {showAttenderDropdown && (
                        <div className="absolute z-20 w-full mt-2 dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-300 border rounded-xl max-h-64 shadow-2xl overflow-hidden">
                          <div className="px-4 py-3 sticky top-0 dark:bg-slate-700 dark:border-slate-600 bg-gray-50 border-gray-300 border-b">
                            <input
                              type="text"
                              placeholder="Search attenders..."
                              value={attenderSearch}
                              onChange={(e) => setAttenderSearch(e.target.value)}
                              className="w-full px-3 py-2 dark:bg-slate-800 dark:border-slate-600 dark:text-white bg-white border-gray-300 border rounded-lg focus:outline-none dark:focus:ring-2 dark:focus:ring-yellow-500/50 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {filteredAttenders.map((attender) => (
                              <div
                                key={attender.smAttenderId}
                                onClick={() => {
                                  setFormData({...formData, smAttenderId: attender.smAttenderId});
                                  setAttenderSearch(attender.user?.username || '');
                                  setShowAttenderDropdown(false);
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b last:border-b-0"
                              >
                                <div className="font-medium">{attender.user?.username}</div>
                                <div className="text-sm dark:text-gray-400 text-gray-600">{attender.smAttenderId}</div>
                              </div>
                            ))}
                            {filteredAttenders.length === 0 && (
                              <div className="px-4 py-3 dark:text-gray-400 text-gray-600 text-sm">No available attenders found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingAssignment(null);
                        resetForm();
                      }}
                      className="px-6 py-3 dark:bg-slate-600 dark:text-white bg-gray-300 text-gray-700 rounded-xl dark:hover:bg-slate-500 hover:bg-gray-400 transition-all duration-200 font-medium shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r dark:from-yellow-500 dark:to-orange-500 dark:text-slate-900 from-blue-500 to-blue-600 text-white font-semibold rounded-xl dark:hover:from-yellow-600 dark:hover:to-orange-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
                    >
                      {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="dark:bg-slate-800 bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold dark:text-white text-gray-800 mb-4">Confirm Delete</h3>
            <p className="dark:text-gray-200 text-gray-600 mb-6">Are you sure you want to delete this assignment? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="px-6 py-3 dark:bg-slate-600 dark:text-white bg-gray-300 text-gray-700 rounded-xl dark:hover:bg-slate-500 hover:bg-gray-400 transition-all duration-200 font-medium shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={deleteAssignment}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`rounded-xl p-4 max-w-sm w-full shadow-xl transform transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteAssignPage;