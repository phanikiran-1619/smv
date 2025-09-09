import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Calendar, ChevronDown } from 'lucide-react';

const SwipedListPage = () => {
  const location = useLocation();
  const { username } = location.state || { username: 'Super Admin' };
  
  const [formData, setFormData] = useState({
    schoolId: '',
    routeId: '',
    studentId: '',
    startDate: '09-09-2025',
    endDate: '09-09-2025',
    session: 'All',
    result: 'All'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Future API call will go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Form Card */}
          <Card className="bg-slate-800/80 border-yellow-400 border-2 p-8 rounded-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">Student Swiped List</h1>
              <p className="text-gray-300">Easily view and manage student swipe records.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* School ID */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  School ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.schoolId}
                    onChange={(e) => handleInputChange('schoolId', e.target.value)}
                  >
                    <option value="">Select School ID</option>
                    <option value="SCH001">SCH001 - Central High School</option>
                    <option value="SCH002">SCH002 - North Elementary</option>
                    <option value="SCH003">SCH003 - South Middle School</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Route ID */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Route ID <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.routeId}
                    onChange={(e) => handleInputChange('routeId', e.target.value)}
                  >
                    <option value="">No routes available</option>
                    <option value="RT001">RT001 - Main Street Route</option>
                    <option value="RT002">RT002 - Oak Avenue Route</option>
                    <option value="RT003">RT003 - Pine Road Route</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Student ID</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                  >
                    <option value="">No students available</option>
                    <option value="STU001">STU001 - John Smith</option>
                    <option value="STU002">STU002 - Emily Johnson</option>
                    <option value="STU003">STU003 - Michael Davis</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    placeholder="09-09-2025"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">End Date</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    placeholder="09-09-2025"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Session */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Session</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.session}
                    onChange={(e) => handleInputChange('session', e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Result */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Result</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 transition-colors"
                    value={formData.result}
                    onChange={(e) => handleInputChange('result', e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Results Section - Future Data Display */}
            <div className="border-t border-slate-600 pt-6 mt-6">
              <div className="text-center text-gray-400">
                <p className="mb-2">Results will be displayed here</p>
                <p className="text-sm">Configure filters above and click Submit to view swipe records</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SwipedListPage;