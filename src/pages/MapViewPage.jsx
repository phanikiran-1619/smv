import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin, Calendar, ChevronDown, Bus, Users, School, Navigation, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
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

// Mock route data for demonstration when no auth token
const mockRouteData = [
  {
    id: '1',
    smRouteId: 'RT2F0001',
    routeName: 'Hoodi → Whitefield',
    routePoints: [
      { id: 1, smRoutePointId: '1', routePointName: 'Hoodi Bus Stop', latitude: 12.9716, longitude: 77.5946, seqOrder: 1 },
      { id: 2, smRoutePointId: '2', routePointName: 'Marathahalli Bridge', latitude: 12.9591, longitude: 77.7017, seqOrder: 2 },
      { id: 3, smRoutePointId: '3', routePointName: 'Kundalahalli Gate', latitude: 12.9611, longitude: 77.7172, seqOrder: 3 },
      { id: 4, smRoutePointId: '4', routePointName: 'Whitefield School', latitude: 12.9698, longitude: 77.7499, seqOrder: 4 },
    ]
  },
  {
    id: '2', 
    smRouteId: 'RT2F0002',
    routeName: 'Koramangala → Brigade',
    routePoints: [
      { id: 5, smRoutePointId: '5', routePointName: 'Koramangala 5th Block', latitude: 12.9352, longitude: 77.6245, seqOrder: 1 },
      { id: 6, smRoutePointId: '6', routePointName: 'Sony World Signal', latitude: 12.9298, longitude: 77.6226, seqOrder: 2 },
      { id: 7, smRoutePointId: '7', routePointName: 'Brigade Road School', latitude: 12.9716, longitude: 77.6197, seqOrder: 3 },
    ]
  },
  {
    id: '3',
    smRouteId: 'RT2F0003', 
    routeName: 'Electronic City → Forum',
    routePoints: [
      { id: 8, smRoutePointId: '8', routePointName: 'Electronic City Phase 1', latitude: 12.8456, longitude: 77.6603, seqOrder: 1 },
      { id: 9, smRoutePointId: '9', routePointName: 'Silk Board Junction', latitude: 12.9165, longitude: 77.6229, seqOrder: 2 },
      { id: 10, smRoutePointId: '10', routePointName: 'Forum Mall School', latitude: 12.9279, longitude: 77.6271, seqOrder: 3 },
    ]
  }
];

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
          <div className="w-6 h-6 rounded-full bg-slate-700 mb-1"></div>
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
  const [routePath, setRoutePath] = useState([]);
  const [busMapPosition, setBusMapPosition] = useState(null);
  const [routeDistances, setRouteDistances] = useState([]);
  const [routeTimings, setRouteTimings] = useState([]);
  const [currentTime, setCurrentTime] = useState('08:30 AM');
  const [totalJourneyTime, setTotalJourneyTime] = useState(0);
  const [currentGPSData, setCurrentGPSData] = useState(null);
  
  // Refs
  const mapRef = useRef(null);
  const intervalRef = useRef(null);

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

  // Get current time based on bus position
  const getCurrentTimeFromPosition = (position) => {
    if (!routeTimings.length) return currentTime;
    
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

  // Find GPS data based on current position
  const findGPSDataFromPosition = (position) => {
    if (!historicalData.length) return null;
    
    const progress = position / 100;
    const dataIndex = Math.floor(progress * (historicalData.length - 1));
    return historicalData[dataIndex] || null;
  };

  // Fetch routes from API
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    if (!token) {
      console.log('No auth token found, using mock data');
      setRoutes(mockRouteData);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      const schoolId = localStorage.getItem('adminSchoolId') || 'SC2F0001';
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      if (!API_BASE_URL) {
        throw new Error('API base URL is not configured');
      }

      const response = await fetch(`${API_BASE_URL}/route/school/${schoolId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication failed, using mock data');
          setRoutes(mockRouteData);
          setError(null);
          setLoading(false);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch routes: ${response.statusText}`);
      }

      const data = await response.json();
      const validRoutes = data.filter((route) =>
        route.routePoints && route.routePoints.some(
          (point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude)
        )
      );

      setRoutes(validRoutes);
    } catch (error) {
      console.error('Route fetch error, using mock data:', error);
      setRoutes(mockRouteData);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch historical data
  const fetchHistoricalData = async () => {
    if (!selectedRoute || selectedRouteId === 'all') {
      alert('Please select a specific route for historical data');
      return;
    }

    setHistoricalLoading(true);
    const token = getAuthToken();
    
    if (!token) {
      // Mock historical data for demonstration
      const mockHistoricalData = [
        { id: 1, latitude: 12.9716, longitude: 77.5946, eventTime: "2025-06-25T08:30:00" },
        { id: 2, latitude: 12.9591, longitude: 77.7017, eventTime: "2025-06-25T08:45:00" },
        { id: 3, latitude: 12.9611, longitude: 77.7172, eventTime: "2025-06-25T09:00:00" },
        { id: 4, latitude: 12.9698, longitude: 77.7499, eventTime: "2025-06-25T09:15:00" },
      ];
      setHistoricalData(mockHistoricalData);
      setBusPosition(0);
      setHistoricalLoading(false);
      return;
    }

    try {
      const schoolId = localStorage.getItem('adminSchoolId') || 'SC2F0001';
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await fetch(
        `${API_BASE_URL}/device-locations?schoolId=${schoolId}&routeId=${selectedRouteId}&date=${formattedDate}&period=${selectedShift}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.statusText}`);
      }

      const data = await response.json();
      setHistoricalData(data);
      setBusPosition(0);
    } catch (error) {
      console.error('Historical data fetch error:', error);
      const mockHistoricalData = [
        { id: 1, latitude: 12.9716, longitude: 77.5946, eventTime: "2025-06-25T08:30:00" },
        { id: 2, latitude: 12.9591, longitude: 77.7017, eventTime: "2025-06-25T08:45:00" },
        { id: 3, latitude: 12.9611, longitude: 77.7172, eventTime: "2025-06-25T09:00:00" },
        { id: 4, latitude: 12.9698, longitude: 77.7499, eventTime: "2025-06-25T09:15:00" },
      ];
      setHistoricalData(mockHistoricalData);
      setBusPosition(0);
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
      calculateAllDirections();
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      if (route) {
        setSelectedRoute(route);
        setSelectedRouteId(routeId);
        setShowAllRoutes(false);
        setBusPosition(0);
        calculateDirections(route);
        updateMapCenter(route);
        
        // Calculate route metrics
        const metrics = calculateRouteMetrics(route.routePoints);
        setRouteDistances(metrics.distances);
        setRouteTimings(metrics.timings);
        setTotalJourneyTime(metrics.timings.length > 0 ? metrics.timings[metrics.timings.length - 1].arrivalTime - (8.5 * 60) : 0);
        
        // Set initial bus position for live mode
        if (isLiveMode && route.routePoints && route.routePoints.length > 0) {
          const firstPoint = route.routePoints[0];
          setBusMapPosition({
            lat: parseCoordinate(firstPoint.latitude),
            lng: parseCoordinate(firstPoint.longitude)
          });
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
  const calculateAllDirections = async () => {
    if (!isLoaded || routes.length === 0) return;

    const directionsPromises = routes.map(async (route, index) => {
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
    
    // Update current time based on position
    const timeFromPosition = getCurrentTimeFromPosition(newPosition);
    setCurrentTime(timeFromPosition);
    
    // Find GPS data for current position
    const gpsData = findGPSDataFromPosition(newPosition);
    setCurrentGPSData(gpsData);
    
    if (selectedRoute && selectedRoute.routePoints) {
      const routePoints = selectedShift === 'evening' 
        ? [...selectedRoute.routePoints].reverse() 
        : selectedRoute.routePoints;
      
      // Use GPS coordinates if available in historical mode
      if (!isLiveMode && gpsData) {
        setBusMapPosition({
          lat: parseCoordinate(gpsData.latitude),
          lng: parseCoordinate(gpsData.longitude)
        });
      } else {
        const mapPosition = calculateBusMapPosition(newPosition, routePoints);
        if (mapPosition) {
          setBusMapPosition(mapPosition);
        }
      }
    }
  };

  // Historical data simulation
  const simulateHistoricalData = () => {
    if (isHistoricalPlaying && !isLiveMode) {
      setBusPosition(prev => {
        const newPosition = prev + 0.5;
        if (newPosition > 100) {
          return 0;
        }
        handleBusPositionChange(newPosition);
        return newPosition;
      });
    }
  };

  // Handle date change (switch to historical mode)
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (isLiveMode) {
      setIsLiveMode(false);
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

  // Get all route points when showing all routes
  const getAllRoutePoints = () => {
    return routes.flatMap(route => route.routePoints || [])
      .filter(point => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude));
  };

  // Filter routes based on search term
  const filteredRoutes = routes.filter(route =>
    route.routeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Effects
  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (routes.length > 0) {
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
      <div className="w-80 bg-slate-800 flex flex-col border-r border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <Button
            onClick={() => navigate(-1)}
            className="w-full mb-4 bg-yellow-500 text-black hover:bg-yellow-600"
          >
            ← Back to Dashboard
          </Button>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Routes Dropdown */}
          <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white mb-4">
              <SelectValue placeholder="Select Route" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
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
          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
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

              {/* Submit Button */}
              <Button
                onClick={fetchHistoricalData}
                disabled={historicalLoading || selectedRouteId === 'all'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {historicalLoading ? 'Loading...' : 'Get Historical Data'}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="bg-slate-800 p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {showAllRoutes ? 'ALL ROUTES' : selectedRoute?.routeName || 'PUNE'}
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
                const isSchool = point.routePointName.toLowerCase().includes('school');
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
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23EF4444'%3E%3Cpath d='M12 2L13.09 8.26L22 9L14.5 13.03L17.18 21.02L12 17L6.82 21.02L9.5 13.03L2 9L10.91 8.26L12 2Z'/%3E%3C/svg%3E"
                        : isFirst 
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Cpath d='M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z'/%3E%3C/svg%3E"
                        : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23F59E0B'%3E%3Cpath d='M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z'/%3E%3C/svg%3E",
                      scaledSize: new window.google.maps.Size(
                        isSchool ? 32 : isFirst ? 28 : 24, 
                        isSchool ? 32 : isFirst ? 28 : 24
                      ),
                    }}
                    title={point.routePointName}
                  />
                );
              })}

              {/* Bus Position */}
              {busMapPosition && (
                <Marker
                  position={busMapPosition}
                  icon={{
                    url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23FACC15'%3E%3Cpath d='M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,13V6H18V13H6Z'/%3E%3C/svg%3E",
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
                <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600 shadow-2xl backdrop-blur-sm">
                  <div className="p-5">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <div className="text-sm text-gray-300">
                          {format(selectedDate, 'EEE, MMM d')} • <span className="text-yellow-400 font-medium">{currentTime}</span>
                        </div>
                        {!isLiveMode && totalJourneyTime > 0 && (
                          <div className="text-sm text-blue-400">
                            • Total: {Math.round(totalJourneyTime)} mins
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedShift === 'morning' 
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                      </div>
                    </div>

                    {/* Route Title */}
                    <div className="text-center mb-5">
                      <div className="text-xl font-bold text-white flex items-center justify-center">
                        <MapPin className="w-6 h-6 mr-2 text-yellow-400" />
                        {routeDisplayInfo.start} → {routeDisplayInfo.end}
                      </div>
                    </div>

                    {/* Enhanced Route Progress */}
                    <div className="relative mb-5">
                      <div className="flex justify-between items-center relative" style={{ minHeight: '80px' }}>
                        {displayPoints.map((point, index) => {
                          const progress = isLiveMode ? 0 : (busPosition / 100) * (displayPoints.length - 1);
                          const isActive = !isLiveMode && index <= progress;
                          const isCurrent = !isLiveMode && Math.floor(progress) === index;
                          const isFirst = index === 0;
                          const isLast = index === displayPoints.length - 1;
                          
                          // Calculate position based on distance
                          const positionPercent = getDistanceBasedPosition(index, displayPoints.length);
                          
                          // Get timing info for hover
                          const timingInfo = routeTimings[index - 1];
                          const arrivalTime = timingInfo ? formatTime(timingInfo.arrivalTime) : null;
                          const travelTime = timingInfo ? timingInfo.segmentTime : null;

                          return (
                            <div
                              key={point.id}
                              className="absolute flex flex-col items-center cursor-pointer group"
                              style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
                              onMouseEnter={() => setHoveredPoint(point)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            >
                              {/* Route Point Number (Above Line) */}
                              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 mb-2 transition-all duration-200 ${
                                isCurrent 
                                  ? 'bg-yellow-500 text-black border-yellow-400 scale-110 shadow-lg shadow-yellow-500/50' 
                                  : isActive 
                                  ? 'bg-blue-500 text-white border-blue-400' 
                                  : isFirst
                                  ? 'bg-green-500 text-white border-green-400'
                                  : isLast
                                  ? 'bg-red-500 text-white border-red-400'
                                  : 'bg-gray-600 text-gray-300 border-gray-500'
                              }`}>
                                {isFirst && selectedShift === 'morning' ? (
                                  <div className="w-4 h-4 rounded-full bg-green-200"></div>
                                ) : isLast && selectedShift === 'morning' ? (
                                  <School className="w-4 h-4" />
                                ) : isFirst && selectedShift === 'evening' ? (
                                  <School className="w-4 h-4" />
                                ) : (
                                  point.displayOrder
                                )}
                              </div>

                              {/* Route Point Name (Below Line) */}
                              <div className="text-xs text-gray-400 text-center mt-3 max-w-24 leading-tight font-medium">
                                {point.routePointName}
                              </div>

                              {/* Enhanced Hover Tooltip */}
                              {hoveredPoint && hoveredPoint.id === point.id && (
                                <div className="absolute bottom-full mb-3 px-3 py-2 bg-black bg-opacity-95 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-20 border border-gray-600">
                                  <div className="font-bold text-yellow-400">{point.routePointName}</div>
                                  {arrivalTime && (
                                    <div className="text-green-400 mt-1">
                                      {index === 0 ? `Started at ${arrivalTime}` : `Reached at ${arrivalTime}`}
                                    </div>
                                  )}
                                  {travelTime && index > 0 && (
                                    <div className="text-blue-400">
                                      Travel time: {travelTime} mins
                                    </div>
                                  )}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black border-opacity-95"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Enhanced Progress Line */}
                      <div className="absolute top-4 left-0 right-0 h-1 bg-gray-600 rounded-full mx-4">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-300 shadow-lg"
                          style={{ width: `${isLiveMode ? 0 : busPosition}%` }}
                        ></div>
                      </div>

                      {/* Enhanced Bus Icon */}
                      {!isLiveMode && (
                        <div 
                          className="absolute top-2 transition-all duration-300 z-10"
                          style={{ 
                            left: `calc(${busPosition}% - 12px)`,
                            transform: 'translateY(-50%)'
                          }}
                        >
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full shadow-xl hover:shadow-2xl transition-shadow animate-pulse border-2 border-white">
                            <Bus className="w-4 h-4 text-black" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Slider and Controls */}
                    {!isLiveMode && (
                      <div className="space-y-4">
                        <div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={busPosition}
                            onChange={(e) => handleBusPositionChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => setIsHistoricalPlaying(!isHistoricalPlaying)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 px-4 py-2"
                              disabled={historicalData.length === 0}
                            >
                              {isHistoricalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              <span className="text-sm">{isHistoricalPlaying ? 'Pause' : 'Play'}</span>
                            </Button>
                            <Button
                              onClick={() => {
                                setBusPosition(0);
                                setIsHistoricalPlaying(false);
                                handleBusPositionChange(0);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-white hover:bg-slate-700 flex items-center space-x-2 px-4 py-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span className="text-sm">Reset</span>
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            {currentGPSData && (
                              <div className="text-green-400">
                                GPS: {parseFloat(currentGPSData.latitude).toFixed(4)}, {parseFloat(currentGPSData.longitude).toFixed(4)}
                              </div>
                            )}
                            {historicalLoading && (
                              <div className="text-yellow-400 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b border-yellow-400 mr-2"></div>
                                Loading...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Mode Status */}
                    {isLiveMode && (
                      <div className="text-center">
                        <div className="text-sm text-green-400 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          Live tracking active • {currentTime}
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
              <Card className="bg-slate-800 border-slate-600 p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-2">All Routes View</div>
                  <div className="text-sm text-gray-300">
                    Showing all {routes.length} routes on the map. Select a specific route for detailed tracking.
                  </div>
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
          background: linear-gradient(45deg, #FACC15, #F59E0B);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.6);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FACC15, #F59E0B);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.6);
        }
      `}</style>
    </div>
  );
};

export default MapViewPage;