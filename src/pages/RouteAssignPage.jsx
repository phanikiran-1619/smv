import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { 
  MapPin, Users, Bus, UserCheck, 
  Plus, Search, ChevronDown, X, Trash2, Edit
} from 'lucide-react';

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
  const getSchoolId = () => localStorage.getItem("adminSchoolId");

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

      const [routesData, driversData, attendersData, assignmentsData] = await Promise.all([
        makeApiCall(`${API_BASE_URL}/route/school/${schoolId}`),
        makeApiCall(`${API_BASE_URL}/driver/school/${schoolId}`),
        makeApiCall(`${API_BASE_URL}/attender/school/${schoolId}`),
        makeApiCall(`${API_BASE_URL}/assignments/active?schoolId=${schoolId}&date=${new Date().toISOString().split('T')[0]}`)
      ]);

      setRoutes(routesData || []);
      setDrivers(driversData || []);
      setAttenders(attendersData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRoutes([]);
      setDrivers([]);
      setAttenders([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new assignment
  const createAssignment = async () => {
    try {
      await makeApiCall(`${API_BASE_URL}/assignments`, 'POST', formData);
      setShowModal(false);
      resetForm();
      fetchAllData();
      showNotification('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      showNotification('Failed to create assignment. Please try again.', 'error');
    }
  };

  // Update assignment
  const updateAssignment = async () => {
    try {
      await makeApiCall(`${API_BASE_URL}/assignments/${editingAssignment.id}`, 'PUT', formData);
      setShowModal(false);
      setEditingAssignment(null);
      resetForm();
      fetchAllData();
      showNotification('Assignment updated successfully!');
    } catch (error) {
      console.error('Error updating assignment:', error);
      showNotification('Failed to update assignment. Please try again.', 'error');
    }
  };

  // Delete assignment
  const deleteAssignment = async () => {
    try {
      await makeApiCall(`${API_BASE_URL}/assignments/${deleteId}`, 'DELETE');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      fetchAllData();
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

  // Filter functions
  const filteredRoutes = routes.filter(route =>
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

  // Calculate stats
  const totalRoutes = routes.length;
  const totalDrivers = drivers.length;
  const totalAttenders = attenders.length;
  const activeAssignments = assignments.length;

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400 text-lg">Loading Route Assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
              {pageTitle}
            </h1>
            <p className="text-gray-300 text-lg">Manage route assignments for drivers and students</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 p-6 text-center rounded-xl shadow-lg">
              <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">{totalRoutes}</h3>
              <p className="text-blue-300">Total Routes</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 p-6 text-center rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">{totalDrivers}</h3>
              <p className="text-green-300">Total Drivers</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 p-6 text-center rounded-xl shadow-lg">
              <UserCheck className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">{totalAttenders}</h3>
              <p className="text-purple-300">Total Attenders</p>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 p-6 text-center rounded-xl shadow-lg">
              <Bus className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-white">{activeAssignments}</h3>
              <p className="text-orange-300">Active Assignments</p>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search routes or drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button 
              onClick={() => {
                resetForm();
                setEditingAssignment(null);
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Assignment
            </button>
          </div>

          {/* Assignments Table */}
          <Card className="bg-slate-800/60 border-slate-700 overflow-hidden rounded-xl shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Current Route Assignments</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Route</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Driver</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Attender</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment) => {
                      const route = routes.find(r => r.smRouteId === assignment.smRouteId);
                      const driver = drivers.find(d => d.smDriverId === assignment.smDriverID);
                      const attender = attenders.find(a => a.smAttenderId === assignment.smAttenderId);

                      return (
                        <tr key={assignment.id} className="border-b border-slate-600/50 hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-400" />
                              <span className="text-white font-medium">{route?.routeName || 'Unknown Route'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-green-400" />
                              <span className="text-gray-300">{driver?.user?.username || 'Unknown Driver'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <UserCheck className="w-5 h-5 text-purple-400" />
                              <span className="text-gray-300">{attender?.user?.username || 'Unknown Attender'}</span>
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
                {filteredAssignments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No assignments found for today.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingAssignment ? 'Edit Assignment' : 'New Assignment'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAssignment(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Route</label>
                <div className="relative">
                  <div 
                    onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                    className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-lg text-white flex items-center justify-between cursor-pointer hover:bg-slate-700/90 transition-all duration-200 shadow-sm"
                  >
                    <span className="text-gray-200">{routeSearch || 'Select Route'}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                  {showRouteDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg max-h-64 shadow-xl">
                      <div className="px-4 py-3 sticky top-0 bg-slate-700">
                        <input
                          type="text"
                          placeholder="Search routes..."
                          value={routeSearch}
                          onChange={(e) => setRouteSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
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
                            className="px-4 py-3 hover:bg-slate-600 cursor-pointer text-white transition-colors duration-150"
                          >
                            {route.routeName}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Driver</label>
                <div className="relative">
                  <div 
                    onClick={() => setShowDriverDropdown(!showDriverDropdown)}
                    className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-lg text-white flex items-center justify-between cursor-pointer hover:bg-slate-700/90 transition-all duration-200 shadow-sm"
                  >
                    <span className="text-gray-200">{driverSearch || 'Select Driver'}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                  {showDriverDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg max-h-64 shadow-xl">
                      <div className="px-4 py-3 sticky top-0 bg-slate-700">
                        <input
                          type="text"
                          placeholder="Search drivers..."
                          value={driverSearch}
                          onChange={(e) => setDriverSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
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
                            className="px-4 py-3 hover:bg-slate-600 cursor-pointer text-white transition-colors duration-150"
                          >
                            {driver.user?.username}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Attender Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Attender</label>
                <div className="relative">
                  <div 
                    onClick={() => setShowAttenderDropdown(!showAttenderDropdown)}
                    className="w-full px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-lg text-white flex items-center justify-between cursor-pointer hover:bg-slate-700/90 transition-all duration-200 shadow-sm"
                  >
                    <span className="text-gray-200">{attenderSearch || 'Select Attender'}</span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                  {showAttenderDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-700 border border-slate-600 rounded-lg max-h-64 shadow-xl">
                      <div className="px-4 py-3 sticky top-0 bg-slate-700">
                        <input
                          type="text"
                          placeholder="Search attenders..."
                          value={attenderSearch}
                          onChange={(e) => setAttenderSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-200"
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
                            className="px-4 py-3 hover:bg-slate-600 cursor-pointer text-white transition-colors duration-150"
                          >
                            {attender.user?.username}
                          </div>
                        ))}
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
                  className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md"
                >
                  {editingAssignment ? 'Update' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-200 mb-6">Are you sure you want to delete this assignment?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all duration-200 font-medium shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={deleteAssignment}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {notification.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className={`rounded-xl p-4 max-w-sm w-full mx-4 text-center shadow-xl ${
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