import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ParentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = location.state || { username: 'Parent User' };
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('parenttoken');
        
        if (!token) {
          console.error("No token found");
          navigate('/login');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parent/student`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Client-Type": "web",
          },
        });

        setStudents(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  const handleTrackStudent = (studentName, routeId) => {
    navigate('/student-map', { 
      state: { 
        studentName, 
        userType: 'parent',
        username,
        routeId
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
      <Navbar />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-800 mb-2">Select a Student</h1>
            <p className="dark:text-gray-300 text-gray-600">Choose a student to track their route.</p>
            <p className="dark:text-yellow-500 text-blue-600 text-sm mt-2">Welcome, {username}</p>
          </div>

          {/* Student Cards */}
          {isLoading ? (
            <div className="flex justify-center">
              <div className="dark:text-yellow-500 text-blue-600">Loading students...</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {students.map((student, index) => (
                <Card key={index} className="dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 p-6 text-center dark:hover:bg-slate-700/50 hover:bg-gray-100/50 transition-all duration-200 cursor-pointer transform hover:scale-105">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-3xl border-4 border-orange-300">
                      {student.gender.toLowerCase() === 'female' ? '👧' : '👦'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold dark:text-white text-gray-800 mb-2">{`${student.firstName} ${student.lastName}`}</h3>
                  <div className="dark:text-gray-300 text-gray-600 text-sm space-y-1 mb-4">
                    <p>Age: {student.age} | Gender: {student.gender}</p>
                    <p className="dark:text-gray-400 text-gray-500">Route ID: {student.routeId}</p>
                  </div>
                  <Button 
                    onClick={() => handleTrackStudent(`${student.firstName} ${student.lastName}`, student.routeId)}
                    className="w-full dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-black bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    Track Student
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;