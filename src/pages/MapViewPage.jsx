import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin, Calendar, ChevronDown, Bus, Users, School, Navigation, Clock, Play, Pause, RotateCcw, Route, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

// Map container style - responsive
const mapContainerStyle = {
  width: '100%',
  height: '100%',
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
    <div className="dark:bg-slate-700 bg-gray-300 rounded h-4 w-3/4 mb-2"></div>
    <div className="dark:bg-slate-600 bg-gray-200 rounded h-3 w-1/2"></div>
  </div>
);

const SkeletonPreviewCard = () => (
  <Card className="dark:bg-slate-800 dark:border-slate-600 bg-white/80 border-gray-200 p-4 animate-pulse">
    <div className="text-center mb-3">
      <div className="dark:bg-slate-700 bg-gray-300 rounded h-4 w-48 mx-auto mb-2"></div>
      <div className="dark:bg-slate-600 bg-gray-200 rounded h-5 w-64 mx-auto mb-2"></div>
      <div className="dark:bg-slate-600 bg-gray-200 rounded h-3 w-32 ml-auto"></div>
    </div>
    <div className="flex justify-between items-center mb-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full dark:bg-slate-700 bg-gray-300 mb-1"></div>
          <div className="dark:bg-slate-600 bg-gray-200 rounded h-2 w-12"></div>
        </div>
      ))}
    </div>
    <div className="dark:bg-slate-700 bg-gray-300 rounded h-0.5 mb-3"></div>
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
  const [showHistoricalPreview, setShowHistoricalPreview] = useState(false);
  const [directionsRequested, setDirectionsRequested] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deviceTime, setDeviceTime] = useState(new Date());
  const [cardSize, setCardSize] = useState('normal'); // 'small', 'normal', 'large'
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const intervalRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const deviceTimeRef = useRef(null);
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

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('superadmintoken') || 
           localStorage.getItem('admintoken') || 
           localStorage.getItem('parenttoken') || '';
  };

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

  // Device time update from API
  useEffect(() => {
    const updateDeviceTime = async () => {
      try {
        // Get device time from API or fallback to local time
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
        if (API_BASE_URL) {
          const response = await fetch(`${API_BASE_URL}/device-time`, {
            headers: {
              'Authorization': `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setDeviceTime(new Date(data.currentTime));
          } else {
            setDeviceTime(new Date());
          }
        } else {
          setDeviceTime(new Date());
        }
      } catch (error) {
        console.error('Error fetching device time:', error);
        setDeviceTime(new Date());
      }
    };

    updateDeviceTime();
    deviceTimeRef.current = setInterval(updateDeviceTime, 30000); // Update every 30 seconds

    return () => {
      if (deviceTimeRef.current) {
        clearInterval(deviceTimeRef.current);
      }
    };
  }, []);

  // Fetch routes
  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      
      if (!API_BASE_URL) {
        throw new Error('API base URL not configured');
      }

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/routes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data = await response.json();
      const routesData = Array.isArray(data) ? data : data.routes || [];
      
      setRoutes(routesData);
      setFilteredRoutes(routesData);
      
      if (routesData.length > 0) {
        setMapCenter(DEFAULT_CENTER);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError(error.message);
      setRoutes([]);
      setFilteredRoutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch historical data
  const fetchHistoricalData = async () => {
    if (!selectedRoute || selectedRouteId === 'all') {
      alert('Please select a specific route first');
      return;
    }

    try {
      setHistoricalLoading(true);
      setDirectionsRequested(true);

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const token = getAuthToken();
      
      if (!API_BASE_URL) {
        throw new Error('API base URL not configured');
      }

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(
        `${API_BASE_URL}/gps/historical/${selectedRouteId}?date=${dateStr}&shift=${selectedShift}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch historical data');
      }

      const gpsData = await response.json();
      
      if (!gpsData || gpsData.length === 0) {
        alert('No GPS data found for the selected date and route');
        setHistoricalData([]);
        return;
      }

      setHistoricalData(gpsData);
      setBusPosition(0);
      setRouteCompleted(false);
      setShowHistoricalPreview(true);
      
      // Calculate route timings
      calculateRouteTimings(gpsData);

    } catch (error) {
      console.error('Error fetching historical data:', error);
      alert(error.message || 'Failed to fetch historical data');
    } finally {
      setHistoricalLoading(false);
    }
  };

  // Calculate directions for single route
  const calculateDirections = (route) => {
    if (!window.google || !route || !route.routePoints) return;

    const validPoints = route.routePoints
      .filter(point => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
      .sort((a, b) => a.seqOrder - b.seqOrder);

    if (validPoints.length < 2) return;

    const waypoints = validPoints.slice(1, -1).map(point => ({
      location: new window.google.maps.LatLng(
        parseCoordinate(point.latitude),
        parseCoordinate(point.longitude)
      ),
      stopover: true
    }));

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
      origin: new window.google.maps.LatLng(
        parseCoordinate(validPoints[0].latitude),
        parseCoordinate(validPoints[0].longitude)
      ),
      destination: new window.google.maps.LatLng(
        parseCoordinate(validPoints[validPoints.length - 1].latitude),
        parseCoordinate(validPoints[validPoints.length - 1].longitude)
      ),
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setRouteDirections([{
          routeId: route.smRouteId || route.id,
          directions: result,
          color: '#3B82F6'
        }]);
        
        // Calculate distances
        if (result.routes[0] && result.routes[0].legs) {
          const distances = result.routes[0].legs.map(leg => leg.distance.value / 1000);
          setRouteDistances(distances);
        }
      }
    });
  };

  // Calculate directions for all routes
  const calculateAllDirections = () => {
    if (!window.google || routes.length === 0) return;

    const allDirections = [];
    let completedRequests = 0;

    routes.forEach((route, index) => {
      if (!route.routePoints) return;

      const validPoints = route.routePoints
        .filter(point => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
        .sort((a, b) => a.seqOrder - b.seqOrder);

      if (validPoints.length < 2) return;

      const waypoints = validPoints.slice(1, -1).map(point => ({
        location: new window.google.maps.LatLng(
          parseCoordinate(point.latitude),
          parseCoordinate(point.longitude)
        ),
        stopover: true
      }));

      const directionsService = new window.google.maps.DirectionsService();
      
      setTimeout(() => {
        directionsService.route({
          origin: new window.google.maps.LatLng(
            parseCoordinate(validPoints[0].latitude),
            parseCoordinate(validPoints[0].longitude)
          ),
          destination: new window.google.maps.LatLng(
            parseCoordinate(validPoints[validPoints.length - 1].latitude),
            parseCoordinate(validPoints[validPoints.length - 1].longitude)
          ),
          waypoints: waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false
        }, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            allDirections.push({
              routeId: route.smRouteId || route.id,
              directions: result,
              color: ROUTE_COLORS[index % ROUTE_COLORS.length]
            });
          }
          
          completedRequests++;
          if (completedRequests === routes.length) {
            setRouteDirections(allDirections);
          }
        });
      }, index * 200); // Delay to avoid API rate limits
    });
  };

  // Handle route selection
  const handleRouteSelect = (routeId) => {
    setSelectedRouteId(routeId);
    
    if (routeId === 'all') {
      setSelectedRoute(null);
      setShowAllRoutes(true);
      setShowHistoricalPreview(false);
      setBusPosition(0);
      setHistoricalData([]);
      setRouteDirections([]);
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      setSelectedRoute(route);
      setShowAllRoutes(false);
      setShowHistoricalPreview(false);
      setBusPosition(0);
      setHistoricalData([]);
      setRouteDirections([]);
    }
  };

  // Handle search term change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRoutes(routes);
    } else {
      const filtered = routes.filter(route =>
        route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.smRouteId || route.id).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    }
  }, [searchTerm, routes]);

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    
    // Reset historical data when date changes
    if (!isLiveMode) {
      setHistoricalData([]);
      setBusPosition(0);
      setRouteCompleted(false);
      setShowHistoricalPreview(false);
      setDirectionsRequested(false);
    }
  };

  // Utility functions
  const isValidCoordinate = (coord) => {
    const num = parseFloat(coord);
    return !isNaN(num) && isFinite(num) && Math.abs(num) > 0.001;
  };

  const parseCoordinate = (coord) => {
    return parseFloat(coord) || 0;
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate route timings
  const calculateRouteTimings = (gpsData) => {
    if (!gpsData || gpsData.length === 0) return;

    const timings = [];
    const startTime = new Date(gpsData[0].eventTime);

    gpsData.forEach((point, index) => {
      const currentTime = new Date(point.eventTime);
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
      timings.push(elapsedMinutes);
    });

    setRouteTimings(timings);
    setTotalJourneyTime(Math.max(...timings));
  };

  // Format time for display
  const formatDisplayTime = (time) => {
    return format(time, 'HH:mm:ss');
  };

  // Sync bus position with map
  const syncBusPosition = (position) => {
    if (!selectedRoute || !selectedRoute.routePoints || !historicalData.length) return;

    const gpsData = findGPSDataFromPosition(position);
    if (gpsData) {
      setBusMapPosition({
        lat: parseCoordinate(gpsData.latitude),
        lng: parseCoordinate(gpsData.longitude)
      });
      setCurrentGPSData(gpsData);
      
      // Check if route is completed
      if (position >= 100) {
        setRouteCompleted(true);
        setIsHistoricalPlaying(false);
      }
    }
  };

  // Find GPS data from position percentage
  const findGPSDataFromPosition = (position) => {
    if (!historicalData.length) return null;
    
    const index = Math.floor((position / 100) * (historicalData.length - 1));
    return historicalData[Math.min(index, historicalData.length - 1)];
  };

  // Get reached time from historical data
  const getReachedTimeFromHistoricalData = (position) => {
    const gpsData = findGPSDataFromPosition(position);
    if (gpsData && gpsData.eventTime) {
      return format(new Date(gpsData.eventTime), 'HH:mm:ss');
    }
    return formatDisplayTime(deviceTime);
  };

  // Get reached date from historical GPS data
  const getReachedDateFromHistoricalData = (position) => {
    const gpsData = findGPSDataFromPosition(position);
    if (gpsData && gpsData.eventTime) {
      return format(new Date(gpsData.eventTime), 'EEE, MMM d');
    }
    return format(deviceTime, 'EEE, MMM d');
  };

  // Match route points with actual GPS coordinates and get arrival times
  const getRoutePointArrivalTime = (routePoint, historicalGPSData) => {
    if (!historicalGPSData || historicalGPSData.length === 0) return null;
    
    const routeLat = parseCoordinate(routePoint.latitude);
    const routeLng = parseCoordinate(routePoint.longitude);
    
    // Find the GPS point closest to this route point (within 10 meters)
    let closestPoint = null;
    let minDistance = Infinity;
    
    historicalGPSData.forEach(gpsPoint => {
      const gpsLat = parseCoordinate(gpsPoint.latitude);
      const gpsLng = parseCoordinate(gpsPoint.longitude);
      const distance = calculateDistance(routeLat, routeLng, gpsLat, gpsLng) * 1000; // Convert to meters
      
      if (distance < 10 && distance < minDistance) { // Within 10 meters
        minDistance = distance;
        closestPoint = gpsPoint;
      }
    });
    
    return closestPoint;
  };

  // Get reached time for a specific route point based on GPS proximity
  const getRoutePointReachedTime = (routePoint) => {
    if (!historicalData || historicalData.length === 0) return null;
    
    const closestGPS = getRoutePointArrivalTime(routePoint, historicalData);
    if (closestGPS && closestGPS.eventTime) {
      return format(new Date(closestGPS.eventTime), 'HH:mm:ss');
    }
    return null;
  };

  // Get device ID from historical data
  const getDeviceId = () => {
    if (historicalData && historicalData.length > 0) {
      return historicalData[0].deviceId || 'Unknown';
    }
    return 'Unknown';
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
          syncBusPosition(100);
          return 100;
        }
        syncBusPosition(newPosition);
        return newPosition;
      });
    }
  };

  // Get route points for preview card with proper evening shift handling
  const getRoutePointsForDisplay = () => {
    if (!selectedRoute || !selectedRoute.routePoints || showAllRoutes) return [];
    
    const points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    // For evening shift: reverse the order so school appears first, destination last
    if (selectedShift === 'evening') {
      return points.reverse().map((point, index) => ({
        ...point,
        displayOrder: index + 1,
        isSchoolPoint: index === 0, // First point in evening is school
        isDestinationPoint: index === points.length - 1 // Last point in evening is destination
      }));
    }
    
    // For morning shift: normal order
    return points.map((point, index) => ({
      ...point,
      displayOrder: index + 1,
      isSchoolPoint: index === points.length - 1, // Last point in morning is school
      isDestinationPoint: false
    }));
  };

  // Get route display info
  const getRouteDisplayInfo = () => {
    if (!selectedRoute || !selectedRoute.routePoints || showAllRoutes) return null;
    
    const points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    // Base display on actual route order, not session
    return {
      start: points[0]?.routePointName || 'Start',
      end: points[points.length - 1]?.routePointName || 'End'
    };
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

  // Get card size classes
  const getCardSizeClasses = () => {
    const baseSize = isCardExpanded ? 'large' : cardSize;
    switch (baseSize) {
      case 'small':
        return {
          container: 'w-[60vw] sm:w-[55vw] lg:w-[600px]',
          padding: 'p-2 sm:p-3 lg:p-4',
          text: 'text-xs lg:text-sm',
          title: 'text-sm lg:text-base',
          icon: 'w-3 h-3 lg:w-4 lg:h-4',
          circle: 'w-6 h-6 lg:w-8 lg:w-8',
          bus: 'w-2 h-2 lg:w-3 lg:h-3'
        };
      case 'large':
        return {
          container: 'w-[98vw] sm:w-[95vw] lg:w-[1200px]',
          padding: 'p-4 sm:p-6 lg:p-8',
          text: 'text-sm lg:text-base',
          title: 'text-lg lg:text-xl',
          icon: 'w-5 h-5 lg:w-6 lg:h-6',
          circle: 'w-10 h-10 lg:w-14 lg:h-14',
          bus: 'w-4 h-4 lg:w-6 lg:h-6'
        };
      default: // normal
        return {
          container: 'w-[85vw] sm:w-[80vw] lg:w-[900px]',
          padding: 'p-3 sm:p-4 lg:p-6',
          text: 'text-xs lg:text-sm',
          title: 'text-base lg:text-xl',
          icon: 'w-4 h-4 lg:w-5 lg:h-5',
          circle: 'w-8 h-8 lg:w-12 lg:h-12',
          bus: 'w-3 h-3 lg:w-5 lg:h-5'
        };
    }
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
      <div className="min-h-screen dark:bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full">
          <div className="text-center p-6 dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 rounded-lg shadow-md">
            <p className="text-red-400 font-semibold">Google Maps API Error</p>
            <p className="dark:text-gray-300 text-gray-600">{loadError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const routeDisplayInfo = getRouteDisplayInfo();
  const displayPoints = getRoutePointsForDisplay();
  const cardClasses = getCardSizeClasses();

  return (
    <div className="h-screen w-screen flex dark:bg-slate-900 dark:text-white bg-gray-100 text-gray-800 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 dark:bg-slate-800 dark:border-slate-600 bg-white/80 border-gray-200 rounded-lg dark:text-white text-gray-800 dark:hover:bg-slate-700 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left Sidebar - Responsive */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 
        w-80 sm:w-72 md:w-80 lg:w-80 xl:w-96 dark:bg-slate-800 bg-white/95 flex flex-col dark:border-slate-700 border-gray-200 border-r 
        transition-transform duration-300 ease-in-out h-full`}>
        
        {/* Close button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 dark:text-gray-400 dark:hover:text-white text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 dark:border-slate-700 border-gray-200 border-b">
          <Button
            onClick={() => navigate(-1)}
            className="w-full mb-4 dark:bg-yellow-500 dark:text-black dark:hover:bg-yellow-600 bg-blue-500 text-white hover:bg-blue-600 text-sm sm:text-base"
          >
            ← Back to Dashboard
          </Button>
          
          {/* Routes Dropdown with integrated search */}
          <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
            <SelectTrigger className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-gray-100 border-gray-300 text-gray-800 mb-4 text-sm">
              <SelectValue placeholder="Select Route" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-200">
              <div className="p-2">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-4 h-4" />
                  <Input
                    placeholder="Search routes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dark:bg-slate-600 dark:border-slate-500 dark:text-white dark:placeholder-gray-400 bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500 text-sm"
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
            <label className="text-sm font-medium dark:text-gray-300 text-gray-600 block mb-2">Select Date</label>
            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                max={getTodayDateString()}
                onChange={handleDateChange}
                className="w-full px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white bg-gray-100 border-gray-300 text-gray-800 rounded-md focus:outline-none dark:focus:ring-yellow-500 dark:focus:border-transparent focus:ring-blue-500 focus:border-transparent pl-10 text-sm"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-4 h-4" />
            </div>
          </div>

          {/* Historical Controls */}
          {!isLiveMode && (
            <>
              {/* Session Selection */}
              <div>
                <label className="text-sm font-medium dark:text-gray-300 text-gray-600 block mb-2">Session</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedShift('morning')}
                    className={`flex-1 text-xs sm:text-sm ${
                      selectedShift === 'morning' 
                        ? 'dark:bg-yellow-500 dark:text-black bg-blue-500 text-white' 
                        : 'dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Morning
                  </Button>
                  <Button
                    onClick={() => setSelectedShift('evening')}
                    className={`flex-1 text-xs sm:text-sm ${
                      selectedShift === 'evening' 
                        ? 'dark:bg-slate-300 dark:text-black bg-blue-500 text-white' 
                        : 'dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
              >
                <Route className="w-4 h-4" />
                <span>{historicalLoading ? 'Loading...' : 'Get Directions'}</span>
              </Button>
            </>
          )}

          {/* Fleet Overview */}
          {loading ? (
            <Card className="p-4 dark:bg-slate-700 dark:border-slate-600 bg-white/80 border-gray-200">
              <div className="dark:bg-slate-600 bg-gray-300 rounded h-4 w-32 mb-3"></div>
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between">
                    <div className="dark:bg-slate-600 bg-gray-300 rounded h-3 w-20"></div>
                    <div className="dark:bg-slate-600 bg-gray-300 rounded h-3 w-8"></div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-4 dark:bg-slate-700 dark:border-slate-600 bg-white/80 border-gray-200">
              <h3 className="dark:text-yellow-400 text-blue-600 font-semibold mb-3 text-sm">Fleet Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="dark:text-gray-300 text-gray-600">Total Routes:</span>
                  <span className="dark:text-white text-gray-800 font-medium">{routes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-300 text-gray-600">Buses:</span>
                  <span className="dark:text-white text-gray-800 font-medium">{routes.length}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Current Time Display */}
          <Card className="p-4 dark:bg-slate-700 dark:border-slate-600 bg-white/80 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="dark:text-gray-300 text-gray-600 text-sm">Current Time:</span>
              <span className="dark:text-yellow-400 text-blue-600 font-mono text-sm">
                {formatDisplayTime(deviceTime)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="dark:text-gray-300 text-gray-600 text-sm">Date:</span>
              <span className="dark:text-white text-gray-800 text-sm">
                {format(deviceTime, 'dd MMM yyyy')}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Controls */}
        <div className="dark:bg-slate-800 bg-white/95 p-3 lg:p-4 flex items-center justify-between dark:border-slate-700 border-gray-200 border-b flex-wrap gap-2 lg:gap-4">
          <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 ml-12 lg:ml-0">
            <div className="text-lg lg:text-2xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:to-orange-500 from-blue-500 to-blue-600 bg-clip-text text-transparent truncate">
              {showAllRoutes ? 'ALL ROUTES' : selectedRoute?.routeName || 'Route View'}
            </div>
            {loading && (
              <div className="text-xs lg:text-sm dark:text-gray-400 text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 dark:border-yellow-400 border-blue-500 mr-2"></div>
                Loading routes...
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsLiveMode(true)}
              className={`px-3 lg:px-6 py-2 rounded-full text-xs lg:text-sm ${
                isLiveMode 
                  ? 'dark:bg-yellow-500 dark:text-black bg-blue-500 text-white' 
                  : 'dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Live Map
            </Button>
            <Button
              onClick={() => setIsLiveMode(false)}
              className={`px-3 lg:px-6 py-2 rounded-full text-xs lg:text-sm ${
                !isLiveMode 
                  ? 'dark:bg-slate-300 dark:text-black bg-blue-500 text-white' 
                  : 'dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500 bg-gray-200 text-gray-700 hover:bg-gray-300'
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
              zoom={window.innerWidth < 768 ? 11 : 12}
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
                        strokeWeight: window.innerWidth < 768 ? 4 : 5,
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
                const markerSize = window.innerWidth < 768 ? (isSchool ? 32 : 24) : (isSchool ? 40 : 28);
                
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
                      scaledSize: new window.google.maps.Size(markerSize, markerSize),
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
                    scaledSize: new window.google.maps.Size(window.innerWidth < 768 ? 32 : 40, window.innerWidth < 768 ? 32 : 40),
                  }}
                  animation={isLiveMode ? window.google.maps.Animation.BOUNCE : null}
                />
              )}
            </GoogleMap>
          )}

          {/* Live Mode Preview Card - Always show when route is selected */}
          {isLiveMode && !showAllRoutes && selectedRoute && routeDisplayInfo && (
            <div className={`absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 ${cardClasses.container} max-w-[95vw]`}>
              <Card className="dark:bg-slate-800/90 dark:border-slate-600 bg-white shadow-2xl rounded-lg border border-gray-200">
                <div className={cardClasses.padding}>
                  {/* Header with resize controls */}
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Clock className={`${cardClasses.icon} dark:text-yellow-400 text-blue-600`} />
                      <div className={`${cardClasses.text} dark:text-gray-300 text-gray-600`}>
                        {format(deviceTime, 'EEE, MMM d')} • 
                        <span className="dark:text-yellow-400 text-blue-600 font-medium ml-1">
                          {formatDisplayTime(deviceTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Resize Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setCardSize('small')}
                          className={`p-1 rounded ${cardSize === 'small' ? 'dark:bg-yellow-500 dark:text-black bg-blue-500 text-white' : 'dark:bg-gray-600 dark:text-gray-300 bg-gray-200 text-gray-600'}`}
                          title="Small"
                        >
                          <Minimize2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setCardSize('normal')}
                          className={`p-1 rounded ${cardSize === 'normal' ? 'dark:bg-yellow-500 dark:text-black bg-blue-500 text-white' : 'dark:bg-gray-600 dark:text-gray-300 bg-gray-200 text-gray-600'}`}
                          title="Normal"
                        >
                          <div className="w-3 h-3 border border-current"></div>
                        </button>
                        <button
                          onClick={() => setCardSize('large')}
                          className={`p-1 rounded ${cardSize === 'large' ? 'dark:bg-yellow-500 dark:text-black bg-blue-500 text-white' : 'dark:bg-gray-600 dark:text-gray-300 bg-gray-200 text-gray-600'}`}
                          title="Large"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className={`px-2 lg:px-3 py-1 rounded-full ${cardClasses.text} font-semibold dark:bg-yellow-100 dark:text-yellow-800 dark:border-yellow-200 bg-blue-100 text-blue-800 border border-blue-200`}>
                        {selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                      </div>
                    </div>
                  </div>

                  {/* Route Title */}
                  <div className="text-center mb-4 lg:mb-6">
                    <div className={`${cardClasses.title} font-bold dark:text-white text-gray-800 flex items-center justify-center`}>
                      <MapPin className={`${cardClasses.icon} mr-2 dark:text-yellow-400 text-blue-600`} />
                      <span className="truncate">
                        {routeDisplayInfo.start} → {routeDisplayInfo.end}
                      </span>
                    </div>
                  </div>

                  {/* Route Progress - Static for Live Mode */}
                  <div className="relative mb-4 lg:mb-6">
                    {/* Progress Line - Always at 0% for live mode */}
                    <div className="absolute top-6 left-0 right-0 h-1 dark:bg-gray-600 bg-gray-300 rounded-full mx-4 sm:mx-8">
                      <div className="h-full rounded-full transition-all duration-300 dark:bg-gray-500 bg-gray-400" style={{ width: '0%' }}></div>
                    </div>

                    {/* Route Points */}
                    <div className="flex justify-between items-center relative" style={{ minHeight: '80px' }}>
                      {displayPoints.slice(0, window.innerWidth < 640 ? 4 : displayPoints.length).map((point, index) => {
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
                            <div className={`relative ${cardClasses.circle} rounded-full flex items-center justify-center ${cardClasses.text} font-bold border-2 mb-2 lg:mb-3 transition-all duration-200 shadow-lg ${
                              isFirst
                                ? 'bg-green-500 text-white border-green-400'
                                : isLast && selectedShift === 'morning'
                                ? 'bg-red-500 text-white border-red-400'
                                : 'dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 bg-gray-300 text-gray-600 border-gray-400'
                            }`}>
                              {isFirst && selectedShift === 'morning' ? (
                                <div className={`${cardSize === 'small' ? 'w-2 h-2' : cardSize === 'large' ? 'w-6 h-6' : 'w-4 h-4'} rounded-full bg-white`}></div>
                              ) : (isLast && selectedShift === 'morning') || (isFirst && selectedShift === 'evening') ? (
                                <School className={cardClasses.bus} />
                              ) : (
                                point.displayOrder
                              )}
                            </div>

                            {/* Point Name */}
                            <div className={`${cardClasses.text} dark:text-gray-300 text-gray-600 text-center max-w-16 lg:max-w-20 leading-tight font-medium`}>
                              {point.routePointName.length > 8 ? 
                                `${point.routePointName.substring(0, 8)}...` : 
                                point.routePointName
                              }
                            </div>

                            {/* Hover Tooltip - Hidden on mobile */}
                            {hoveredPoint && hoveredPoint.id === point.id && window.innerWidth >= 768 && (
                              <div className="absolute bottom-full mb-3 px-4 py-3 dark:bg-gray-800 bg-white dark:text-white text-gray-800 text-xs rounded-lg shadow-xl whitespace-nowrap z-20 min-w-48 border dark:border-gray-600 border-gray-200">
                                <div className="font-bold dark:text-yellow-400 text-blue-600 mb-1">{point.routePointName}</div>
                                <div className="text-green-400 mb-1">
                                  Reached Time: {formatDisplayTime(deviceTime)}
                                </div>
                                <div className="dark:text-yellow-400 text-blue-600">
                                  Status: Bus not started yet
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent dark:border-t-gray-800 border-t-white"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bus Icon at starting position based on shift */}
                    <div 
                      className="absolute top-1 lg:top-2 transition-all duration-300 z-10"
                      style={{ 
                        left: selectedShift === 'morning' ? '8px' : 'calc(100% - 24px)',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <div className={`${cardSize === 'small' ? 'p-1' : cardSize === 'large' ? 'p-4' : 'p-2'} lg:p-3 rounded-full shadow-xl transition-all border-2 border-white dark:bg-gray-600 bg-gray-400`}>
                        <Bus className={cardClasses.bus} />
                      </div>
                    </div>
                  </div>

                  {/* Live Mode Status */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className={`${cardClasses.icon} dark:text-yellow-400 text-blue-600 mr-2`} />
                      <span className={`${cardClasses.text} dark:text-white text-gray-800 font-medium`}>
                        Live Mode - Bus tracking not started
                      </span>
                    </div>
                    <div className={`${cardClasses.text} dark:text-gray-400 text-gray-600`}>
                      Switch to Historical mode to view past routes
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Historical Preview Card */}
          {!isLiveMode && showHistoricalPreview && selectedRoute && (
            <div className={`absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 ${cardClasses.container} max-w-[95vw]`}>
              <Card className="dark:bg-slate-800/90 dark:border-slate-600 bg-white shadow-2xl rounded-lg border border-gray-200">
                <div className={cardClasses.padding}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Clock className={`${cardClasses.icon} dark:text-yellow-400 text-blue-600`} />
                      <div className={`${cardClasses.text} dark:text-gray-300 text-gray-600`}>
                        {getReachedDateFromHistoricalData(busPosition)} • 
                        <span className="dark:text-yellow-400 text-blue-600 font-medium ml-1">
                          {getReachedTimeFromHistoricalData(busPosition)}
                        </span>
                      </div>
                    </div>
                    <div className={`px-2 lg:px-3 py-1 rounded-full ${cardClasses.text} font-semibold dark:bg-blue-100 dark:text-blue-800 dark:border-blue-200 bg-blue-100 text-blue-800 border border-blue-200`}>
                      {selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                    </div>
                  </div>

                  {/* Route Title */}
                  <div className="text-center mb-4 lg:mb-6">
                    <div className={`${cardClasses.title} font-bold dark:text-white text-gray-800 flex items-center justify-center`}>
                      <MapPin className={`${cardClasses.icon} mr-2 dark:text-yellow-400 text-blue-600`} />
                      <span className="truncate">
                        {routeDisplayInfo?.start} → {routeDisplayInfo?.end}
                      </span>
                    </div>
                    <div className={`${cardClasses.text} dark:text-gray-400 text-gray-600 mt-1`}>
                      Device: {getDeviceId()} • Elapsed: {getElapsedTime(busPosition)}
                    </div>
                  </div>

                  {/* Route Progress */}
                  <div className="relative mb-4 lg:mb-6">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-1 dark:bg-gray-600 bg-gray-300 rounded-full mx-4 sm:mx-8">
                      <div 
                        className="h-full dark:bg-yellow-400 bg-blue-500 rounded-full transition-all duration-300" 
                        style={{ width: `${busPosition}%` }}
                      ></div>
                    </div>

                    {/* Route Points */}
                    <div className="flex justify-between items-center relative" style={{ minHeight: '80px' }}>
                      {displayPoints.slice(0, window.innerWidth < 640 ? 4 : displayPoints.length).map((point, index) => {
                        const isFirst = index === 0;
                        const isLast = index === displayPoints.length - 1;
                        const positionPercent = getDistanceBasedPosition(index, displayPoints.length);
                        const isReached = busPosition >= positionPercent;
                        const reachedTime = getRoutePointReachedTime(point);

                        return (
                          <div
                            key={point.id}
                            className="absolute flex flex-col items-center cursor-pointer group"
                            style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
                            onMouseEnter={() => setHoveredPoint(point)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            {/* Circle Point */}
                            <div className={`relative ${cardClasses.circle} rounded-full flex items-center justify-center ${cardClasses.text} font-bold border-2 mb-2 lg:mb-3 transition-all duration-200 shadow-lg ${
                              isReached
                                ? isFirst
                                  ? 'bg-green-500 text-white border-green-400'
                                  : isLast && selectedShift === 'morning'
                                  ? 'bg-red-500 text-white border-red-400'
                                  : 'dark:bg-yellow-400 dark:text-black bg-blue-500 text-white border-blue-400'
                                : 'dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 bg-gray-300 text-gray-600 border-gray-400'
                            }`}>
                              {isFirst && selectedShift === 'morning' ? (
                                <div className={`${cardSize === 'small' ? 'w-2 h-2' : cardSize === 'large' ? 'w-6 h-6' : 'w-4 h-4'} rounded-full bg-white`}></div>
                              ) : (isLast && selectedShift === 'morning') || (isFirst && selectedShift === 'evening') ? (
                                <School className={cardClasses.bus} />
                              ) : (
                                point.displayOrder
                              )}
                            </div>

                            {/* Point Name */}
                            <div className={`${cardClasses.text} dark:text-gray-300 text-gray-600 text-center max-w-16 lg:max-w-20 leading-tight font-medium`}>
                              {point.routePointName.length > 8 ? 
                                `${point.routePointName.substring(0, 8)}...` : 
                                point.routePointName
                              }
                            </div>

                            {/* Hover Tooltip - Hidden on mobile */}
                            {hoveredPoint && hoveredPoint.id === point.id && window.innerWidth >= 768 && (
                              <div className="absolute bottom-full mb-3 px-4 py-3 dark:bg-gray-800 bg-white dark:text-white text-gray-800 text-xs rounded-lg shadow-xl whitespace-nowrap z-20 min-w-48 border dark:border-gray-600 border-gray-200">
                                <div className="font-bold dark:text-yellow-400 text-blue-600 mb-1">{point.routePointName}</div>
                                <div className="text-green-400 mb-1">
                                  Reached Time: {reachedTime || 'Not reached yet'}
                                </div>
                                <div className={`${isReached ? 'text-green-400' : 'dark:text-yellow-400 text-orange-500'}`}>
                                  Status: {isReached ? 'Reached' : 'Pending'}
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent dark:border-t-gray-800 border-t-white"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bus Icon */}
                    <div 
                      className="absolute top-1 lg:top-2 transition-all duration-300 z-10"
                      style={{ 
                        left: `calc(${busPosition}% - 12px)`,
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <div className={`${cardSize === 'small' ? 'p-1' : cardSize === 'large' ? 'p-4' : 'p-2'} lg:p-3 rounded-full shadow-xl transition-all border-2 border-white ${routeCompleted ? 'bg-green-500' : 'dark:bg-yellow-400 bg-blue-500'}`}>
                        <Bus className={`${cardClasses.bus} ${routeCompleted ? 'text-white' : 'dark:text-black text-white'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={() => setIsHistoricalPlaying(!isHistoricalPlaying)}
                      disabled={routeCompleted}
                      className={`${cardClasses.text} px-3 lg:px-4 py-2 dark:bg-yellow-500 dark:hover:bg-yellow-600 dark:text-black bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 rounded-lg flex items-center space-x-2`}
                    >
                      {isHistoricalPlaying ? <Pause className={cardClasses.icon} /> : <Play className={cardClasses.icon} />}
                      <span>{isHistoricalPlaying ? 'Pause' : 'Play'}</span>
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setBusPosition(0);
                        setRouteCompleted(false);
                        setIsHistoricalPlaying(false);
                        syncBusPosition(0);
                      }}
                      className={`${cardClasses.text} px-3 lg:px-4 py-2 dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-white bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center space-x-2`}
                    >
                      <RotateCcw className={cardClasses.icon} />
                      <span>Reset</span>
                    </Button>
                  </div>

                  {routeCompleted && (
                    <div className="text-center mt-3">
                      <div className={`${cardClasses.text} text-green-400 font-medium`}>
                        🎉 Route completed successfully!
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapViewPage;