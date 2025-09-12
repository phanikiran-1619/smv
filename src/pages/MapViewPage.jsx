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

  // Get current time based on bus position - use actual GPS eventTime
  const getCurrentTimeFromPosition = (position) => {
    if (!isLiveMode && historicalData.length > 0) {
      // For historical mode, use actual GPS eventTime
      const gpsData = findGPSDataFromPosition(position);
      if (gpsData && gpsData.eventTime) {
        return format(new Date(gpsData.eventTime), 'HH:mm:ss');
      }
    }
    
    // For live mode, use current device time
    return formatDisplayTime(deviceTime);
  };

  // Get current date based on bus position - use actual GPS eventTime
  const getCurrentDateFromPosition = (position) => {
    if (!isLiveMode && historicalData.length > 0) {
      // For historical mode, use actual GPS eventTime
      const gpsData = findGPSDataFromPosition(position);
      if (gpsData && gpsData.eventTime) {
        return format(new Date(gpsData.eventTime), 'EEE, MMM d');
      }
    }
    
    // For live mode, use current device time
    return format(deviceTime, 'EEE, MMM d');
  };

  // Calculate interpolated position between two points
  const interpolatePosition = (point1, point2, ratio) => {
    const lat = point1.lat + (point2.lat - point1.lat) * ratio;
    const lng = point1.lng + (point2.lng - point1.lng) * ratio;
    return { lat, lng };
  };

  // Calculate bus position on map based on route progress and actual movement direction
  const calculateBusMapPosition = (progressPercent, routePoints, historicalGPSData = null) => {
    if (!routePoints || routePoints.length < 2) return null;

    // If we have historical GPS data, use actual coordinates
    if (historicalGPSData && historicalGPSData.length > 0) {
      const progress = progressPercent / 100;
      const dataIndex = Math.min(
        Math.floor(progress * historicalGPSData.length), 
        historicalGPSData.length - 1
      );
      const gpsPoint = historicalGPSData[dataIndex];
      return {
        lat: parseCoordinate(gpsPoint.latitude),
        lng: parseCoordinate(gpsPoint.longitude)
      };
    }

    // Determine actual movement direction based on coordinates and session
    const sortedPoints = [...routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    // For morning: typically starts from pickup points and goes to school
    // For evening: typically starts from school and goes to drop points
    // But we need to check actual coordinate progression to determine real direction
    
    let actualRouteOrder = sortedPoints;
    
    // Check if we need to reverse based on actual coordinate progression in historical data
    if (historicalGPSData && historicalGPSData.length > 1) {
      const firstGPS = historicalGPSData[0];
      const lastGPS = historicalGPSData[historicalGPSData.length - 1];
      
      // Find which route point is closest to first GPS position
      const firstDistances = sortedPoints.map(point => 
        calculateDistance(
          parseCoordinate(firstGPS.latitude),
          parseCoordinate(firstGPS.longitude),
          parseCoordinate(point.latitude),
          parseCoordinate(point.longitude)
        )
      );
      
      const closestToFirst = firstDistances.indexOf(Math.min(...firstDistances));
      
      // Find which route point is closest to last GPS position
      const lastDistances = sortedPoints.map(point => 
        calculateDistance(
          parseCoordinate(lastGPS.latitude),
          parseCoordinate(lastGPS.longitude),
          parseCoordinate(point.latitude),
          parseCoordinate(point.longitude)
        )
      );
      
      const closestToLast = lastDistances.indexOf(Math.min(...lastDistances));
      
      // If the journey goes from higher index to lower index, reverse the route
      if (closestToFirst > closestToLast) {
        actualRouteOrder = [...sortedPoints].reverse();
      }
    } else {
      // Fallback to session-based logic only if no GPS data
      if (selectedShift === 'evening') {
        actualRouteOrder = [...sortedPoints].reverse();
      }
    }

    const progress = progressPercent / 100;
    const totalSegments = actualRouteOrder.length - 1;
    const segmentIndex = Math.floor(progress * totalSegments);
    const segmentProgress = (progress * totalSegments) - segmentIndex;

    if (segmentIndex >= totalSegments) {
      const lastPoint = actualRouteOrder[actualRouteOrder.length - 1];
      return {
        lat: parseCoordinate(lastPoint.latitude),
        lng: parseCoordinate(lastPoint.longitude)
      };
    }

    const currentPoint = actualRouteOrder[segmentIndex];
    const nextPoint = actualRouteOrder[segmentIndex + 1];

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

  // Refresh map center based on new data
  const refreshMapCenter = (newHistoricalData, route) => {
    if (newHistoricalData && newHistoricalData.length > 0) {
      // Center map on the starting position of the historical data
      const startingPoint = newHistoricalData[0];
      setMapCenter({
        lat: parseCoordinate(startingPoint.latitude),
        lng: parseCoordinate(startingPoint.longitude)
      });
      
      // Fit map bounds to show the entire journey
      if (mapRef.current && newHistoricalData.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        newHistoricalData.forEach(point => {
          bounds.extend(new window.google.maps.LatLng(
            parseCoordinate(point.latitude),
            parseCoordinate(point.longitude)
          ));
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    } else if (route && route.routePoints && route.routePoints.length > 0) {
      // Fallback to route points
      const firstPoint = route.routePoints[0];
      setMapCenter({
        lat: parseCoordinate(firstPoint.latitude),
        lng: parseCoordinate(firstPoint.longitude)
      });
    }
  };

  // Fetch historical data with completed trip first
  const fetchHistoricalData = async () => {
    if (!selectedRoute || selectedRouteId === 'all') {
      alert('Please select a specific route for historical data');
      return;
    }

    setHistoricalLoading(true);
    setDirectionsRequested(true);
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
      
      // Start with completed trip first (100% position)
      setBusPosition(100);
      setRouteCompleted(true);
      setShowHistoricalPreview(true);
      
      // Set bus position to last GPS coordinate (completed position)
      if (sortedData.length > 0) {
        const lastData = sortedData[sortedData.length - 1];
        setBusMapPosition({
          lat: parseCoordinate(lastData.latitude),
          lng: parseCoordinate(lastData.longitude)
        });
      }
      
      // Refresh map center and bounds
      refreshMapCenter(sortedData, selectedRoute);
      
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
      
      // Start with completed trip first
      setBusPosition(100);
      setRouteCompleted(true);
      setShowHistoricalPreview(true);
      
      // Set bus position to last position
      setBusMapPosition({
        lat: parseCoordinate(mockHistoricalData[mockHistoricalData.length - 1].latitude),
        lng: parseCoordinate(mockHistoricalData[mockHistoricalData.length - 1].longitude)
      });

      // Refresh map center
      refreshMapCenter(mockHistoricalData, selectedRoute);
    } finally {
      setHistoricalLoading(false);
    }
  };

  // Handle route selection
  const handleRouteSelect = (routeId) => {
    // Hide historical preview card when route changes
    setShowHistoricalPreview(false);
    setDirectionsRequested(false);
    
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
            // For live mode, always start at the first point (beginning of route)
            const firstPoint = route.routePoints.find(p => p.seqOrder === 1) || route.routePoints[0];
            setBusMapPosition({
              lat: parseCoordinate(firstPoint.latitude),
              lng: parseCoordinate(firstPoint.longitude)
            });
          }
        }
      }
    }
  };

  // Handle date change - hide preview card when date changes
  const handleDateChange = (event) => {
    const selectedDateValue = new Date(event.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateValue.setHours(0, 0, 0, 0);

    // Hide historical preview when date changes
    setShowHistoricalPreview(false);
    setDirectionsRequested(false);

    // Only allow past dates and today
    if (selectedDateValue <= today) {
      setSelectedDate(selectedDateValue);
      if (isLiveMode && selectedDateValue.getTime() !== today.getTime()) {
        setIsLiveMode(false);
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

  // Handle historical bus movement with proper direction
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
    
    // Calculate bus position using improved direction logic
    if (selectedRoute && selectedRoute.routePoints) {
      const mapPosition = calculateBusMapPosition(newPosition, selectedRoute.routePoints, historicalData);
      if (mapPosition) {
        setBusMapPosition(mapPosition);
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
    return formatDisplayTime(deviceTime);
  };

  // Get current date from historical GPS data
  const getCurrentDateFromHistoricalData = (position) => {
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
    
    // Find the GPS point closest to this route point (within 100 meters)
    let closestPoint = null;
    let minDistance = Infinity;
    
    historicalGPSData.forEach(gpsPoint => {
      const gpsLat = parseCoordinate(gpsPoint.latitude);
      const gpsLng = parseCoordinate(gpsPoint.longitude);
      const distance = calculateDistance(routeLat, routeLng, gpsLat, gpsLng) * 1000; // Convert to meters
      
      if (distance < 100 && distance < minDistance) { // Within 100 meters
        minDistance = distance;
        closestPoint = gpsPoint;
      }
    });
    
    return closestPoint;
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
  const cardClasses = getCardSizeClasses();

  return (
    <div className="h-screen w-screen flex bg-slate-900 text-white overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left Sidebar - Responsive */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 
        w-80 sm:w-72 md:w-80 lg:w-80 xl:w-96 bg-slate-800 flex flex-col border-r border-slate-700 
        transition-transform duration-300 ease-in-out h-full`}>
        
        {/* Close button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 border-b border-slate-700">
          <Button
            onClick={() => navigate(-1)}
            className="w-full mb-4 bg-yellow-500 text-black hover:bg-yellow-600 text-sm sm:text-base"
          >
            ← Back to Dashboard
          </Button>
          
          {/* Routes Dropdown with integrated search */}
          <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white mb-4 text-sm">
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
                    className="pl-10 bg-slate-600 border-slate-500 text-white placeholder-gray-400 text-sm"
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
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pl-10 text-sm"
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
                    className={`flex-1 text-xs sm:text-sm ${
                      selectedShift === 'morning' 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-slate-600 text-white hover:bg-slate-500'
                    }`}
                  >
                    Morning
                  </Button>
                  <Button
                    onClick={() => setSelectedShift('evening')}
                    className={`flex-1 text-xs sm:text-sm ${
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 text-sm"
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
              <h3 className="text-yellow-400 font-semibold mb-3 text-sm">Fleet Overview</h3>
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
              <span className="text-yellow-400 font-mono text-sm">
                {formatDisplayTime(deviceTime)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-300 text-sm">Date:</span>
              <span className="text-white text-sm">
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
        <div className="bg-slate-800 p-3 lg:p-4 flex items-center justify-between border-b border-slate-700 flex-wrap gap-2 lg:gap-4">
          <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 ml-12 lg:ml-0">
            <div className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent truncate">
              {showAllRoutes ? 'ALL ROUTES' : selectedRoute?.routeName || 'Route View'}
            </div>
            {loading && (
              <div className="text-xs lg:text-sm text-gray-400 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-yellow-400 mr-2"></div>
                Loading routes...
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsLiveMode(true)}
              className={`px-3 lg:px-6 py-2 rounded-full text-xs lg:text-sm ${
                isLiveMode 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-slate-600 text-white hover:bg-slate-500'
              }`}
            >
              Live Map
            </Button>
            <Button
              onClick={() => setIsLiveMode(false)}
              className={`px-3 lg:px-6 py-2 rounded-full text-xs lg:text-sm ${
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
              <Card className="bg-white shadow-2xl rounded-lg border">
                <div className={cardClasses.padding}>
                  {/* Header with resize controls */}
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div className="flex items-center space-x-2 lg:space-x-3">
                      <Clock className={`${cardClasses.icon} text-blue-600`} />
                      <div className={`${cardClasses.text} text-gray-600`}>
                        {format(deviceTime, 'EEE, MMM d')} • 
                        <span className="text-blue-600 font-medium ml-1">
                          {formatDisplayTime(deviceTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Resize Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setCardSize('small')}
                          className={`p-1 rounded ${cardSize === 'small' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                          title="Small"
                        >
                          <Minimize2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setCardSize('normal')}
                          className={`p-1 rounded ${cardSize === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                          title="Normal"
                        >
                          <div className="w-3 h-3 border border-current"></div>
                        </button>
                        <button
                          onClick={() => setCardSize('large')}
                          className={`p-1 rounded ${cardSize === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                          title="Large"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className={`px-2 lg:px-3 py-1 rounded-full ${cardClasses.text} font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200`}>
                        {selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                      </div>
                    </div>
                  </div>

                  {/* Route Title */}
                  <div className="text-center mb-4 lg:mb-6">
                    <div className={`${cardClasses.title} font-bold text-gray-800 flex items-center justify-center`}>
                      <MapPin className={`${cardClasses.icon} mr-2 text-blue-600`} />
                      <span className="truncate">
                        {routeDisplayInfo.start} → {routeDisplayInfo.end}
                      </span>
                    </div>
                  </div>

                  {/* Route Progress - Static for Live Mode */}
                  <div className="relative mb-4 lg:mb-6">
                    {/* Progress Line - Always at 0% for live mode */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-4 sm:mx-8">
                      <div className="h-full rounded-full transition-all duration-300 bg-gray-300" style={{ width: '0%' }}></div>
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
                                : 'bg-gray-300 text-gray-600 border-gray-400'
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
                            <div className={`${cardClasses.text} text-gray-600 text-center max-w-16 lg:max-w-20 leading-tight font-medium`}>
                              {point.routePointName.length > 8 ? 
                                `${point.routePointName.substring(0, 8)}...` : 
                                point.routePointName
                              }
                            </div>

                            {/* Hover Tooltip - Hidden on mobile */}
                            {hoveredPoint && hoveredPoint.id === point.id && window.innerWidth >= 768 && (
                              <div className="absolute bottom-full mb-3 px-4 py-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-20 min-w-48">
                                <div className="font-bold text-blue-400 mb-1">{point.routePointName}</div>
                                <div className="text-green-400 mb-1">
                                  Current Time: {formatDisplayTime(deviceTime)}
                                </div>
                                <div className="text-yellow-400">
                                  Status: Bus not started yet
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bus Icon at starting position */}
                    <div 
                      className="absolute top-1 lg:top-2 transition-all duration-300 z-10"
                      style={{ 
                        left: '8px',
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <div className={`${cardSize === 'small' ? 'p-1' : cardSize === 'large' ? 'p-4' : 'p-2'} lg:p-3 rounded-full shadow-xl transition-all border-2 border-white bg-gray-400`}>
                        <Bus className={cardClasses.bus} />
                      </div>
                    </div>
                  </div>

                  {/* Live Mode Status */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className={`${cardClasses.icon} text-yellow-500 mr-2`} />
                      <span className={`${cardClasses.title} font-semibold text-gray-800`}>Bus not started yet</span>
                    </div>
                    <div className={`${cardClasses.text} text-green-600 flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live tracking mode • {formatDisplayTime(deviceTime)}
                    </div>
                    <div className={`${cardClasses.text} text-gray-500 mt-2`}>
                      Switch to Historical mode to view past journey data
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Enhanced Historical Preview Card - Only shown when directions are requested */}
          {!showAllRoutes && selectedRoute && routeDisplayInfo && !isLiveMode && showHistoricalPreview && directionsRequested && (
            <div className={`absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 ${cardClasses.container} max-w-[95vw]`}>
              {loading ? (
                <SkeletonPreviewCard />
              ) : (
                <Card className="bg-white shadow-2xl rounded-lg border">
                  <div className={cardClasses.padding}>
                    {/* Header with resize controls */}
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <Clock className={`${cardClasses.icon} text-blue-600`} />
                        <div className={`${cardClasses.text} text-gray-600`}>
                          {getCurrentDateFromPosition(busPosition)} • 
                          <span className="text-blue-600 font-medium ml-1">
                            {getCurrentTimeFromPosition(busPosition)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Resize Controls */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setCardSize('small')}
                            className={`p-1 rounded ${cardSize === 'small' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            title="Small"
                          >
                            <Minimize2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setCardSize('normal')}
                            className={`p-1 rounded ${cardSize === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            title="Normal"
                          >
                            <div className="w-3 h-3 border border-current"></div>
                          </button>
                          <button
                            onClick={() => setCardSize('large')}
                            className={`p-1 rounded ${cardSize === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                            title="Large"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className={`px-2 lg:px-3 py-1 rounded-full ${cardClasses.text} font-semibold ${
                          selectedShift === 'morning' 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}>
                          {selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}
                          {routeCompleted && (
                            <span className="ml-2 text-green-600">✓ Completed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Route Title */}
                    <div className="text-center mb-4 lg:mb-6">
                      <div className={`${cardClasses.title} font-bold text-gray-800 flex items-center justify-center`}>
                        <MapPin className={`${cardClasses.icon} mr-2 text-blue-600`} />
                        <span className="truncate">
                          {routeDisplayInfo.start} → {routeDisplayInfo.end}
                        </span>
                      </div>
                    </div>

                    {/* Route Progress */}
                    <div className="relative mb-4 lg:mb-6">
                      {/* Progress Line */}
                      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-4 sm:mx-8">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            routeCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${busPosition}%` }}
                        ></div>
                      </div>

                      {/* Route Points */}
                      <div className="flex justify-between items-center relative" style={{ minHeight: '80px' }}>
                        {displayPoints.slice(0, window.innerWidth < 640 ? 4 : displayPoints.length).map((point, index) => {
                          const progress = (busPosition / 100) * (displayPoints.length - 1);
                          const isActive = index <= progress;
                          const isCurrent = Math.floor(progress) === index;
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
                                  <div className={`${cardSize === 'small' ? 'w-2 h-2' : cardSize === 'large' ? 'w-6 h-6' : 'w-4 h-4'} rounded-full bg-white`}></div>
                                ) : (isLast && selectedShift === 'morning') || (isFirst && selectedShift === 'evening') ? (
                                  <School className={cardClasses.bus} />
                                ) : (
                                  point.displayOrder
                                )}
                              </div>

                              {/* Point Name */}
                              <div className={`${cardClasses.text} text-gray-600 text-center max-w-16 lg:max-w-20 leading-tight font-medium`}>
                                {point.routePointName.length > 8 ? 
                                  `${point.routePointName.substring(0, 8)}...` : 
                                  point.routePointName
                                }
                              </div>

                              {/* Hover Tooltip - Hidden on mobile */}
                              {hoveredPoint && hoveredPoint.id === point.id && window.innerWidth >= 768 && (
                                <div className="absolute bottom-full mb-3 px-4 py-3 bg-gray-800 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-20 min-w-48">
                                  <div className="font-bold text-blue-400 mb-1">{point.routePointName}</div>
                                  
                                  {/* Show current device time */}
                                  <div className="text-green-400 mb-1">
                                    Current Time: {formatDisplayTime(deviceTime)}
                                  </div>
                                  
                                  {/* Show route times if available */}
                                  {routeTimings[index - 1] && (
                                    <div className="text-yellow-400 mb-1">
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
                      <div 
                        className="absolute top-1 lg:top-2 transition-all duration-300 z-10"
                        style={{ 
                          left: `calc(${busPosition}% - 12px)`,
                          transform: 'translateY(-50%)'
                        }}
                      >
                        <div className={`${cardSize === 'small' ? 'p-1' : cardSize === 'large' ? 'p-4' : 'p-2'} lg:p-3 rounded-full shadow-xl transition-all border-2 border-white ${
                          routeCompleted ? 'bg-green-500' : 'bg-blue-500 animate-bounce'
                        }`}>
                          <Bus className={cardClasses.bus} />
                        </div>
                      </div>
                    </div>

                    {/* Controls for Historical Mode */}
                    <div className="space-y-3 lg:space-y-4">
                      {/* Historical Data Information */}
                      {historicalData.length > 0 && (
                        <div className="bg-slate-50 p-3 lg:p-4 rounded-lg border">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-xs lg:text-sm">
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
                              <span className="text-gray-600">Event Time:</span>
                              <div className="font-semibold text-purple-600">{getCurrentTimeFromHistoricalData(busPosition)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">GPS Points:</span>
                              <div className="font-semibold text-orange-600">{historicalData.length}</div>
                            </div>
                          </div>
                          
                          {currentGPSData && (
                            <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Current GPS: {parseCoordinate(currentGPSData.latitude).toFixed(4)}, {parseCoordinate(currentGPSData.longitude).toFixed(4)}</span>
                                <span>Device Time: {formatDisplayTime(deviceTime)}</span>
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
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <Button
                            onClick={() => setIsHistoricalPlaying(!isHistoricalPlaying)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 text-white text-xs lg:text-sm"
                            disabled={historicalData.length === 0}
                          >
                            {isHistoricalPlaying ? <Pause className="w-3 h-3 lg:w-4 lg:h-4" /> : <Play className="w-3 h-3 lg:w-4 lg:h-4" />}
                            <span>{isHistoricalPlaying ? 'Pause' : 'Play'}</span>
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
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 text-xs lg:text-sm"
                          >
                            <RotateCcw className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span>Reset</span>
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 lg:space-x-4 text-xs lg:text-sm text-gray-600">
                          {historicalLoading && (
                            <div className="text-blue-600 flex items-center">
                              <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b border-blue-600 mr-2"></div>
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
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* All Routes Message */}
          {showAllRoutes && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2">
              <Card className="bg-white shadow-lg border p-4 lg:p-6">
                <div className="text-center">
                  <div className="text-base lg:text-lg font-semibold text-gray-800 mb-2">All Routes View</div>
                  <div className="text-xs lg:text-sm text-gray-600 mb-2">
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
            <div className="absolute top-16 lg:top-4 right-2 lg:right-4 max-w-sm lg:max-w-md">
              <Card className="bg-red-100 border-red-300 p-3 lg:p-4">
                <div className="text-red-800 text-xs lg:text-sm">
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
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #1E40AF);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #1E40AF);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }

        @media (min-width: 1024px) {
          .slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
          
          .slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default MapViewPage;