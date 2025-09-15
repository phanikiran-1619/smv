import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';

const RouteSelect = ({ schoolId, value, onChange, error = false, disabled = false }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (schoolId) {
      fetchRoutes();
    } else {
      setRoutes([]);
    }
  }, [schoolId]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("superadmintoken");
      const response = await fetch(`${API_BASE_URL}/route/school/${schoolId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const routeOptions = Array.isArray(data) 
          ? data.map(route => ({
              value: route.id.toString(),
              label: `${route.routeName} (${route.smRouteId || route.id})`
            }))
          : [];
        
        setRoutes(routeOptions);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-full bg-gray-300 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <SearchableSelect
      options={routes}
      value={value}
      onValueChange={onChange}
      placeholder={schoolId ? "Search and select a route..." : "Select school first"}
      searchPlaceholder="Search routes..."
      error={error}
      disabled={disabled || !schoolId}
    />
  );
};

export default RouteSelect;