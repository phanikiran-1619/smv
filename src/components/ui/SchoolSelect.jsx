import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchableSelect from './SearchableSelect';
import { getToken } from '../../lib/token';

const SchoolSelect = ({ value, onChange, error = false }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/school`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const schoolOptions = Array.isArray(response.data) 
        ? response.data.map(school => ({
            value: school.id,
            label: `${school.name} (${school.id})`
          }))
        : [];
      
      setSchools(schoolOptions);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-full bg-slate-700 dark:bg-slate-700 bg-gray-200 border border-slate-600 dark:border-slate-600 border-gray-300 rounded-lg animate-pulse"></div>
    );
  }

  return (
    <SearchableSelect
      options={schools}
      value={value}
      onValueChange={onChange}
      placeholder="Search and select a school..."
      searchPlaceholder="Search schools..."
      error={error}
    />
  );
};

export default SchoolSelect;