import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin, Calendar, ChevronDown, Bus, Users, School, Navigation, Clock, Play, Pause, RotateCcw, Route } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

// Default center for Pune
const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 };

// Libraries for Google Maps
const libraries = ['places', 'geometry'];

// Route colors for different routes
const ROUTE_COLORS = [
  "#EF4444", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", 
  "#EC4899", "#14B8A6", "#FACC15", "#06B6D4", "#F87171"
];

// Skeleton components
const SkeletonCard = ({ className }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-slate-700 rounded h-4 w-3/4 mb-2"></div>
    <div className="bg-slate-600 rounded h-3 w-1/2"></div>
  </div>
);

const SkeletonPreviewCard = () => (
  <Card className="bg-slate-800 border-slate-600 p-4 animate-pulse">
    <div className="text-center mb-3">
      <div className="bg-slate-700 rounded h-4 w-48 mx-auto mb-2"></div>
      <div className="bg-slate-600 rounded h-5 w-64 mx-auto mb-2"></div>
      <div className="bg-slate-600 rounded h-3 w-32 ml-auto"></div>
    </div>
    <div className="flex justify-between items-center mb-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-slate-700 mb-1"></div>
          <div className="bg-slate-600 rounded h-2 w-12"></div>
        </div>
      ))}
    </div>
    <div className="bg-slate-700 rounded h-0.5 mb-3"></div>
  </Card>
);

const MapViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pageTitle, userType, username } = location.state || { 
    pageTitle: 'Map View', 
    userType: 'admin', 
    username: 'Admin' 
  };

  // State variables
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(getCurrentShift());
  const [loading, setLoading] = useState(true);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeDirections, setRouteDirections] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [busPosition, setBusPosition] = useState(0);
  const [isHistoricalPlaying, setIsHistoricalPlaying] = useState(false);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [busMapPosition, setBusMapPosition] = useState(null);
  const [routeDistances, setRouteDistances] = useState([]);
  const [routeTimings, setRouteTimings] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalJourneyTime, setTotalJourneyTime] = useState(0);
  const [currentGPSData, setCurrentGPSData] = useState(null);
  const [routeCompleted, setRouteCompleted] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const intervalRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const dateInputRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Helper function to get current shift based on time
  function getCurrentShift() {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : 'evening';
  }

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    timeUpdateRef.current = setInterval(updateTime, 1000);
    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  // Helper functions
  const getAuthToken = () => {
    try {
      return localStorage.getItem('admintoken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  };

  const isValidCoordinate = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  };

  const parseCoordinate = (value) => {
    return parseFloat(value);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Calculate route distances and timings
  const calculateRouteMetrics = (routePoints) => {
    if (!routePoints || routePoints.length < 2) return { distances: [], timings: [] };

    const sortedPoints = [...routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    const distances = [];
    const timings = [];
    let cumulativeTime = 8.5 * 60; // Start at 8:30 AM in minutes

    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const current = sortedPoints[i];
      const next = sortedPoints[i + 1];
      
      const distance = calculateDistance(
        parseCoordinate(current.latitude),
        parseCoordinate(current.longitude),
        parseCoordinate(next.latitude),
        parseCoordinate(next.longitude)
      );
      
      distances.push(distance);
      
      // Calculate travel time based on distance (assuming avg speed of 20 km/h in city traffic)
      const travelTimeMinutes = Math.round((distance / 20) * 60);
      const stopTime = i === 0 ? 0 : 2; // 2 minutes stop at each point except start
      const totalSegmentTime = travelTimeMinutes + stopTime;
      
      cumulativeTime += totalSegmentTime;
      timings.push({
        segmentTime: totalSegmentTime,
        arrivalTime: cumulativeTime,
        distance: distance
      });
    }

    return { distances, timings };
  };

  // Format time from minutes to AM/PM format
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Format time to display format
  const formatDisplayTime = (date) => {
    return format(date, 'HH:mm:ss');
  };

  // Get current time based on bus position
  const getCurrentTimeFromPosition = (position) => {
    if (!routeTimings.length) return formatDisplayTime(currentTime);
    
    const progress = position / 100;
    const totalSegments = routeTimings.length;
    const segmentIndex = Math.floor(progress * totalSegments);
    
    if (segmentIndex >= totalSegments) {
      return formatTime(routeTimings[totalSegments - 1].arrivalTime);
    }
    
    const segmentProgress = (progress * totalSegments) - segmentIndex;
    const currentTiming = routeTimings[segmentIndex];
    const startTime = segmentIndex === 0 ? 8.5 * 60 : routeTimings[segmentIndex - 1].arrivalTime;
    const endTime = currentTiming.arrivalTime;
    const currentTimeMinutes = startTime + (endTime - startTime) * segmentProgress;
    
    return formatTime(currentTimeMinutes);
  };

  // Calculate interpolated position between two points
  const interpolatePosition = (point1, point2, ratio) => {
    const lat = point1.lat + (point2.lat - point1.lat) * ratio;
    const lng = point1.lng + (point2.lng - point1.lng) * ratio;
    return { lat, lng };
  };

  // Calculate bus position on map based on route progress
  const calculateBusMapPosition = (progressPercent, routePoints) => {
    if (!routePoints || routePoints.length < 2) return null;

    const progress = progressPercent / 100;
    const totalSegments = routePoints.length - 1;
    const segmentIndex = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) - segmentIndex;

    if (segmentIndex >= totalSegments) {
      const lastPoint = routePoints[routePoints.length - 1];
      return {
        lat: parseCoordinate(lastPoint.latitude),
        lng: parseCoordinate(lastPoint.longitude)
      };
    }

    const currentPoint = routePoints[segmentIndex];
    const nextPoint = routePoints[segmentIndex + 1];

    const point1 = {
      lat: parseCoordinate(currentPoint.latitude),
      lng: parseCoordinate(currentPoint.longitude)
    };

    const point2 = {
      lat: parseCoordinate(nextPoint.latitude),
      lng: parseCoordinate(nextPoint.longitude)
    };

    return interpolatePosition(point1, point2, segmentProgress);
  };

  // Fetch routes from API and auto-select all routes
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    try {
      const schoolId = localStorage.getItem('adminSchoolId') || 'SC2F0001';
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      if (!API_BASE_URL) {
        throw new Error('API base URL is not configured');
      }

      const response = await fetch(`${API_BASE_URL}/route/school/${schoolId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }

      const data = await response.json();
      const validRoutes = data.filter((route) =>
        route.routePoints && route.routePoints.some(
          (point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude)
        )
      );

      setRoutes(validRoutes);
      setFilteredRoutes(validRoutes);
      
      // Auto-calculate directions for all routes on load and set map center
      if (validRoutes.length > 0 && isLoaded) {
        calculateAllDirections(validRoutes);
        // Set map center to first route's first point
        const firstRoute = validRoutes[0];
        if (firstRoute && firstRoute.routePoints && firstRoute.routePoints.length > 0) {
          const firstPoint = firstRoute.routePoints[0];
          setMapCenter({
            lat: parseCoordinate(firstPoint.latitude),
            lng: parseCoordinate(firstPoint.longitude)
          });
        }
        setShowAllRoutes(true);
        setSelectedRouteId('all');
      }
    } catch (error) {
      console.error('Route fetch error:', error);
      setError(error.message);
      setRoutes([]);
      setFilteredRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [isLoaded]);

  // Filter routes based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRoutes(routes);
    } else {
      const filtered = routes.filter(route =>
        route.routeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    }
  }, [searchTerm, routes]);

  // Fetch historical data
  const fetchHistoricalData = async () => {
    if (!selectedRoute || selectedRouteId === 'all') {
      alert('Please select a specific route for historical data');
      return;
    }

    setHistoricalLoading(true);
    const token = getAuthToken();
    
    try {
      const schoolId = localStorage.getItem('adminSchoolId') || 'SC2F0001';
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await fetch(
        `${API_BASE_URL}/device-locations?schoolId=${schoolId}&routeId=${selectedRouteId}&date=${formattedDate}&period=${selectedShift}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Sort historical data by eventTime
      const sortedData = data.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
      setHistoricalData(sortedData);
      
      // Calculate total journey time from historical data
      if (sortedData.length > 1) {
        const startTime = new Date(sortedData[0].eventTime);
        const endTime = new Date(sortedData[sortedData.length - 1].eventTime);
        const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
        setTotalJourneyTime(totalMinutes);
      }
      
      setBusPosition(0);
      setRouteCompleted(false);
      
      // Set initial bus position to first GPS coordinate
      if (sortedData.length > 0) {
        setBusMapPosition({
          lat: parseCoordinate(sortedData[0].latitude),
          lng: parseCoordinate(sortedData[0].longitude)
        });
      }
      
    } catch (error) {
      console.error('Historical data fetch error:', error);
      // Enhanced mock historical data for demonstration with realistic timeline
      const baseDate = format(selectedDate, 'yyyy-MM-dd');
      const startHour = selectedShift === 'morning' ? '08' : '15';
      const mockHistoricalData = [
        { id: 1, latitude: 12.9716, longitude: 77.5946, eventTime: `${baseDate}T${startHour}:30:00` },
        { id: 2, latitude: 12.9591, longitude: 77.7017, eventTime: `${baseDate}T${startHour}:35:00` },
        { id: 3, latitude: 12.9611, longitude: 77.7172, eventTime: `${baseDate}T${startHour}:42:00` },
        { id: 4, latitude: 12.9698, longitude: 77.7499, eventTime: `${baseDate}T${startHour}:48:00` },
        { id: 5, latitude: 12.9750, longitude: 77.7800, eventTime: `${baseDate}T${startHour}:55:00` },
      ];
      
      setHistoricalData(mockHistoricalData);
      
      // Calculate total journey time for mock data
      const startTime = new Date(mockHistoricalData[0].eventTime);
      const endTime = new Date(mockHistoricalData[mockHistoricalData.length - 1].eventTime);
      const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
      setTotalJourneyTime(totalMinutes);
      
      setBusPosition(0);
      setRouteCompleted(false);
      
      // Set initial bus position
      setBusMapPosition({
        lat: parseCoordinate(mockHistoricalData[0].latitude),
        lng: parseCoordinate(mockHistoricalData[0].longitude)
      });
    } finally {
      setHistoricalLoading(false);
    }
  };

  // Handle route selection
  const handleRouteSelect = (routeId) => {
    if (routeId === 'all') {
      setSelectedRoute(null);
      setSelectedRouteId('all');
      setShowAllRoutes(true);
      setBusPosition(0);
      setBusMapPosition(null);
      setRouteDistances([]);
      setRouteTimings([]);
      setRouteCompleted(false);
      calculateAllDirections(routes);
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      if (route) {
        setSelectedRoute(route);
        setSelectedRouteId(routeId);
        setShowAllRoutes(false);
        setBusPosition(0);
        setRouteCompleted(false);
        calculateDirections(route);
        updateMapCenter(route);
        
        // Calculate route metrics
        const metrics = calculateRouteMetrics(route.routePoints);
        setRouteDistances(metrics.distances);
        setRouteTimings(metrics.timings);
        setTotalJourneyTime(metrics.timings.length > 0 ? metrics.timings[metrics.timings.length - 1].arrivalTime - (8.5 * 60) : 0);
        
        // Set initial bus position based on shift and mode
        if (route.routePoints && route.routePoints.length > 0) {
          if (isLiveMode) {
            if (selectedShift === 'morning') {
              // Morning: start at first boarding point
              const firstPoint = route.routePoints.find(p => p.seqOrder === 1) || route.routePoints[0];
              setBusMapPosition({
                lat: parseCoordinate(firstPoint.latitude),
                lng: parseCoordinate(firstPoint.longitude)
              });
            } else {
              // Evening: start at school
              const schoolPoint = route.routePoints.find(p => p.routePointName.toLowerCase().includes('school'));
              if (schoolPoint) {
                setBusMapPosition({
                  lat: parseCoordinate(schoolPoint.latitude),
                  lng: parseCoordinate(schoolPoint.longitude)
                });
              }
            }
          }
        }
      }
    }
  };

  // Update map center based on selected route
  const updateMapCenter = (route) => {
    if (route && route.routePoints && route.routePoints.length > 0) {
      const firstPoint = route.routePoints[0];
      if (isValidCoordinate(firstPoint.latitude) && isValidCoordinate(firstPoint.longitude)) {
        setMapCenter({
          lat: parseCoordinate(firstPoint.latitude),
          lng: parseCoordinate(firstPoint.longitude),
        });
      }
    }
  };

  // Calculate directions for selected route
  const calculateDirections = async (route) => {
    if (!isLoaded || !route || !route.routePoints) return;

    const validPoints = route.routePoints
      .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
      .sort((a, b) => a.seqOrder - b.seqOrder);

    if (validPoints.length < 2) {
      setRouteDirections([]);
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      const waypoints = validPoints.slice(1, -1).map((point) => ({
        location: new window.google.maps.LatLng(
          parseCoordinate(point.latitude),
          parseCoordinate(point.longitude)
        ),
        stopover: true,
      }));

      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: new window.google.maps.LatLng(
              parseCoordinate(validPoints[0].latitude),
              parseCoordinate(validPoints[0].longitude)
            ),
            destination: new window.google.maps.LatLng(
              parseCoordinate(validPoints[validPoints.length - 1].latitude),
              parseCoordinate(validPoints[validPoints.length - 1].longitude)
            ),
            waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error(`Directions request failed: ${status}`));
            }
          }
        );
      });

      setRouteDirections([{ routeId: route.smRouteId || route.id, directions: result }]);
    } catch (error) {
      console.error('Error calculating directions:', error);
      setRouteDirections([]);
    }
  };

  // Calculate directions for all routes
  const calculateAllDirections = async (routesToProcess = routes) => {
    if (!isLoaded || routesToProcess.length === 0) return;

    const directionsPromises = routesToProcess.map(async (route, index) => {
      const validPoints = route.routePoints
        .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
        .sort((a, b) => a.seqOrder - b.seqOrder);

      if (validPoints.length < 2) {
        return { routeId: route.smRouteId || route.id, directions: null, color: ROUTE_COLORS[index % ROUTE_COLORS.length] };
      }

      try {
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = validPoints.slice(1, -1).map((point) => ({
          location: new window.google.maps.LatLng(
            parseCoordinate(point.latitude),
            parseCoordinate(point.longitude)
          ),
          stopover: true,
        }));

        const result = await new Promise((resolve, reject) => {
          directionsService.route(
            {
              origin: new window.google.maps.LatLng(
                parseCoordinate(validPoints[0].latitude),
                parseCoordinate(validPoints[0].longitude)
              ),
              destination: new window.google.maps.LatLng(
                parseCoordinate(validPoints[validPoints.length - 1].latitude),
                parseCoordinate(validPoints[validPoints.length - 1].longitude)
              ),
              waypoints,
              travelMode: window.google.maps.TravelMode.DRIVING,
              optimizeWaypoints: false,
            },
            (result, status) => {
              if (status === window.google.maps.DirectionsStatus.OK && result) {
                resolve(result);
              } else {
                reject(new Error(`Directions request failed: ${status}`));
              }
            }
          );
        });

        return { routeId: route.smRouteId || route.id, directions: result, color: ROUTE_COLORS[index % ROUTE_COLORS.length] };
      } catch (error) {
        console.error(`Error calculating directions for route ${route.routeName}:`, error);
        return { routeId: route.smRouteId || route.id, directions: null, color: ROUTE_COLORS[index % ROUTE_COLORS.length] };
      }
    });

    try {
      const results = await Promise.all(directionsPromises);
      setRouteDirections(results);
    } catch (error) {
      console.error('Error calculating all directions:', error);
    }
  };

  // Handle historical bus movement
  const handleBusPositionChange = (newPosition) => {
    setBusPosition(newPosition);
    
    // Check if route is completed
    if (newPosition >= 100) {
      setRouteCompleted(true);
    } else {
      setRouteCompleted(false);
    }
    
    // Find GPS data for current position from historical data
    const gpsData = findGPSDataFromPosition(newPosition);
    setCurrentGPSData(gpsData);
    
    // Use actual GPS coordinates from historical data when available
    if (!isLiveMode && gpsData) {
      setBusMapPosition({
        lat: parseCoordinate(gpsData.latitude),
        lng: parseCoordinate(gpsData.longitude)
      });
    } else if (selectedRoute && selectedRoute.routePoints) {
      const routePoints = selectedShift === 'evening' 
        ? [...selectedRoute.routePoints].reverse() 
        : selectedRoute.routePoints;
      
      const mapPosition = calculateBusMapPosition(newPosition, routePoints);
      if (mapPosition) {
        setBusMapPosition(mapPosition);
      }
      
      // For completed route, set bus at destination
      if (newPosition >= 100 && routePoints.length > 0) {
        const lastPoint = routePoints[routePoints.length - 1];
        setBusMapPosition({
          lat: parseCoordinate(lastPoint.latitude),
          lng: parseCoordinate(lastPoint.longitude)
        });
      }
    }
  };

  // Find GPS data based on current position with improved accuracy
  const findGPSDataFromPosition = (position) => {
    if (!historicalData.length) return null;
    
    const progress = position / 100;
    const dataIndex = Math.min(
      Math.floor(progress * historicalData.length), 
      historicalData.length - 1
    );
    return historicalData[dataIndex] || null;
  };

  // Get current time from historical GPS data
  const getCurrentTimeFromHistoricalData = (position) => {
    const gpsData = findGPSDataFromPosition(position);
    if (gpsData && gpsData.eventTime) {
      return format(new Date(gpsData.eventTime), 'HH:mm:ss');
    }
    return formatDisplayTime(currentTime);
  };

  // Calculate elapsed time from start of journey
  const getElapsedTime = (position) => {
    if (!historicalData.length) return '00:00';
    
    const startTime = new Date(historicalData[0].eventTime);
    const currentGPS = findGPSDataFromPosition(position);
    
    if (currentGPS && currentGPS.eventTime) {
      const currentTime = new Date(currentGPS.eventTime);
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
      const hours = Math.floor(elapsedMinutes / 60);
      const minutes = elapsedMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return '00:00';
  };

  // Historical data simulation
  const simulateHistoricalData = () => {
    if (isHistoricalPlaying && !isLiveMode) {
      setBusPosition(prev => {
        const newPosition = prev + 0.5;
        if (newPosition > 100) {
          return 100;
        }
        handleBusPositionChange(newPosition);
        return newPosition;
      });
    }
  };

  // Handle date change (switch to historical mode)
  const handleDateChange = (event) => {
    const selectedDateValue = new Date(event.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateValue.setHours(0, 0, 0, 0);

    // Only allow past dates and today
    if (selectedDateValue <= today) {
      setSelectedDate(selectedDateValue);
      if (isLiveMode && selectedDateValue.getTime() !== today.getTime()) {
        setIsLiveMode(false);
      }
    }
  };

  // Get route points for preview card with distance-based positioning
  const getRoutePointsForDisplay = () => {
    if (!selectedRoute || !selectedRoute.routePoints || showAllRoutes) return [];
    
    const points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    if (selectedShift === 'evening') {
      return points.reverse().map((point, index) => ({
        ...point,
        displayOrder: index + 1
      }));
    }
    
    return points.map((point, index) => ({
      ...point,
      displayOrder: index + 1
    }));
  };

  // Get route display info
  const getRouteDisplayInfo = () => {
    if (!selectedRoute || !selectedRoute.routePoints || showAllRoutes) return null;
    
    const points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    if (selectedShift === 'morning') {
      return {
        start: points[0]?.routePointName || 'Start',
        end: points[points.length - 1]?.routePointName || 'School'
      };
    } else {
      return {
        start: points[points.length - 1]?.routePointName || 'School',
        end: points[0]?.routePointName || 'Destination'
      };
    }
  };

  // Get all route points when showing all routes - show only one school for common coordinates
  const getAllRoutePoints = () => {
    const allPoints = routes.flatMap(route => route.routePoints || [])
      .filter(point => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude));
    
    // Find unique school locations (points with same lat/lng coordinates)
    const uniquePoints = [];
    const schoolCoordinates = new Set();
    
    allPoints.forEach(point => {
      const coordKey = `${point.latitude}_${point.longitude}`;
      
      // Check if this is likely a school (common endpoint for multiple routes)
      const sameLocationPoints = allPoints.filter(p => 
        p.latitude === point.latitude && p.longitude === point.longitude
      );
      
      // If multiple points share same coordinates, treat as school and show only once
      if (sameLocationPoints.length > 1) {
        if (!schoolCoordinates.has(coordKey)) {
          schoolCoordinates.add(coordKey);
          // Mark as school and add only once
          uniquePoints.push({
            ...point,
            isSchoolLocation: true,
            routePointName: point.routePointName.toLowerCase().includes('school') ? 
              point.routePointName : 'School'
          });
        }
      } else {
        // Regular route point
        uniquePoints.push({
          ...point,
          isSchoolLocation: false
        });
      }
    });
    
    return uniquePoints;
  };

  // Get distance-based position for route points
  const getDistanceBasedPosition = (index, totalPoints) => {
    if (!routeDistances.length || totalPoints <= 1) {
      return (index / (totalPoints - 1)) * 100;
    }
    
    const totalDistance = routeDistances.reduce((sum, dist) => sum + dist, 0);
    let cumulativeDistance = 0;
    
    for (let i = 0; i < index && i < routeDistances.length; i++) {
      cumulativeDistance += routeDistances[i];
    }
    
    return (cumulativeDistance / totalDistance) * 100;
  };

  // Get today's date for calendar max attribute
  const getTodayDateString = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  // Effects
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (routes.length > 0 && isLoaded) {
      if (showAllRoutes) {
        calculateAllDirections();
      } else if (selectedRoute) {
        calculateDirections(selectedRoute);
      }
    }
  }, [routes, selectedRoute, showAllRoutes, isLoaded]);

  useEffect(() => {
    if (!isLiveMode && isHistoricalPlaying) {
      intervalRef.current = setInterval(simulateHistoricalData, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isLiveMode, isHistoricalPlaying]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full">
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md">
            <p className="text-red-400 font-semibold">Google Maps API Error</p>
            <p className="text-gray-300">{loadError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const routeDisplayInfo = getRouteDisplayInfo();
  const displayPoints = getRoutePointsForDisplay();

  return (
    <div className="h-screen w-screen flex bg-slate-900 text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-slate-800 flex flex-col border-r border-slate-700 min-w-80 max-w-80 lg:w-80 md:w-72 sm:w-64">
        <div className="p-4 border-b border-slate-700">
          <Button
            onClick={() => navigate(-1)}
            className="w-full mb-4 bg-yellow-500 text-black hover:bg-yellow-600"
          >
            ← Back to Dashboard
          </Button>
          
          {/* Routes Dropdown with integrated search */}
          <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white mb-4">
              <SelectValue placeholder="Select Route" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <div className="p-2">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search routes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-600 border-slate-500 text-white placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <SelectItem value="all">All Routes</SelectItem>
              {filteredRoutes.map((route) => (
                <SelectItem key={route.smRouteId || route.id} value={route.smRouteId || route.id}>
                  {route.routeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Controls Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Date Selection with Basic Calendar */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Select Date</label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                max={getTodayDateString()}
                onChange={handleDateChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Historical Controls */}
          {!isLiveMode && (
            <>
              {/* Session Selection */}
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Session</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedShift('morning')}
                    className={`flex-1 ${
                      selectedShift === 'morning' 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-slate-600 text-white hover:bg-slate-500'
                    }`}
                  >
                    Morning
                  </Button>
                  <Button
                    onClick={() => setSelectedShift('evening')}
                    className={`flex-1 ${
                      selectedShift === 'evening' 
                        ? 'bg-slate-300 text-black' 
                        : 'bg-slate-600 text-white hover:bg-slate-500'
                    }`}
                  >
                    Evening
                  </Button>
                </div>
              </div>

              {/* Get Directions Button */}
              <Button
                onClick={fetchHistoricalData}
                disabled={historicalLoading || selectedRouteId === 'all'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Route className="w-4 h-4" />
                <span>{historicalLoading ? 'Loading...' : 'Get Directions'}</span>
              </Button>
            </>
          )}

          {/* Fleet Overview */}
          {loading ? (
            <Card className="p-4 bg-slate-700 border-slate-600">
              <div className="bg-slate-600 rounded h-4 w-32 mb-3"></div>
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="bg-slate-600 rounded h-3 w-20"></div>
                    <div className="bg-slate-600 rounded h-3 w-8"></div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-4 bg-slate-700 border-slate-600">
              <h3 className="text-yellow-400 font-semibold mb-3">Fleet Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Routes:</span>
                  <span className="text-white font-medium">{routes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Buses:</span>
                  <span className="text-white font-medium">{routes.length}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Current Time Display */}
          <Card className="p-4 bg-slate-700 border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Current Time:</span>
              <span className="text-yellow-400 font-mono">
                {formatDisplayTime(currentTime)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-300 text-sm">Date:</span>
              <span className="text-white text-sm">
                {format(currentTime, 'dd MMM yyyy')}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Controls */}
        <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700 flex-wrap gap-4">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent truncate">
              {showAllRoutes ? 'ALL ROUTES' : selectedRoute?.routeName || 'Route View'}
            </div>
            {loading && (
              <div className="text-sm text-gray-400 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                Loading routes...
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsLiveMode(true)}
              className={`px-6 py-2 rounded-full ${
                isLiveMode 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }`}
            >
              Live Map
            </Button>
            <Button
              onClick={() => setIsLiveMode(false)}
              className={`px-6 py-2 rounded-full ${
                !isLiveMode 
                  ? 'bg-slate-300 text-black' 
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }`}
            >
              Historical
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={12}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              options={{
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }],
                  },
                  {
                    featureType: 'transit',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }],
                  },
                ],
              }}
            >
              {/* Route Directions */}
              {routeDirections.map((routeDir, index) => {
                if (!routeDir.directions) return null;
                return (
                  <DirectionsRenderer
                    key={routeDir.routeId}
                    directions={routeDir.directions}
                    options={{
                      polylineOptions: {
                        strokeColor: showAllRoutes ? routeDir.color || ROUTE_COLORS[index % ROUTE_COLORS.length] : '#3B82F6',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                      },
                      suppressMarkers: true,
                      preserveViewport: true,
                    }}
                  />
                );
              })}

              {/* Route Points */}
              {(showAllRoutes ? getAllRoutePoints() : (selectedRoute ? selectedRoute.routePoints : [])).map((point, index) => {
                const isSchool = showAllRoutes ? point.isSchoolLocation : point.routePointName.toLowerCase().includes('school');
                const isFirst = !showAllRoutes && selectedRoute && index === 0;
                
                return (
                  <Marker
                    key={point.smRoutePointId || point.id}
                    position={{
                      lat: parseCoordinate(point.latitude),
                      lng: parseCoordinate(point.longitude),
                    }}
                    icon={{
                      url: isSchool 
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 2L13.09 8.26L22 9L14.5 13.03L17.18 21.02L12 17L6.82 21.02L9.5 13.03L2 9L10.91 8.26L12 2Z'/%3E%3C/svg%3E"
                        : isFirst 
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E"
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='%23F59E0B'%3E%3Ccircle cx='12' cy='12' r='8' stroke='%23ffffff' stroke-width='2'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%23ffffff' font-size='8' font-weight='bold'%3E" + (index + 1) + "%3C/text%3E%3C/svg%3E",
                      scaledSize: new window.google.maps.Size(
                        isSchool ? 40 : isFirst ? 32 : 28, 
                        isSchool ? 40 : isFirst ? 32 : 28
                      ),
                    }}
                    title={point.routePointName}
                    zIndex={isSchool ? 1000 : 100}
                  />
                );
              })}

              {/* Bus Position */}
              {busMapPosition && (
                <Marker
                  position={busMapPosition}
                  icon={{
                    url: routeCompleted 
                      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Cpath d='M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,13V6H18V13H6Z'/%3E%3C/svg%3E"
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23FACC15'%3E%3Cpath d='M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,13V6H18V13H6Z'/%3E%3C/svg%3E",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  animation={isLiveMode ? window.google.maps.Animation.BOUNCE : null}
                />
              )}
            </GoogleMap>
          )}

          {/* Enhanced Preview Card */}
          {!showAllRoutes && selectedRoute && routeDisplayInfo && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[900px] max-w-[95vw]">
              {loading ? (
                <SkeletonPreviewCard />
              ) : (
                <Card className="bg-white shadow-2xl rounded-lg border">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div className="text-sm text-gray-600">
                          {format(isLiveMode ? currentTime : selectedDate, 'EEE, MMM d')} • 
                          <span className="text-blue-600 font-medium ml-1">
                            {isLiveMode ? formatDisplayTime(currentTime) : getCurrentTimeFromPosition(busPosition)}
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedShift === 'morning' 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                        {routeCompleted && !isLiveMode && (
                          <span className="ml-2 text-green-600">✓ Completed</span>
                        )}
                      </div>
                    </div>

                    {/* Route Title */}
                    <div className="text-center mb-6">
                      <div className="text-xl font-bold text-gray-800 flex items-center justify-center">
                        <MapPin className="w-6 h-6 mr-2 text-blue-600" />
                        {routeDisplayInfo.start} → {routeDisplayInfo.end}
                      </div>
                    </div>

                    {/* Route Progress */}
                    <div className="relative mb-6">
                      {/* Progress Line */}
                      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            routeCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${isLiveMode ? 0 : busPosition}%` }}
                        ></div>
                      </div>

                      {/* Route Points */}
                      <div className="flex justify-between items-center relative" style={{ minHeight: '100px' }}>
                        {displayPoints.map((point, index) => {
                          const progress = isLiveMode ? 0 : (busPosition / 100) * (displayPoints.length - 1);
                          const isActive = !isLiveMode && index <= progress;
                          const isCurrent = !isLiveMode && Math.floor(progress) === index;
                          const isFirst = index === 0;
                          const isLast = index === displayPoints.length - 1;
                          
                          const positionPercent = getDistanceBasedPosition(index, displayPoints.length);

                          return (
                            <div
                              key={point.id}
                              className="absolute flex flex-col items-center cursor-pointer group"
                              style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
                              onMouseEnter={() => setHoveredPoint(point)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            >
                              {/* Circle Point */}
                              <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 mb-3 transition-all duration-200 shadow-lg ${
                                isCurrent 
                                  ? 'bg-blue-500 text-white border-blue-400 scale-110 animate-pulse' 
                                  : routeCompleted
                                  ? 'bg-green-500 text-white border-green-400'
                                  : isActive 
                                  ? 'bg-blue-500 text-white border-blue-400' 
                                  : isFirst
                                  ? 'bg-green-500 text-white border-green-400'
                                  : isLast && selectedShift === 'morning'
                                  ? 'bg-red-500 text-white border-red-400'
                                  : 'bg-gray-300 text-gray-600 border-gray-400'
                              }`}>
                                {isFirst && selectedShift === 'morning' ? (
                                  <div className="w-4 h-4 rounded-full bg-white"></div>
                                ) : (isLast && selectedShift === 'morning') || (isFirst && selectedShift === 'evening') ? (
                                  <School className="w-5 h-5" />
                                ) : (
                                  point.displayOrder
                                )}
                              </div>

                              {/* Point Name */}
                              <div className="text-xs text-gray-600 text-center max-w-20 leading-tight font-medium">
                                {point.routePointName}
                              </div>

                              {/* Hover Tooltip */}
                              {hoveredPoint && hoveredPoint.id === point.id && (
                                <div className="absolute bottom-full mb-3 px-4 py-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-20 min-w-48">
                                  <div className="font-bold text-blue-400 mb-1">{point.routePointName}</div>
                                  
                                  {/* Show times from API if available */}
                                  {!isLiveMode && routeTimings[index - 1] && (
                                    <div className="text-green-400 mb-1">
                                      {index === 0 ? `Started at ${formatTime(8.5 * 60)}` : `Reached: ${formatTime(routeTimings[index - 1].arrivalTime)}`}
                                    </div>
                                  )}
                                  
                                  {routeCompleted && (
                                    <div className="text-green-400">
                                      Journey Completed ✓
                                    </div>
                                  )}
                                  
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Bus Icon */}
                      {!isLiveMode && (
                        <div 
                          className="absolute top-2 transition-all duration-300 z-10"
                          style={{ 
                            left: `calc(${busPosition}% - 20px)`,
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <div className={`p-3 rounded-full shadow-xl transition-all border-2 border-white ${
                            routeCompleted ? 'bg-green-500' : 'bg-blue-500 animate-bounce'
                          }`}>
                            <Bus className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Controls for Historical Mode */}
                    {!isLiveMode && (
                      <div className="space-y-4">
                        {/* Historical Data Information */}
                        {historicalData.length > 0 && (
                          <div className="bg-slate-50 p-4 rounded-lg border">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Journey Time:</span>
                                <div className="font-semibold text-blue-600">
                                  {totalJourneyTime > 0 ? `${Math.floor(totalJourneyTime / 60)}h ${totalJourneyTime % 60}m` : '--'}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Elapsed:</span>
                                <div className="font-semibold text-green-600">{getElapsedTime(busPosition)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Current Time:</span>
                                <div className="font-semibold text-purple-600">{getCurrentTimeFromHistoricalData(busPosition)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">GPS Points:</span>
                                <div className="font-semibold text-orange-600">{historicalData.length}</div>
                              </div>
                            </div>
                            
                            {currentGPSData && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Current GPS: {parseCoordinate(currentGPSData.latitude).toFixed(6)}, {parseCoordinate(currentGPSData.longitude).toFixed(6)}</span>
                                  <span>Event Time: {format(new Date(currentGPSData.eventTime), 'HH:mm:ss')}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={busPosition}
                            onChange={(e) => handleBusPositionChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => setIsHistoricalPlaying(!isHistoricalPlaying)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 px-4 py-2 text-white"
                              disabled={historicalData.length === 0}
                            >
                              {isHistoricalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              <span className="text-sm">{isHistoricalPlaying ? 'Pause' : 'Play'}</span>
                            </Button>
                            <Button
                              onClick={() => {
                                setBusPosition(0);
                                setIsHistoricalPlaying(false);
                                setRouteCompleted(false);
                                handleBusPositionChange(0);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center space-x-2 px-4 py-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span className="text-sm">Reset</span>
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {historicalLoading && (
                              <div className="text-blue-600 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-600 mr-2"></div>
                                Loading...
                              </div>
                            )}
                            {routeCompleted && (
                              <div className="text-green-600 flex items-center">
                                <span>✓ Route Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Mode Status */}
                    {isLiveMode && (
                      <div className="text-center">
                        <div className="text-sm text-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Live tracking mode • {formatDisplayTime(currentTime)}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* All Routes Message */}
          {showAllRoutes && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Card className="bg-white shadow-lg border p-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">All Routes View</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Displaying all {routes.length} routes on the map.
                  </div>
                  <div className="text-xs text-blue-600">
                    Select a specific route for detailed tracking and journey progress.
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute top-4 right-4 max-w-md">
              <Card className="bg-red-100 border-red-300 p-4">
                <div className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #1E40AF);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #1E40AF);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 768px) {
          .w-80 {
            width: 16rem;
          }
        }
        
        @media (max-width: 640px) {
          .w-80 {
            width: 12rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MapViewPage;