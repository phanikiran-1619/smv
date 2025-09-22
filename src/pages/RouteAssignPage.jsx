import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Custom hooks for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton Components
const SkeletonCard = ({ className = "" }) => (
  <Card className={`dark:bg-slate-800 bg-white p-6 text-center rounded-xl shadow-lg ${className}`}>
    <div className="animate-pulse">
      <div className="w-8 h-8 dark:bg-slate-700 bg-gray-300 rounded mx-auto mb-2"></div>
      <div className="h-8 dark:bg-slate-700 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 dark:bg-slate-700 bg-gray-300 rounded w-3/4 mx-auto"></div>
    </div>
  </Card>
);

const SkeletonTable = () => (
  <Card className="dark:bg-slate-800 bg-white overflow-hidden rounded-xl shadow-lg">
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
  
  // Individual operation loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
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

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    route: '',
    driver: '',
    attender: '',
    general: ''
  });

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

  // Original form data for comparison (used to detect changes)
  const [originalFormData, setOriginalFormData] = useState({
    smRouteId: '',
    smDriverID: '',
    smAttenderId: ''
  });

  // API base URL from environment
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Helper functions
  const getAuthToken = () => localStorage.getItem("admintoken");
  const getSchoolId = () => localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId");

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  }, []);

  const clearFormErrors = useCallback(() => {
    setFormErrors({
      route: '',
      driver: '',
      attender: '',
      general: ''
    });
  }, []);

  const validateForm = useCallback(() => {
    const errors = {
      route: '',
      driver: '',
      attender: '',
      general: ''
    };

    // Check if route is selected
    if (!formData.smRouteId) {
      errors.route = 'Please select a route';
    }

    // Check if at least driver or attender is selected
    if (!formData.smDriverID && !formData.smAttenderId) {
      errors.general = 'Either driver or attender must be provided';
    }

    setFormErrors(errors);

    // Return true if no errors
    return !errors.route && !errors.driver && !errors.attender && !errors.general;
  }, [formData]);

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
      // Parse error response
      let errorMessage = `API call failed: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If can't parse JSON, use default message
      }
      throw new Error(errorMessage);
    }

    return method === 'DELETE' ? response : response.json();
  };

  // Fetch all data (only called on initial load)
  const fetchAllData = useCallback(async () => {
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

      // Fetch assignments
      const assignmentsData = await makeApiCall(`${API_BASE_URL}/assignments/active?schoolId=${schoolId}&date=${new Date().toISOString().split('T')[0]}`);
      setAssignments(assignmentsData || []);

      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to load data. Please refresh the page.', 'error');
      setRoutes([]);
      setDrivers([]);
      setAttenders([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, showNotification]);

  // Prepare payload
  const preparePayload = useCallback((isUpdate = false) => {
    const payload = {
      schoolId: formData.schoolId,
      status: 1 // Always set status to 1 for both create and update
    };
    
    // Always include these fields if they exist
    if (formData.smRouteId) payload.smRouteId = formData.smRouteId;
    if (formData.smDriverID) payload.smDriverID = formData.smDriverID;
    if (formData.smAttenderId) payload.smAttenderId = formData.smAttenderId;
    
    // Only include date for creation, not for updates
    if (!isUpdate && formData.date) {
      payload.date = formData.date;
    }
    
    // Ensure status is always 1
    payload.status = 1;
    
    return payload;
  }, [formData]);

  // Check if form has changes
  const hasFormChanges = useMemo(() => {
    if (!editingAssignment) return true; // Always allow creation
    
    return (
      formData.smRouteId !== originalFormData.smRouteId ||
      formData.smDriverID !== originalFormData.smDriverID ||
      formData.smAttenderId !== originalFormData.smAttenderId
    );
  }, [formData, originalFormData, editingAssignment]);

  // Optimistic create assignment
  const createAssignment = useCallback(async () => {
    if (createLoading) return;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate form
    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }
    
    setCreateLoading(true);
    
    // Create temporary assignment for optimistic update
    const tempAssignment = {
      id: `temp_${Date.now()}`,
      ...preparePayload(),
      isOptimistic: true
    };

    // Optimistically add to assignments
    setAssignments(prev => [tempAssignment, ...prev]);
    
    // Show success message immediately
    showNotification('Assignment created successfully!');
    
    // Close modal immediately
    setShowModal(false);
    resetForm();

    try {
      // Prepare payload with explicit status
      const payload = {
        ...preparePayload(),
        status: 1 // Explicitly ensure status is 1
      };
      
      console.log('Create payload:', payload); // Debug log
      
      const newAssignment = await makeApiCall(`${API_BASE_URL}/assignments`, 'POST', payload);
      
      // Replace temp assignment with real one
      setAssignments(prev => prev.map(a => 
        a.id === tempAssignment.id ? { ...newAssignment, isOptimistic: false } : a
      ));
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      // Remove optimistic assignment and show error
      setAssignments(prev => prev.filter(a => a.id !== tempAssignment.id));
      
      // Show specific API error message
      const errorMessage = error.message || 'Failed to create assignment. Please try again.';
      showNotification(errorMessage, 'error');
      
      // Reopen modal with error
      setShowModal(true);
      setFormData(prev => ({ ...prev, ...tempAssignment }));
      
      // Set route search if route was selected
      if (tempAssignment.smRouteId) {
        const route = routes.find(r => r.smRouteId === tempAssignment.smRouteId);
        setRouteSearch(route?.routeName || '');
      }
      
      // Set driver search if driver was selected
      if (tempAssignment.smDriverID) {
        const driver = drivers.find(d => d.smDriverId === tempAssignment.smDriverID);
        setDriverSearch(driver?.user?.username || '');
      }
      
      // Set attender search if attender was selected
      if (tempAssignment.smAttenderId) {
        const attender = attenders.find(a => a.smAttenderId === tempAssignment.smAttenderId);
        setAttenderSearch(attender?.user?.username || '');
      }
      
      // Set form error for display
      setFormErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
      
    } finally {
      setCreateLoading(false);
    }
  }, [createLoading, clearFormErrors, validateForm, preparePayload, showNotification, API_BASE_URL, routes, drivers, attenders]);

  // Optimistic update assignment
  const updateAssignment = useCallback(async () => {
    if (updateLoading || !editingAssignment) return;
    
    // Check if there are actually changes
    if (!hasFormChanges) {
      showNotification('No changes detected to update', 'error');
      return;
    }
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate form
    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }
    
    setUpdateLoading(true);
    
    // Store original assignment for rollback
    const originalAssignment = editingAssignment;
    const updatedAssignment = {
      ...editingAssignment,
      ...preparePayload(true),
      isOptimistic: true
    };

    // Optimistically update assignments
    setAssignments(prev => prev.map(a => 
      a.id === editingAssignment.id ? updatedAssignment : a
    ));
    
    // Show success message immediately
    showNotification('Assignment updated successfully!');
    
    // Close modal immediately
    setShowModal(false);
    setEditingAssignment(null);
    resetForm();

    try {
      // Prepare payload with explicit status
      const payload = {
        ...preparePayload(true),
        status: 1 // Explicitly ensure status is 1
      };
      
      console.log('Update payload:', payload); // Debug log
      
      const updated = await makeApiCall(`${API_BASE_URL}/assignments/${editingAssignment.id}`, 'PUT', payload);
      
      // Replace optimistic update with real data
      setAssignments(prev => prev.map(a => 
        a.id === editingAssignment.id ? { ...updated, isOptimistic: false } : a
      ));
      
    } catch (error) {
      console.error('Error updating assignment:', error);
      // Rollback to original assignment and show error
      setAssignments(prev => prev.map(a => 
        a.id === editingAssignment.id ? originalAssignment : a
      ));
      
      // Show specific API error message
      const errorMessage = error.message || 'Failed to update assignment. Please try again.';
      showNotification(errorMessage, 'error');
      
      // Reopen modal with error
      setEditingAssignment(originalAssignment);
      handleEdit(originalAssignment);
      
      // Set form error for display
      setFormErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
      
    } finally {
      setUpdateLoading(false);
    }
  }, [updateLoading, editingAssignment, hasFormChanges, clearFormErrors, validateForm, preparePayload, showNotification, API_BASE_URL]);

  // Optimistic delete assignment
  const deleteAssignment = useCallback(async () => {
    if (deleteLoading || !deleteId) return;
    
    setDeleteLoading(true);

    // Store original assignment for rollback
    const assignmentToDelete = assignments.find(a => a.id === deleteId);
    if (!assignmentToDelete) return;

    // Optimistically remove from assignments
    setAssignments(prev => prev.filter(a => a.id !== deleteId));
    
    // Show success message immediately
    showNotification('Assignment deleted successfully!');
    
    // Close modal immediately
    setShowDeleteConfirm(false);
    setDeleteId(null);

    try {
      await makeApiCall(`${API_BASE_URL}/assignments/${deleteId}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      // Rollback - add assignment back and show error
      setAssignments(prev => [assignmentToDelete, ...prev]);
      
      // Show specific API error message
      const errorMessage = error.message || 'Failed to delete assignment. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLoading, deleteId, assignments, showNotification, API_BASE_URL]);

  // Form handlers
  const resetForm = useCallback(() => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      schoolId: getSchoolId() || '',
      smRouteId: '',
      smDriverID: '',
      smAttenderId: ''
    });
    setOriginalFormData({
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
    clearFormErrors();
  }, [clearFormErrors]);

  const handleEdit = useCallback((assignment) => {
    setEditingAssignment(assignment);
    const currentFormData = {
      date: new Date().toISOString().split('T')[0],
      schoolId: assignment.schoolId,
      smRouteId: assignment.smRouteId || '',
      smDriverID: assignment.smDriverID || '',
      smAttenderId: assignment.smAttenderId || ''
    };
    setFormData(currentFormData);
    
    // Store original data for comparison
    setOriginalFormData({
      smRouteId: assignment.smRouteId || '',
      smDriverID: assignment.smDriverID || '',
      smAttenderId: assignment.smAttenderId || ''
    });
    
    setRouteSearch(routes.find(r => r.smRouteId === assignment.smRouteId)?.routeName || '');
    setDriverSearch(drivers.find(d => d.smDriverId === assignment.smDriverID)?.user?.username || '');
    setAttenderSearch(attenders.find(a => a.smAttenderId === assignment.smAttenderId)?.user?.username || '');
    setShowModal(true);
    setShowRouteDropdown(false);
    setShowDriverDropdown(false);
    setShowAttenderDropdown(false);
    clearFormErrors();
  }, [routes, drivers, attenders, clearFormErrors]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (editingAssignment) {
      updateAssignment();
    } else {
      createAssignment();
    }
  }, [editingAssignment, updateAssignment, createAssignment]);

  // Memoized filter functions for better performance
  const assignedRouteIds = useMemo(() => 
    assignments
      .filter(a => !editingAssignment || a.id !== editingAssignment.id)
      .map(a => a.smRouteId)
      .filter(id => id), // Filter out null/undefined values
    [assignments, editingAssignment]
  );

  const availableRoutes = useMemo(() => 
    routes.filter(route => !assignedRouteIds.includes(route.smRouteId)),
    [routes, assignedRouteIds]
  );
  
  const filteredRoutes = useMemo(() => 
    availableRoutes.filter(route =>
      route.routeName?.toLowerCase().includes(routeSearch.toLowerCase())
    ),
    [availableRoutes, routeSearch]
  );

  const assignedDriverIds = useMemo(() => 
    assignments
      .filter(a => !editingAssignment || a.id !== editingAssignment.id)
      .map(a => a.smDriverID)
      .filter(id => id), // Filter out null/undefined values
    [assignments, editingAssignment]
  );

  const assignedAttenderIds = useMemo(() => 
    assignments
      .filter(a => !editingAssignment || a.id !== editingAssignment.id)
      .map(a => a.smAttenderId)
      .filter(id => id), // Filter out null/undefined values
    [assignments, editingAssignment]
  );

  const filteredDrivers = useMemo(() => 
    drivers.filter(driver => 
      !assignedDriverIds.includes(driver.smDriverId) && 
      driver.user?.username?.toLowerCase().includes(driverSearch.toLowerCase())
    ),
    [drivers, assignedDriverIds, driverSearch]
  );

  const filteredAttenders = useMemo(() => 
    attenders.filter(attender =>
      !assignedAttenderIds.includes(attender.smAttenderId) && 
      attender.user?.username?.toLowerCase().includes(attenderSearch.toLowerCase())
    ),
    [attenders, assignedAttenderIds, attenderSearch]
  );

  const filteredAssignments = useMemo(() => 
    assignments.filter(assignment => {
      const routeName = routes.find(r => r.smRouteId === assignment.smRouteId)?.routeName || '';
      const driverName = drivers.find(d => d.smDriverId === assignment.smDriverID)?.user?.username || '';
      const attenderName = attenders.find(a => a.smAttenderId === assignment.smAttenderId)?.user?.username || '';
      
      return routeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
             driverName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
             attenderName.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    }),
    [assignments, routes, drivers, attenders, debouncedSearchTerm]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const renderPaginationItems = useCallback(() => {
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

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

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

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

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
  }, [totalPages, currentPage, handlePageChange]);

  // Calculate stats - FIXED COUNTING LOGIC
  const stats = useMemo(() => {
    const totalRoutes = routes.length;
    const totalDrivers = drivers.length;
    const totalAttenders = attenders.length;
    const activeAssignments = assignments.length;
    
    // Count unique assigned routes (routes that have assignments)
    const assignedRouteIds = new Set(assignments.map(a => a.smRouteId).filter(id => id));
    const assignedRoutes = assignedRouteIds.size;
    const availableRoutesCount = Math.max(0, totalRoutes - assignedRoutes);
    
    // Count unique assigned drivers (drivers that have assignments)
    const assignedDriverIds = new Set(assignments.map(a => a.smDriverID).filter(id => id));
    const assignedDrivers = assignedDriverIds.size;
    const availableDriversCount = Math.max(0, totalDrivers - assignedDrivers);
    
    // Count unique assigned attenders (attenders that have assignments)
    const assignedAttenderIds = new Set(assignments.map(a => a.smAttenderId).filter(id => id));
    const assignedAttenders = assignedAttenderIds.size;
    const availableAttendersCount = Math.max(0, totalAttenders - assignedAttenders);

    return {
      totalRoutes,
      totalDrivers,
      totalAttenders,
      activeAssignments,
      assignedRoutes,
      availableRoutesCount,
      assignedDrivers,
      availableDriversCount,
      assignedAttenders,
      availableAttendersCount
    };
  }, [routes.length, drivers.length, attenders.length, assignments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
        <Navbar showBackButton={true} />
        
        <div className="pt-24 px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="animate-pulse">
                <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-lg mb-4 mx-auto w-1/2"></div>
                <div className="h-6 dark:bg-slate-700 bg-gray-300 rounded mx-auto w-1/3"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="animate-pulse flex-1">
                <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-12 dark:bg-slate-700 bg-gray-300 rounded-lg w-40"></div>
              </div>
            </div>

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
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:via-orange-500 dark:to-red-500 from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 tracking-wide">
              {pageTitle.toUpperCase()}
            </h1>
            <p className="dark:text-gray-300 text-gray-700 text-lg font-medium">Manage route assignments for drivers and students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="dark:bg-blue-800 bg-blue-500 dark:border-blue-700 border-blue-300 p-6 text-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <MapPin className="w-8 h-8 text-blue-100 mx-auto mb-3" />
              <h3 className="text-3xl font-bold dark:text-white text-white mb-1">{stats.totalRoutes}</h3>
              <p className="text-blue-100 font-semibold mb-2">Total Routes</p>
              <div className="text-sm dark:text-blue-200 text-blue-50 dark:bg-blue-900 bg-blue-600 px-3 py-1 rounded-full">
                {stats.assignedRoutes} assigned
              </div>
            </Card>
            <Card className="dark:bg-green-800 bg-green-500 dark:border-green-700 border-green-300 p-6 text-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Users className="w-8 h-8 text-green-100 mx-auto mb-3" />
              <h3 className="text-3xl font-bold dark:text-white text-white mb-1">{stats.totalDrivers}</h3>
              <p className="text-green-100 font-semibold mb-2">Total Drivers</p>
              <div className="text-sm dark:text-green-200 text-green-50 dark:bg-green-900 bg-green-600 px-3 py-1 rounded-full">
                {stats.assignedDrivers} assigned
              </div>
            </Card>
            <Card className="dark:bg-purple-800 bg-purple-500 dark:border-purple-700 border-purple-300 p-6 text-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <UserCheck className="w-8 h-8 text-purple-100 mx-auto mb-3" />
              <h3 className="text-3xl font-bold dark:text-white text-white mb-1">{stats.totalAttenders}</h3>
              <p className="text-purple-100 font-semibold mb-2">Total Attenders</p>
              <div className="text-sm dark:text-purple-200 text-purple-50 dark:bg-purple-900 bg-purple-600 px-3 py-1 rounded-full">
                {stats.assignedAttenders} assigned
              </div>
            </Card>
            <Card className="dark:bg-orange-800 bg-orange-500 dark:border-orange-700 border-orange-300 p-6 text-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Bus className="w-8 h-8 text-orange-100 mx-auto mb-3" />
              <h3 className="text-3xl font-bold dark:text-white text-white mb-1">{stats.activeAssignments}</h3>
              <p className="text-orange-100 font-semibold mb-2">Total Assignments</p>
              <div className="text-sm dark:text-orange-200 text-orange-50 dark:bg-orange-900 bg-orange-600 px-3 py-1 rounded-full">
                All assignments today
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes, drivers, or attenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 dark:bg-slate-700/50 dark:border-slate-600 bg-white border-gray-300 border rounded-lg dark:text-white dark:placeholder-gray-400 text-gray-800 placeholder-gray-500 focus:outline-none dark:focus:ring-2 dark:focus:ring-yellow-500 dark:focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-md"
              />
            </div>
            <button 
              onClick={() => {
                resetForm();
                setEditingAssignment(null);
                setShowModal(true);
              }}
              disabled={createLoading}
              className="px-6 py-3 bg-gradient-to-r dark:from-yellow-500 dark:to-orange-500 dark:text-slate-900 from-blue-500 to-blue-600 text-white font-semibold rounded-lg dark:hover:from-yellow-600 dark:hover:to-orange-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              New Assignment
            </button>
          </div>

          <Card className="dark:bg-slate-800/60 dark:border-slate-700 bg-white border-gray-200 overflow-hidden rounded-xl shadow-lg">
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
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-800 font-semibold">Route</th>
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-800 font-semibold">Driver</th>
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-800 font-semibold">Attender</th>
                      <th className="text-left py-3 px-4 dark:text-gray-300 text-gray-800 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAssignments.map((assignment) => {
                      const route = routes.find(r => r.smRouteId === assignment.smRouteId);
                      const driver = drivers.find(d => d.smDriverId === assignment.smDriverID);
                      const attender = attenders.find(a => a.smAttenderId === assignment.smAttenderId);

                      return (
                        <tr 
                          key={assignment.id} 
                          className={`border-b dark:border-slate-600/50 border-gray-300/50 dark:hover:bg-slate-700/30 hover:bg-gray-50 transition-colors ${
                            assignment.isOptimistic ? 'opacity-75' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-500" />
                              <span className="dark:text-white text-gray-800 font-medium">{route?.routeName || 'No Route'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-green-500" />
                              <span className="dark:text-gray-300 text-gray-700">{driver?.user?.username || 'No Driver'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <UserCheck className="w-5 h-5 text-purple-500" />
                              <span className="dark:text-gray-300 text-gray-700">{attender?.user?.username || 'No Attender'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEdit(assignment)}
                                disabled={updateLoading || assignment.isOptimistic}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm flex items-center gap-1 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="w-4 h-4 text-white" />
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  setDeleteId(assignment.id);
                                  setShowDeleteConfirm(true);
                                }}
                                disabled={deleteLoading || assignment.isOptimistic}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm flex items-center gap-1 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
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

      {showModal && (
        <>
          {(createLoading || updateLoading) && <SkeletonModal />}
          {!(createLoading || updateLoading) && (
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

                {/* Display general error message */}
                {formErrors.general && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{formErrors.general}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-2">
                      Route <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setShowRouteDropdown(!showRouteDropdown);
                          if (editingAssignment && !showRouteDropdown) {
                            setRouteSearch('');
                          }
                        }}
                        className={`w-full px-4 py-3 dark:bg-slate-700/90 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-xl dark:text-white text-gray-800 flex items-center justify-between cursor-pointer dark:hover:bg-slate-700 hover:bg-gray-200 transition-all duration-200 shadow-md ${
                          formErrors.route ? 'border-red-500 dark:border-red-500' : ''
                        }`}
                      >
                        <span className="dark:text-gray-200 text-gray-700">{routeSearch || 'Select Route'}</span>
                        <ChevronDown className={`w-5 h-5 dark:text-gray-400 text-gray-500 transition-transform duration-200 ${showRouteDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      {formErrors.route && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.route}</p>
                      )}
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
                                  // Clear route error when route is selected
                                  if (formErrors.route) {
                                    setFormErrors(prev => ({ ...prev, route: '' }));
                                  }
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b last:border-b-0"
                              >
                                <div className="font-medium">{route.routeName}</div>
                                <div className="text-sm dark:text-gray-400 text-gray-600">{route.smRouteId}</div>
                              </div>
                            ))}
                            {filteredRoutes.length === 0 && (
                              <div className="px-4 py-3 dark:text-gray-400 text-gray-600 text-sm">
                                {routeSearch ? 'No routes found matching your search' : 'No available routes found'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-2">Driver (Optional)</label>
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setShowDriverDropdown(!showDriverDropdown);
                          if (editingAssignment && !showDriverDropdown) {
                            setDriverSearch('');
                          }
                        }}
                        className="w-full px-4 py-3 dark:bg-slate-700/90 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-xl dark:text-white text-gray-800 flex items-center justify-between cursor-pointer dark:hover:bg-slate-700 hover:bg-gray-200 transition-all duration-200 shadow-md"
                      >
                        <span className="dark:text-gray-200 text-gray-700">{driverSearch || 'Select Driver (Optional)'}</span>
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
                            {/* Add option to clear driver selection - only show during creation, not during update */}
                            {!editingAssignment && (
                              <div
                                onClick={() => {
                                  setFormData({...formData, smDriverID: ''});
                                  setDriverSearch('');
                                  setShowDriverDropdown(false);
                                  // Clear general error when selection changes
                                  if (formErrors.general) {
                                    setFormErrors(prev => ({ ...prev, general: '' }));
                                  }
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b italic"
                              >
                                Clear Selection
                              </div>
                            )}
                            {filteredDrivers.map((driver) => (
                              <div
                                key={driver.smDriverId}
                                onClick={() => {
                                  setFormData({...formData, smDriverID: driver.smDriverId});
                                  setDriverSearch(driver.user?.username || '');
                                  setShowDriverDropdown(false);
                                  // Clear general error when selection changes
                                  if (formErrors.general) {
                                    setFormErrors(prev => ({ ...prev, general: '' }));
                                  }
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b last:border-b-0"
                              >
                                <div className="font-medium">{driver.user?.username}</div>
                                <div className="text-sm dark:text-gray-400 text-gray-600">{driver.smDriverId}</div>
                              </div>
                            ))}
                            {filteredDrivers.length === 0 && (
                              <div className="px-4 py-3 dark:text-gray-400 text-gray-600 text-sm">
                                {driverSearch ? 'No drivers found matching your search' : 'No available drivers found'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium dark:text-gray-200 text-gray-700 mb-2">Attender (Optional)</label>
                    <div className="relative">
                      <div 
                        onClick={() => {
                          setShowAttenderDropdown(!showAttenderDropdown);
                          if (editingAssignment && !showAttenderDropdown) {
                            setAttenderSearch('');
                          }
                        }}
                        className="w-full px-4 py-3 dark:bg-slate-700/90 dark:border-slate-600 bg-gray-100 border-gray-300 border rounded-xl dark:text-white text-gray-800 flex items-center justify-between cursor-pointer dark:hover:bg-slate-700 hover:bg-gray-200 transition-all duration-200 shadow-md"
                      >
                        <span className="dark:text-gray-200 text-gray-700">{attenderSearch || 'Select Attender (Optional)'}</span>
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
                            {/* Add option to clear attender selection - only show during creation, not during update */}
                            {!editingAssignment && (
                              <div
                                onClick={() => {
                                  setFormData({...formData, smAttenderId: ''});
                                  setAttenderSearch('');
                                  setShowAttenderDropdown(false);
                                  // Clear general error when selection changes
                                  if (formErrors.general) {
                                    setFormErrors(prev => ({ ...prev, general: '' }));
                                  }
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b italic"
                              >
                                Clear Selection
                              </div>
                            )}
                            {filteredAttenders.map((attender) => (
                              <div
                                key={attender.smAttenderId}
                                onClick={() => {
                                  setFormData({...formData, smAttenderId: attender.smAttenderId});
                                  setAttenderSearch(attender.user?.username || '');
                                  setShowAttenderDropdown(false);
                                  // Clear general error when selection changes
                                  if (formErrors.general) {
                                    setFormErrors(prev => ({ ...prev, general: '' }));
                                  }
                                }}
                                className="px-4 py-3 dark:hover:bg-slate-600 hover:bg-gray-100 cursor-pointer dark:text-white text-gray-800 transition-colors duration-150 dark:border-slate-600/30 border-gray-300/30 border-b last:border-b-0"
                              >
                                <div className="font-medium">{attender.user?.username}</div>
                                <div className="text-sm dark:text-gray-400 text-gray-600">{attender.smAttenderId}</div>
                              </div>
                            ))}
                            {filteredAttenders.length === 0 && (
                              <div className="px-4 py-3 dark:text-gray-400 text-gray-600 text-sm">
                                {attenderSearch ? 'No attenders found matching your search' : 'No available attenders found'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validation note */}
                  <div className="text-sm dark:text-gray-400 text-gray-600 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    <p><span className="font-medium">Note:</span> You must select at least one driver or attender along with a route to create an assignment.</p>
                    {editingAssignment && !hasFormChanges && (
                      <p className="mt-2 text-orange-600 dark:text-orange-400">
                        <span className="font-medium">Update Info:</span> Make changes to enable the update button.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingAssignment(null);
                        resetForm();
                      }}
                      className="px-6 py-3 dark:bg-gray-600 dark:text-white bg-gray-400 text-gray-800 rounded-xl dark:hover:bg-gray-500 hover:bg-gray-500 transition-all duration-200 font-medium shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading || updateLoading || (editingAssignment && !hasFormChanges)}
                      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-md ${
                        editingAssignment && !hasFormChanges
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r dark:from-yellow-500 dark:to-orange-500 dark:text-slate-900 from-blue-500 to-blue-600 text-white dark:hover:from-yellow-600 dark:hover:to-orange-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {editingAssignment ? 
                        (hasFormChanges ? 'Update Assignment' : 'No Changes to Update') : 
                        'Create Assignment'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

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
                disabled={deleteLoading}
                className="px-6 py-3 dark:bg-gray-600 dark:text-white bg-gray-400 text-gray-800 rounded-xl dark:hover:bg-gray-500 hover:bg-gray-500 transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={deleteAssignment}
                disabled={deleteLoading}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`rounded-xl p-4 max-w-sm w-full shadow-xl transform transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteAssignPage;