import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, Calendar, Bus, Navigation, Clock, Play, Pause, RotateCcw, Route, AlertCircle, ArrowLeft, MapPin, Timer, TrendingUp, User } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

// Map container style - full width for left side
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Default center for Bengaluru (based on your GPS data)
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

// Libraries for Google Maps
const libraries = ['places', 'geometry'];

// Helper function to get current shift based on time
function getCurrentShift() {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : 'evening';
}

const HistoricalMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pageTitle, userType, username } = location.state || { 
    pageTitle: 'Historical Map', 
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(getCurrentShift());
  const [loading, setLoading] = useState(true);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeDirections, setRouteDirections] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [busPosition, setBusPosition] = useState(0);
  const [isHistoricalPlaying, setIsHistoricalPlaying] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [busMapPosition, setBusMapPosition] = useState(null);
  const [totalJourneyTime, setTotalJourneyTime] = useState(0);
  const [currentGPSData, setCurrentGPSData] = useState(null);
  const [routeCompleted, setRouteCompleted] = useState(false);
  const [showHistoricalPreview, setShowHistoricalPreview] = useState(false);
  const [directionsRequested, setDirectionsRequested] = useState(false);
  const [routePointsWithTiming, setRoutePointsWithTiming] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  
  // Refs
  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

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

  // Enhanced Haversine distance calculation with higher precision
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters for higher precision
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon1 - lon2) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  // Find nearest GPS coordinate to a route point using Haversine formula
  const findNearestGPSCoordinate = (routePoint, gpsData) => {
    if (!gpsData || gpsData.length === 0) return null;
    
    let nearestPoint = null;
    let minDistance = Infinity;
    
    gpsData.forEach(gpsPoint => {
      const distance = calculateDistance(
        parseCoordinate(routePoint.latitude),
        parseCoordinate(routePoint.longitude),
        parseCoordinate(gpsPoint.latitude),
        parseCoordinate(gpsPoint.longitude)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = {
          ...gpsPoint,
          distance: distance
        };
      }
    });
    
    return nearestPoint;
  };

  // Calculate route points with accurate timing based on GPS data
  const calculateRoutePointsWithTiming = (routePoints, gpsData) => {
    if (!routePoints || !gpsData || gpsData.length === 0) return [];
    
    const sortedPoints = [...routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    const sortedGPSData = [...gpsData].sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
    
    return sortedPoints.map((point, index) => {
      const nearestGPS = findNearestGPSCoordinate(point, sortedGPSData);
      
      return {
        ...point,
        nearestGPS: nearestGPS,
        arrivalTime: nearestGPS ? nearestGPS.eventTime : null,
        distance: nearestGPS ? nearestGPS.distance : null,
        displayOrder: index + 1,
        isSchoolPoint: point.routePointName.toLowerCase().includes('school'),
        isFirst: index === 0,
        isLast: index === sortedPoints.length - 1,
        isReached: nearestGPS && nearestGPS.distance < 100 // Consider reached if within 100 meters
      };
    });
  };

  // Calculate time difference between two points
  const calculateTimeDifference = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    
    return diffMinutes;
  };

  // Format time from ISO string
  const formatTimeFromISO = (isoString) => {
    if (!isoString) return '--:--';
    return format(new Date(isoString), 'HH:mm:ss');
  };

  // Get current time based on bus position
  const getCurrentTimeFromPosition = (position) => {
    if (historicalData.length > 0) {
      const gpsData = findGPSDataFromPosition(position);
      if (gpsData && gpsData.eventTime) {
        return formatTimeFromISO(gpsData.eventTime);
      }
    }
    return '--:--';
  };

  // Get current date based on bus position
  const getCurrentDateFromPosition = (position) => {
    if (historicalData.length > 0) {
      const gpsData = findGPSDataFromPosition(position);
      if (gpsData && gpsData.eventTime) {
        return format(new Date(gpsData.eventTime), 'EEE, MMM d');
      }
    }
    return format(selectedDate, 'EEE, MMM d');
  };

  // Calculate bus position on map based on route progress using actual GPS data
  const calculateBusMapPosition = (progressPercent, historicalGPSData = null) => {
    if (!historicalGPSData || historicalGPSData.length === 0) return null;

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
  };

  // Fetch routes from API
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
      
      if (validRoutes.length > 0 && isLoaded) {
        const firstRoute = validRoutes[0];
        if (firstRoute && firstRoute.routePoints && firstRoute.routePoints.length > 0) {
          const firstPoint = firstRoute.routePoints[0];
          setMapCenter({
            lat: parseCoordinate(firstPoint.latitude),
            lng: parseCoordinate(firstPoint.longitude)
          });
        }
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
      const startingPoint = newHistoricalData[0];
      setMapCenter({
        lat: parseCoordinate(startingPoint.latitude),
        lng: parseCoordinate(startingPoint.longitude)
      });
      
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
      const firstPoint = route.routePoints[0];
      setMapCenter({
        lat: parseCoordinate(firstPoint.latitude),
        lng: parseCoordinate(firstPoint.longitude)
      });
    }
  };

  // Fetch historical data and process with GPS matching
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
      
      // Fixed API URL - remove duplicate /api/v1
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
      
      const sortedData = data.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
      setHistoricalData(sortedData);
      
      // Set device ID from first data point
      if (sortedData.length > 0) {
        setDeviceId(sortedData[0].deviceId);
      }
      
      // Calculate route points with accurate timing based on GPS data
      const routePointsWithGPS = calculateRoutePointsWithTiming(selectedRoute.routePoints, sortedData);
      setRoutePointsWithTiming(routePointsWithGPS);
      
      if (sortedData.length > 1) {
        const startTime = new Date(sortedData[0].eventTime);
        const endTime = new Date(sortedData[sortedData.length - 1].eventTime);
        const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
        setTotalJourneyTime(totalMinutes);
      }
      
      setBusPosition(0); // Start from beginning
      setRouteCompleted(false);
      setShowHistoricalPreview(true);
      
      if (sortedData.length > 0) {
        const firstData = sortedData[0];
        setBusMapPosition({
          lat: parseCoordinate(firstData.latitude),
          lng: parseCoordinate(firstData.longitude)
        });
      }
      
      refreshMapCenter(sortedData, selectedRoute);
      
    } catch (error) {
      console.error('Historical data fetch error:', error);
      // Use mock data for demonstration
      const baseDate = format(selectedDate, 'yyyy-MM-dd');
      const startHour = selectedShift === 'morning' ? '08' : '15';
      const mockHistoricalData = [
        { id: 1, deviceId: 'DEMO001', latitude: 12.986141, longitude: 77.731219, eventTime: `${baseDate}T${startHour}:30:00` },
        { id: 2, deviceId: 'DEMO001', latitude: 12.985842, longitude: 77.730631, eventTime: `${baseDate}T${startHour}:35:00` },
        { id: 3, deviceId: 'DEMO001', latitude: 12.985734, longitude: 77.730410, eventTime: `${baseDate}T${startHour}:42:00` },
        { id: 4, deviceId: 'DEMO001', latitude: 12.985656, longitude: 77.730406, eventTime: `${baseDate}T${startHour}:48:00` },
        { id: 5, deviceId: 'DEMO001', latitude: 12.985516, longitude: 77.730314, eventTime: `${baseDate}T${startHour}:55:00` },
      ];
      
      setHistoricalData(mockHistoricalData);
      setDeviceId('DEMO001');
      const routePointsWithGPS = calculateRoutePointsWithTiming(selectedRoute.routePoints, mockHistoricalData);
      setRoutePointsWithTiming(routePointsWithGPS);
      
      const startTime = new Date(mockHistoricalData[0].eventTime);
      const endTime = new Date(mockHistoricalData[mockHistoricalData.length - 1].eventTime);
      const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
      setTotalJourneyTime(totalMinutes);
      
      setBusPosition(0);
      setRouteCompleted(false);
      setShowHistoricalPreview(true);
      
      setBusMapPosition({
        lat: parseCoordinate(mockHistoricalData[0].latitude),
        lng: parseCoordinate(mockHistoricalData[0].longitude)
      });

      refreshMapCenter(mockHistoricalData, selectedRoute);
    } finally {
      setHistoricalLoading(false);
    }
  };

  // Handle route selection
  const handleRouteSelect = (routeId) => {
    setShowHistoricalPreview(false);
    setDirectionsRequested(false);
    
    if (routeId === 'all') {
      setSelectedRoute(null);
      setSelectedRouteId('all');
      setBusPosition(0);
      setBusMapPosition(null);
      setRouteCompleted(false);
      setRoutePointsWithTiming([]);
      setDeviceId('');
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      if (route) {
        setSelectedRoute(route);
        setSelectedRouteId(routeId);
        setBusPosition(0);
        setRouteCompleted(false);
        calculateDirections(route);
        updateMapCenter(route);
        setRoutePointsWithTiming([]);
        setDeviceId('');
      }
    }
  };

  // Handle date change
  const handleDateChange = (event) => {
    const selectedDateValue = new Date(event.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDateValue.setHours(0, 0, 0, 0);

    setShowHistoricalPreview(false);
    setDirectionsRequested(false);

    if (selectedDateValue <= today) {
      setSelectedDate(selectedDateValue);
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

  // Handle historical bus movement
  const handleBusPositionChange = (newPosition) => {
    setBusPosition(newPosition);
    
    if (newPosition >= 100) {
      setRouteCompleted(true);
    } else {
      setRouteCompleted(false);
    }
    
    const gpsData = findGPSDataFromPosition(newPosition);
    setCurrentGPSData(gpsData);
    
    const mapPosition = calculateBusMapPosition(newPosition, historicalData);
    if (mapPosition) {
      setBusMapPosition(mapPosition);
    }
  };

  // Find GPS data based on current position
  const findGPSDataFromPosition = (position) => {
    if (!historicalData.length) return null;
    
    const progress = position / 100;
    const dataIndex = Math.min(
      Math.floor(progress * historicalData.length), 
      historicalData.length - 1
    );
    return historicalData[dataIndex] || null;
  };

  // Get elapsed time from start of journey
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
    if (isHistoricalPlaying && busPosition < 100) {
      setBusPosition(prev => {
        const newPosition = Math.min(prev + 0.5, 100);
        handleBusPositionChange(newPosition);
        return newPosition;
      });
    } else if (busPosition >= 100) {
      setIsHistoricalPlaying(false);
      setRouteCompleted(true);
    }
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
    if (routes.length > 0 && isLoaded && selectedRoute) {
      calculateDirections(selectedRoute);
    }
  }, [routes, selectedRoute, isLoaded]);

  useEffect(() => {
    if (isHistoricalPlaying) {
      intervalRef.current = setInterval(simulateHistoricalData, 100);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHistoricalPlaying, busPosition]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full">
          <div className="text-center p-6 bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-slate-600">
            <p className="text-red-400 font-semibold">Google Maps API Error</p>
            <p className="text-gray-300">{loadError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Top Controls */}
      <div className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 flex items-center justify-between border-b border-white/20 flex-wrap gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent truncate">
            📊 {selectedRoute?.routeName || 'HISTORICAL MAP'}
          </div>
          {deviceId && (
            <div className="flex items-center space-x-2 bg-blue-500/20 px-3 py-1 rounded-full">
              <User className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-sm font-medium">{deviceId}</span>
            </div>
          )}
          {loading && (
            <div className="text-sm text-gray-300 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
              Loading routes...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/live-map', { 
              state: { pageTitle: 'Live Map', userType, username } 
            })}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Live Map</span>
          </Button>
          <div className="w-48">
            <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
              <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/30 text-white rounded-xl py-4 font-medium hover:bg-white/20 transition-all">
                <div className="flex items-center">
                  <Route className="w-4 h-4 mr-2 text-purple-400" />
                  <SelectValue placeholder="Select Route" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-slate-600 rounded-xl">
                <div className="p-3">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/80 backdrop-blur-md border-slate-500 text-white placeholder-gray-400 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <SelectItem value="all" className="text-yellow-400 font-semibold">
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-2" />
                    All Routes
                  </div>
                </SelectItem>
                {filteredRoutes.map((route) => (
                  <SelectItem 
                    key={route.smRouteId || route.id} 
                    value={route.smRouteId || route.id}
                    className="hover:bg-slate-700/50"
                  >
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 mr-2 text-purple-400" />
                      {route.routeName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Compact Controls for Date and Shift */}
      <div className="bg-white/10 backdrop-blur-xl p-4 border-b border-white/20 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            max={getTodayDateString()}
            onChange={handleDateChange}
            className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setSelectedShift('morning')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              selectedShift === 'morning' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Morning
          </Button>
          <Button
            onClick={() => setSelectedShift('evening')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              selectedShift === 'evening' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Evening
          </Button>
        </div>
        <Button
          onClick={fetchHistoricalData}
          disabled={historicalLoading || selectedRouteId === 'all'}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <Route className="w-4 h-4" />
          <span>{historicalLoading ? 'Loading...' : 'Get Historical Data'}</span>
        </Button>
      </div>

      {/* Split Layout: Map + Compact Preview Card */}
      <div className="flex-1 flex relative">
        {/* Left Side - Map (65%) */}
        <div className="w-[65%] relative">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={window.innerWidth < 768 ? 11 : 13}
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
                        strokeColor: '#8B5CF6',
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
              {selectedRoute && selectedRoute.routePoints && selectedRoute.routePoints.map((point, index) => {
                const isSchool = point.routePointName.toLowerCase().includes('school');
                const isFirst = index === 0;
                const markerSize = isSchool ? 36 : 28;
                
                return (
                  <Marker
                    key={point.smRoutePointId || point.id}
                    position={{
                      lat: parseCoordinate(point.latitude),
                      lng: parseCoordinate(point.longitude),
                    }}
                    icon={{
                      url: isSchool 
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 2L13.09 8.26L22 9L14.5 13.03L17.18 21.02L12 17L6.82 21.02L9.5 13.03L2 9L10.91 8.26L12 2Z'/%3E%3C/svg%3E"
                        : isFirst 
                        ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E"
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
                      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Cpath d='M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,13V6H18V13H6Z'/%3E%3C/svg%3E"
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%238B5CF6'%3E%3Cpath d='M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,13V6H18V13H6Z'/%3E%3C/svg%3E",
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  animation={!routeCompleted ? window.google.maps.Animation.BOUNCE : null}
                />
              )}

              {/* Historical GPS Trail */}
              {historicalData.length > 1 && (
                <div>
                  {historicalData.slice(0, Math.floor((busPosition / 100) * historicalData.length)).map((point, index) => (
                    <Marker
                      key={`gps-${point.id}`}
                      position={{
                        lat: parseCoordinate(point.latitude),
                        lng: parseCoordinate(point.longitude),
                      }}
                      icon={{
                        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E",
                        scaledSize: new window.google.maps.Size(6, 6),
                      }}
                      opacity={0.6}
                    />
                  ))}
                </div>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Right Side - Compact Scrollable Preview Card (35%) */}
        <div className="w-[35%] bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl border-l border-white/20 flex flex-col">
          {selectedRoute && showHistoricalPreview && directionsRequested ? (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 text-white border-b border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-200" />
                    <div className="text-xs">
                      {getCurrentDateFromPosition(busPosition)} • 
                      <span className="text-purple-200 font-bold ml-1">
                        {getCurrentTimeFromPosition(busPosition)}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 backdrop-blur-md rounded-full text-xs font-semibold flex items-center space-x-1 ${
                    selectedShift === 'morning' 
                      ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-300/30' 
                      : 'bg-purple-500/30 text-purple-100 border border-purple-300/30'
                  }`}>
                    <span>{selectedShift === 'morning' ? 'Morning' : 'Evening'}</span>
                    {routeCompleted && (
                      <span className="text-green-200">✓</span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-bold flex items-center justify-center mb-1">
                    <Bus className="w-4 h-4 mr-1 text-purple-200" />
                    <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                      {selectedRoute.routeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Journey Statistics */}
              <div className="p-3 bg-gradient-to-r from-slate-50 to-purple-50 text-gray-800 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-gray-600 block mb-1">Total Time</span>
                    <div className="font-bold text-purple-600 text-sm">
                      {totalJourneyTime > 0 ? `${Math.floor(totalJourneyTime / 60)}h ${totalJourneyTime % 60}m` : '--'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Elapsed</span>
                    <div className="font-bold text-green-600 text-sm">{getElapsedTime(busPosition)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">GPS Points</span>
                    <div className="font-bold text-orange-600 text-sm">{historicalData.length}</div>
                  </div>
                </div>
              </div>

              {/* Scrollable Route Points Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                {routePointsWithTiming.map((point, index) => {
                  const isReached = (busPosition / 100) * routePointsWithTiming.length > index;
                  const isCurrent = Math.floor((busPosition / 100) * routePointsWithTiming.length) === index;
                  const prevPoint = index > 0 ? routePointsWithTiming[index - 1] : null;
                  const timeTaken = prevPoint && point.nearestGPS && prevPoint.nearestGPS ? 
                    calculateTimeDifference(prevPoint.nearestGPS.eventTime, point.nearestGPS.eventTime) : null;

                  return (
                    <div
                      key={point.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400 shadow-md scale-105'
                          : isReached
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                          : 'bg-white/90 border-gray-200 hover:border-purple-300'
                      }`}
                      onMouseEnter={() => setHoveredPoint(point)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <div className="flex items-center space-x-2">
                        {/* Point Icon */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 animate-pulse' 
                            : isReached
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300'
                            : point.isSchoolPoint
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300'
                            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 border-gray-200'
                        }`}>
                          {point.isSchoolPoint ? '🏫' : point.displayOrder}
                        </div>

                        {/* Point Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-gray-800 truncate">
                            {point.routePointName}
                          </div>
                          
                          {/* Timing Information */}
                          {point.nearestGPS && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-green-600">
                                <Timer className="w-3 h-3" />
                                <span>{formatTimeFromISO(point.nearestGPS.eventTime)}</span>
                              </div>
                              
                              {timeTaken && timeTaken > 0 && (
                                <div className="flex items-center space-x-1 text-xs text-blue-600">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{timeTaken}min</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Distance Information */}
                          {point.distance !== null && (
                            <div className="text-xs text-gray-500 mt-1">
                              {point.distance < 100 ? 
                                `✓ Reached (${point.distance.toFixed(0)}m)` : 
                                `Distance: ${point.distance.toFixed(0)}m`
                              }
                            </div>
                          )}
                        </div>

                        {/* Status Indicator */}
                        <div className="flex flex-col items-center">
                          {isCurrent && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                          )}
                          {isReached && !isCurrent && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      {/* Hover Tooltip */}
                      {hoveredPoint && hoveredPoint.id === point.id && (
                        <div className="absolute left-full ml-2 z-20 px-3 py-2 bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                          <div className="font-bold text-purple-400 mb-1">{point.routePointName}</div>
                          
                          {point.nearestGPS && (
                            <>
                              <div className="text-green-400 mb-1 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Reached: {formatTimeFromISO(point.nearestGPS.eventTime)}
                              </div>
                              
                              <div className="text-yellow-400 mb-1 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                GPS: {parseCoordinate(point.nearestGPS.latitude).toFixed(4)}, {parseCoordinate(point.nearestGPS.longitude).toFixed(4)}
                              </div>
                            </>
                          )}
                          
                          {timeTaken && (
                            <div className="text-blue-400 flex items-center">
                              <Timer className="w-3 h-3 mr-1" />
                              Travel time: {timeTaken} min
                            </div>
                          )}
                          
                          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-gray-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="p-3 bg-white/95 border-t border-gray-200">
                {/* Progress Slider */}
                <div className="mb-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={busPosition}
                    onChange={(e) => handleBusPositionChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setIsHistoricalPlaying(!isHistoricalPlaying)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-1 px-3 py-2 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                      disabled={historicalData.length === 0}
                    >
                      {isHistoricalPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span className="text-xs">{isHistoricalPlaying ? 'Pause' : 'Play'}</span>
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
                      className="border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center space-x-1 px-3 py-2 font-semibold rounded-lg shadow-md transform hover:scale-105 transition-all duration-200"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="text-xs">Reset</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs">
                    {historicalLoading && (
                      <div className="text-purple-600 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></div>
                        <span className="font-semibold">Loading...</span>
                      </div>
                    )}
                    {routeCompleted && (
                      <div className="text-green-600 flex items-center font-semibold">
                        <span>✓ Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🚌</div>
                {selectedRouteId === 'all' ? (
                  <>
                    <div className="text-lg font-bold text-white mb-2">Select a Route</div>
                    <div className="text-gray-300 mb-3 text-sm">Choose a specific route to view historical data</div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-bold text-white mb-2">Load Historical Data</div>
                    <div className="text-gray-300 mb-3 text-sm">Click "Get Historical Data" to view bus journey</div>
                  </>
                )}
                <div className="text-purple-300 text-xs bg-purple-800/30 p-3 rounded-lg">
                  Historical tracking shows past bus movements with GPS precision
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Error Message */}
      {error && (
        <div className="absolute top-20 right-4 max-w-md z-50">
          <Card className="bg-red-100/95 backdrop-blur-md border-red-300 p-4 rounded-xl">
            <div className="text-red-800 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Custom Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </div>
  );
};

export default HistoricalMap;