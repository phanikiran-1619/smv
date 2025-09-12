import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, Calendar, Bus, Navigation, Clock, Play, Pause, RotateCcw, Route, AlertCircle, ArrowLeft } from 'lucide-react';
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
  const [routeDistances, setRouteDistances] = useState([]);
  const [routeTimings, setRouteTimings] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalJourneyTime, setTotalJourneyTime] = useState(0);
  const [currentGPSData, setCurrentGPSData] = useState(null);
  const [routeCompleted, setRouteCompleted] = useState(false);
  const [showHistoricalPreview, setShowHistoricalPreview] = useState(false);
  const [directionsRequested, setDirectionsRequested] = useState(false);
  const [deviceTime, setDeviceTime] = useState(new Date());
  
  // Refs
  const mapRef = useRef(null);
  const intervalRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const deviceTimeRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

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
    deviceTimeRef.current = setInterval(updateDeviceTime, 30000);

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
      
      const travelTimeMinutes = Math.round((distance / 20) * 60);
      const stopTime = i === 0 ? 0 : 2;
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
    if (historicalData.length > 0) {
      const gpsData = findGPSDataFromPosition(position);
      if (gpsData && gpsData.eventTime) {
        return format(new Date(gpsData.eventTime), 'HH:mm:ss');
      }
    }
    return formatDisplayTime(deviceTime);
  };

  // Get current date based on bus position
  const getCurrentDateFromPosition = (position) => {
    if (historicalData.length > 0) {
      const gpsData = findGPSDataFromPosition(position);
      if (gpsData && gpsData.eventTime) {
        return format(new Date(gpsData.eventTime), 'EEE, MMM d');
      }
    }
    return format(deviceTime, 'EEE, MMM d');
  };

  // Calculate interpolated position between two points
  const interpolatePosition = (point1, point2, ratio) => {
    const lat = point1.lat + (point2.lat - point1.lat) * ratio;
    const lng = point1.lng + (point2.lng - point1.lng) * ratio;
    return { lat, lng };
  };

  // Calculate bus position on map based on route progress
  const calculateBusMapPosition = (progressPercent, routePoints, historicalGPSData = null) => {
    if (!routePoints || routePoints.length < 2) return null;

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

    const sortedPoints = [...routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    let actualRouteOrder = sortedPoints;
    
    if (historicalGPSData && historicalGPSData.length > 1) {
      const firstGPS = historicalGPSData[0];
      const lastGPS = historicalGPSData[historicalGPSData.length - 1];
      
      const firstDistances = sortedPoints.map(point => 
        calculateDistance(
          parseCoordinate(firstGPS.latitude),
          parseCoordinate(firstGPS.longitude),
          parseCoordinate(point.latitude),
          parseCoordinate(point.longitude)
        )
      );
      
      const closestToFirst = firstDistances.indexOf(Math.min(...firstDistances));
      
      const lastDistances = sortedPoints.map(point => 
        calculateDistance(
          parseCoordinate(lastGPS.latitude),
          parseCoordinate(lastGPS.longitude),
          parseCoordinate(point.latitude),
          parseCoordinate(point.longitude)
        )
      );
      
      const closestToLast = lastDistances.indexOf(Math.min(...lastDistances));
      
      if (closestToFirst > closestToLast) {
        actualRouteOrder = [...sortedPoints].reverse();
      }
    } else {
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
      
      const sortedData = data.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));
      setHistoricalData(sortedData);
      
      if (sortedData.length > 1) {
        const startTime = new Date(sortedData[0].eventTime);
        const endTime = new Date(sortedData[sortedData.length - 1].eventTime);
        const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
        setTotalJourneyTime(totalMinutes);
      }
      
      setBusPosition(100);
      setRouteCompleted(true);
      setShowHistoricalPreview(true);
      
      if (sortedData.length > 0) {
        const lastData = sortedData[sortedData.length - 1];
        setBusMapPosition({
          lat: parseCoordinate(lastData.latitude),
          lng: parseCoordinate(lastData.longitude)
        });
      }
      
      refreshMapCenter(sortedData, selectedRoute);
      
    } catch (error) {
      console.error('Historical data fetch error:', error);
      const baseDate = format(selectedDate, 'yyyy-MM-dd');
      const startHour = selectedShift === 'morning' ? '08' : '15';
      const mockHistoricalData = [
        { id: 1, latitude: 18.5204, longitude: 73.8567, eventTime: `${baseDate}T${startHour}:30:00` },
        { id: 2, latitude: 18.5314, longitude: 73.8446, eventTime: `${baseDate}T${startHour}:35:00` },
        { id: 3, latitude: 18.5423, longitude: 73.8325, eventTime: `${baseDate}T${startHour}:42:00` },
        { id: 4, latitude: 18.5532, longitude: 73.8204, eventTime: `${baseDate}T${startHour}:48:00` },
        { id: 5, latitude: 18.5641, longitude: 73.8083, eventTime: `${baseDate}T${startHour}:55:00` },
      ];
      
      setHistoricalData(mockHistoricalData);
      
      const startTime = new Date(mockHistoricalData[0].eventTime);
      const endTime = new Date(mockHistoricalData[mockHistoricalData.length - 1].eventTime);
      const totalMinutes = Math.round((endTime - startTime) / (1000 * 60));
      setTotalJourneyTime(totalMinutes);
      
      setBusPosition(100);
      setRouteCompleted(true);
      setShowHistoricalPreview(true);
      
      setBusMapPosition({
        lat: parseCoordinate(mockHistoricalData[mockHistoricalData.length - 1].latitude),
        lng: parseCoordinate(mockHistoricalData[mockHistoricalData.length - 1].longitude)
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
      setRouteDistances([]);
      setRouteTimings([]);
      setRouteCompleted(false);
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      if (route) {
        setSelectedRoute(route);
        setSelectedRouteId(routeId);
        setBusPosition(0);
        setRouteCompleted(false);
        calculateDirections(route);
        updateMapCenter(route);
        
        const metrics = calculateRouteMetrics(route.routePoints);
        setRouteDistances(metrics.distances);
        setRouteTimings(metrics.timings);
        setTotalJourneyTime(metrics.timings.length > 0 ? metrics.timings[metrics.timings.length - 1].arrivalTime - (8.5 * 60) : 0);
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
    
    if (selectedRoute && selectedRoute.routePoints) {
      const mapPosition = calculateBusMapPosition(newPosition, selectedRoute.routePoints, historicalData);
      if (mapPosition) {
        setBusMapPosition(mapPosition);
      }
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
    if (isHistoricalPlaying) {
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

  // Get route points for preview card
  const getRoutePointsForDisplay = () => {
    if (!selectedRoute || !selectedRoute.routePoints) return [];
    
    const points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    if (selectedShift === 'evening') {
      return points.reverse().map((point, index) => ({
        ...point,
        displayOrder: index + 1,
        isSchoolPoint: index === 0,
        isDestinationPoint: index === points.length - 1
      }));
    }
    
    return points.map((point, index) => ({
      ...point,
      displayOrder: index + 1,
      isSchoolPoint: index === points.length - 1,
      isDestinationPoint: false
    }));
  };

  // Get route display info
  const getRouteDisplayInfo = () => {
    if (!selectedRoute || !selectedRoute.routePoints) return null;
    
    const points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    
    return {
      start: points[0]?.routePointName || 'Start',
      end: points[points.length - 1]?.routePointName || 'End'
    };
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
  }, [isHistoricalPlaying]);

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

  const routeDisplayInfo = getRouteDisplayInfo();
  const displayPoints = getRoutePointsForDisplay();

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Top Controls with Dropdown on Top-Right */}
      <div className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 flex items-center justify-between border-b border-white/20 flex-wrap gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent truncate">
            📊 {selectedRoute?.routeName || 'HISTORICAL MAP'}
          </div>
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
                      strokeColor: '#8B5CF6',
                      strokeWeight: window.innerWidth < 768 ? 4 : 6,
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
              const markerSize = window.innerWidth < 768 ? (isSchool ? 36 : 28) : (isSchool ? 44 : 32);
              
              return (
                <Marker
                  key={point.smRoutePointId || point.id}
                  position={{
                    lat: parseCoordinate(point.latitude),
                    lng: parseCoordinate(point.longitude),
                  }}
                  icon={{
                    url: isSchool 
                      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 24 24' fill='%23FFD700'%3E%3Cpath d='M12 2L13.09 8.26L22 9L14.5 13.03L17.18 21.02L12 17L6.82 21.02L9.5 13.03L2 9L10.91 8.26L12 2Z'/%3E%3C/svg%3E"
                      : isFirst 
                      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='%2322C55E'%3E%3Ccircle cx='12' cy='12' r='10' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E"
                      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23F59E0B'%3E%3Ccircle cx='12' cy='12' r='8' stroke='%23ffffff' stroke-width='2'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%23ffffff' font-size='8' font-weight='bold'%3E" + (index + 1) + "%3C/text%3E%3C/svg%3E",
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
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%238B5CF6'%3E%3Cpath d='M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,13V6H18V13H6Z'/%3E%3C/svg%3E",
                  scaledSize: new window.google.maps.Size(window.innerWidth < 768 ? 32 : 40, window.innerWidth < 768 ? 32 : 40),
                }}
                animation={!routeCompleted ? window.google.maps.Animation.BOUNCE : null}
              />
            )}
          </GoogleMap>
        )}

        {/* Enhanced Historical Preview Card */}
        {selectedRoute && routeDisplayInfo && showHistoricalPreview && directionsRequested && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-5xl">
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-purple-200" />
                    <div className="text-sm">
                      {getCurrentDateFromPosition(busPosition)} • 
                      <span className="text-purple-200 font-bold ml-1">
                        {getCurrentTimeFromPosition(busPosition)}
                      </span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 backdrop-blur-md rounded-full text-sm font-semibold flex items-center space-x-2 ${
                    selectedShift === 'morning' 
                      ? 'bg-yellow-500/30 text-yellow-100 border border-yellow-300/30' 
                      : 'bg-purple-500/30 text-purple-100 border border-purple-300/30'
                  }`}>
                    <span>{selectedShift === 'morning' ? 'Morning Shift' : 'Evening Shift'}</span>
                    {routeCompleted && (
                      <span className="text-green-200">✓ Completed</span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center mb-2">
                    <Bus className="w-6 h-6 mr-2 text-purple-200" />
                    <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                      {routeDisplayInfo.start} → {routeDisplayInfo.end}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white text-gray-800">
                {/* Route Progress */}
                <div className="relative mb-8">
                  <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full mx-8">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        routeCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-purple-500 to-pink-600'
                      }`}
                      style={{ width: `${busPosition}%` }}
                    ></div>
                  </div>

                  {/* Route Points */}
                  <div className="flex justify-between items-center relative" style={{ minHeight: '100px' }}>
                    {displayPoints.slice(0, 5).map((point, index) => {
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
                          {/* Enhanced Circle Point */}
                          <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-4 mb-3 transition-all duration-200 shadow-lg ${
                            isCurrent 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 shadow-purple-400/50 scale-110 animate-pulse' 
                              : routeCompleted
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300 shadow-green-400/50'
                              : isActive 
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 shadow-purple-400/50' 
                              : isFirst
                              ? 'bg-gradient-to-r from-green-400 to-green-600 text-white border-green-300 shadow-green-400/50'
                              : isLast && selectedShift === 'morning'
                              ? 'bg-gradient-to-r from-red-400 to-red-600 text-white border-red-300 shadow-red-400/50'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 border-gray-200'
                          }`}>
                            {isFirst && selectedShift === 'morning' ? (
                              <div className="w-4 h-4 rounded-full bg-white"></div>
                            ) : (isLast && selectedShift === 'morning') || (isFirst && selectedShift === 'evening') ? (
                              <School className="w-6 h-6" />
                            ) : (
                              point.displayOrder
                            )}
                          </div>

                          {/* Point Name */}
                          <div className="text-xs text-center max-w-20 leading-tight font-semibold text-gray-600">
                            {point.routePointName.length > 10 ? 
                              `${point.routePointName.substring(0, 10)}...` : 
                              point.routePointName
                            }
                          </div>

                          {/* Enhanced Hover Tooltip */}
                          {hoveredPoint && hoveredPoint.id === point.id && (
                            <div className="absolute bottom-full mb-4 px-6 py-4 bg-gray-900/95 backdrop-blur-md text-white text-sm rounded-xl shadow-2xl whitespace-nowrap z-20 min-w-64 border border-gray-700">
                              <div className="font-bold text-purple-400 mb-2 text-base">{point.routePointName}</div>
                              
                              <div className="text-green-400 mb-2 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Current Time: {formatDisplayTime(deviceTime)}
                              </div>
                              
                              {routeTimings[index - 1] && (
                                <div className="text-yellow-400 mb-2 flex items-center">
                                  <Navigation className="w-4 h-4 mr-2" />
                                  {index === 0 ? `Started at ${formatTime(8.5 * 60)}` : `Reached: ${formatTime(routeTimings[index - 1].arrivalTime)}`}
                                </div>
                              )}
                              
                              {routeCompleted && (
                                <div className="text-green-400 flex items-center">
                                  <span>✓ Journey Completed</span>
                                </div>
                              )}
                              
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Enhanced Bus Icon */}
                  <div 
                    className="absolute top-2 transition-all duration-300 z-10"
                    style={{ 
                      left: `calc(${busPosition}% - 20px)`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <div className={`p-4 rounded-full shadow-2xl transition-all border-4 border-white ${
                      routeCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce'
                    }`}>
                      <Bus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Enhanced Controls and Information */}
                <div className="space-y-6">
                  {/* Historical Data Information */}
                  {historicalData.length > 0 && (
                    <div className="bg-gradient-to-r from-slate-50 to-purple-50 p-6 rounded-xl border border-purple-200">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <span className="text-gray-600 block mb-1">Journey Time:</span>
                          <div className="font-bold text-purple-600 text-lg">
                            {totalJourneyTime > 0 ? `${Math.floor(totalJourneyTime / 60)}h ${totalJourneyTime % 60}m` : '--'}
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-600 block mb-1">Elapsed:</span>
                          <div className="font-bold text-green-600 text-lg">{getElapsedTime(busPosition)}</div>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-600 block mb-1">Event Time:</span>
                          <div className="font-bold text-pink-600 text-lg">{getCurrentTimeFromPosition(busPosition)}</div>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-600 block mb-1">GPS Points:</span>
                          <div className="font-bold text-orange-600 text-lg">{historicalData.length}</div>
                        </div>
                      </div>
                      
                      {currentGPSData && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Current GPS: {parseCoordinate(currentGPSData.latitude).toFixed(4)}, {parseCoordinate(currentGPSData.longitude).toFixed(4)}</span>
                            <span>Device Time: {formatDisplayTime(deviceTime)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced Slider */}
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={busPosition}
                      onChange={(e) => handleBusPositionChange(parseInt(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* Enhanced Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => setIsHistoricalPlaying(!isHistoricalPlaying)}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                        disabled={historicalData.length === 0}
                      >
                        {isHistoricalPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        <span>{isHistoricalPlaying ? 'Pause' : 'Play'}</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setBusPosition(0);
                          setIsHistoricalPlaying(false);
                          setRouteCompleted(false);
                          handleBusPositionChange(0);
                        }}
                        size="lg"
                        variant="outline"
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center space-x-2 px-6 py-3 font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>Reset</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      {historicalLoading && (
                        <div className="text-purple-600 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                          <span className="font-semibold">Loading...</span>
                        </div>
                      )}
                      {routeCompleted && (
                        <div className="text-green-600 flex items-center font-semibold">
                          <span>✓ Route Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Select Route Message */}
        {selectedRouteId === 'all' && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                  <Route className="w-8 h-8 mr-3 text-purple-600" />
                  Select a Route for Historical Data
                </div>
                <div className="text-gray-600 mb-4 text-lg">
                  Choose a specific route from the dropdown to view historical journey data
                </div>
                <div className="text-purple-600 font-semibold bg-purple-50 p-4 rounded-xl">
                  Historical tracking shows past bus movements, GPS data, and journey analysis
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Error Message */}
        {error && (
          <div className="absolute top-4 right-4 max-w-md">
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
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          cursor: pointer;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
          border: 3px solid white;
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8B5CF6, #EC4899);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
        }
      `}</style>
    </div>
  );
};

export default HistoricalMap;