import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin, Bus, Users, School, Navigation, Clock, History, Route, AlertCircle, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { format } from 'date-fns';
import { Client } from '@stomp/stompjs';
import { toast } from '../hooks/use-toast';
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

const LiveMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pageTitle, userType, username } = location.state || { 
    pageTitle: 'Live Map', 
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeDirections, setRouteDirections] = useState([]);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [busPositions, setBusPositions] = useState({});
  const [isFollowingBus, setIsFollowingBus] = useState(false);
  const [followedDeviceId, setFollowedDeviceId] = useState(null);
  
  // Refs
  const mapRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const mapPinIconRef = useRef(null);
  const schoolIconRef = useRef(null);
  const busIconRef = useRef(null);
  const stompClientRef = useRef(null);
  const animationRefs = useRef({});
  const lastPositionsRef = useRef({});

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Set up icons when loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      mapPinIconRef.current = {
        url: '/assets/map.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };
      schoolIconRef.current = {
        url: '/assets/school2.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };
      busIconRef.current = {
        url: '/assets/bus.png',
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24),
      };
    }
  }, [isLoaded]);

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

  // Format time to display format
  const formatDisplayTime = (date) => {
    return format(date, 'HH:mm:ss');
  };

  // Determine if it's morning or evening shift
  const isMorningShift = () => {
    const hour = currentTime.getHours();
    return hour >= 0 && hour < 12; // 12:00 AM to 11:59 AM
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

  // Set initial bus positions for each route if no real position
  useEffect(() => {
    if (routes.length > 0 && isLoaded) {
      setBusPositions(prev => {
        let newPositions = { ...prev };
        routes.forEach(route => {
          const rid = route.smRouteId || route.id;
          const hasRealBus = Object.entries(prev).some(([id, pos]) => pos.routeId === rid && !id.startsWith('default-'));
          if (!hasRealBus) {
            let validPoints = route.routePoints
              .filter(p => isValidCoordinate(p.latitude) && isValidCoordinate(p.longitude))
              .sort((a, b) => a.seqOrder - b.seqOrder);
            if (!isMorningShift()) {
              validPoints = validPoints.reverse();
            }
            if (validPoints.length > 0) {
              const startPoint = validPoints[0];
              const defaultDeviceId = `default-${rid}`;
              newPositions[defaultDeviceId] = {
                lat: parseCoordinate(startPoint.latitude),
                lng: parseCoordinate(startPoint.longitude),
                heading: 0,
                timestamp: Date.now(),
                routeId: rid,
                deviceId: defaultDeviceId,
                schoolId: route.schId || 'unknown'
              };
            }
          }
        });
        return newPositions;
      });
    }
  }, [routes, isLoaded, currentTime]);

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

  // Handle route selection
  const handleRouteSelect = (routeId) => {
    if (routeId === 'all') {
      setSelectedRoute(null);
      setSelectedRouteId('all');
      setShowAllRoutes(true);
      calculateAllDirections(routes);
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      if (route) {
        setSelectedRoute(route);
        setSelectedRouteId(routeId);
        setShowAllRoutes(false);
        calculateDirections(route);
        updateMapCenter(route);
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

    let validPoints = route.routePoints
      .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
      .sort((a, b) => a.seqOrder - b.seqOrder);

    if (!isMorningShift()) {
      validPoints = validPoints.reverse(); // Reverse for evening shift: school to destination
    }

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
      let validPoints = route.routePoints
        .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
        .sort((a, b) => a.seqOrder - b.seqOrder);

      if (!isMorningShift()) {
        validPoints = validPoints.reverse();
      }

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

  // Get route display info
  const getRouteDisplayInfo = () => {
    if (!selectedRoute || !selectedRoute.routePoints || showAllRoutes) return null;
    
    let points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    if (!isMorningShift()) {
      points = points.reverse(); // Evening: school to destination
    }
    
    return {
      start: points[0]?.routePointName || 'Start',
      end: points[points.length - 1]?.routePointName || 'End'
    };
  };

  // Get route points for preview card
  const getRoutePointsForDisplay = () => {
    if (!selectedRoute || !selectedRoute.routePoints || showAllRoutes) return [];
    
    let points = [...selectedRoute.routePoints].sort((a, b) => a.seqOrder - b.seqOrder);
    if (!isMorningShift()) {
      points = points.reverse(); // Evening: school to destination
    }
    
    return points.map((point, index) => ({
      ...point,
      displayOrder: index + 1,
      isSchoolPoint: index === points.length - 1 && isMorningShift() || index === 0 && !isMorningShift(),
      isDestinationPoint: false
    }));
  };

  // Get all route points when showing all routes
  const getAllRoutePoints = () => {
    const allPoints = routes.flatMap(route => route.routePoints || [])
      .filter(point => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude));
    
    // Find unique school locations
    const uniquePoints = [];
    const schoolCoordinates = new Set();
    
    allPoints.forEach(point => {
      const coordKey = `${point.latitude}_${point.longitude}`;
      
      const sameLocationPoints = allPoints.filter(p => 
        p.latitude === point.latitude && p.longitude === point.longitude
      );
      
      if (sameLocationPoints.length > 1) {
        if (!schoolCoordinates.has(coordKey)) {
          schoolCoordinates.add(coordKey);
          uniquePoints.push({
            ...point,
            isSchoolLocation: true,
            routePointName: point.routePointName.toLowerCase().includes('school') ? 
              point.routePointName : 'School'
          });
        }
      } else {
        uniquePoints.push({
          ...point,
          isSchoolLocation: false
        });
      }
    });
    
    return uniquePoints;
  };

  // WebSocket connection for real-time bus tracking
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'No token found. Please log in again.',
        variant: 'destructive',
        duration: 5000,
      });
      navigate('/login/admin');
      return;
    }

    const apiBase = process.env.REACT_APP_API_BASE_URL;
    if (!apiBase) {
      console.error('API base URL is not defined');
      toast({
        title: 'Configuration Error',
        description: 'API base URL is not defined.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }
    
    const wsBase = apiBase.replace(/^http/, 'ws').replace(/\/api\/v1$/, '');
    const brokerURL = `${wsBase}/ws/gps`;

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      webSocketFactory: () => new WebSocket(brokerURL),
      debug: (str) => console.log('[DEBUG]', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket STOMP broker');

      // Subscribe to the GPS updates topic
      client.subscribe(`/topic/gps-updates`, (message) => {
        try {
          const data = JSON.parse(message.body);
          if (data.type === 'gps_location' && data.latitude && data.longitude) {
            const dataTimestamp = Date.parse(data.timestamp);
            const deviceId = data.deviceId;
            const lastPosition = lastPositionsRef.current[deviceId];

            if (lastPosition && dataTimestamp <= lastPosition.timestamp) {
              console.log(`Ignoring old update for ${deviceId}`);
              return;
            }

            // Update bus position
            const newPosition = {
              lat: Number(data.latitude),
              lng: Number(data.longitude),
              heading: data.heading || undefined,
              timestamp: dataTimestamp,
              routeId: data.routeId,
              deviceId: data.deviceId,
              schoolId: data.schoolId
            };

            setBusPositions(prev => ({
              ...prev,
              [deviceId]: newPosition
            }));

            // If we're following this bus, update the map center
            if (isFollowingBus && followedDeviceId === deviceId && mapRef.current) {
              setMapCenter({ lat: newPosition.lat, lng: newPosition.lng });
              mapRef.current.panTo({ lat: newPosition.lat, lng: newPosition.lng });
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      console.log('Subscribed to /topic/gps-updates');
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
      toast({
        title: 'WebSocket Error',
        description: 'Failed to connect to real-time updates. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate().then(() => {
          console.log('Disconnected cleanly.');
        });
      }
    };
  }, [navigate, isFollowingBus, followedDeviceId]);

  // Smooth animation for bus movement
  const animateBusMovement = useCallback((deviceId, start, end) => {
    if (animationRefs.current[deviceId]) {
      cancelAnimationFrame(animationRefs.current[deviceId]);
    }

    const startTime = Date.now();
    const duration = 2000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
      const easedProgress = ease(progress);

      const lat = start.lat + (end.lat - start.lat) * easedProgress;
      const lng = start.lng + (end.lng - start.lng) * easedProgress;

      let heading = start.heading;
      if (start.lat !== end.lat || start.lng !== end.lng) {
        heading = window.google.maps.geometry.spherical.computeHeading(
          new window.google.maps.LatLng(start.lat, start.lng),
          new window.google.maps.LatLng(end.lat, end.lng)
        );
      }

      const newPosition = {
        lat,
        lng,
        heading,
        timestamp: Date.now(),
        routeId: end.routeId,
        deviceId: end.deviceId,
        schoolId: end.schoolId
      };

      setBusPositions(prev => ({
        ...prev,
        [deviceId]: newPosition
      }));

      if (progress < 1) {
        animationRefs.current[deviceId] = requestAnimationFrame(animate);
      } else {
        lastPositionsRef.current[deviceId] = end;
      }
    };

    animationRefs.current[deviceId] = requestAnimationFrame(animate);
  }, []);

  // Update bus positions with animation
  useEffect(() => {
    Object.entries(busPositions).forEach(([deviceId, position]) => {
      const lastPosition = lastPositionsRef.current[deviceId];
      
      if (lastPosition && 
          (lastPosition.lat !== position.lat || lastPosition.lng !== position.lng)) {
        animateBusMovement(deviceId, lastPosition, position);
      } else if (!lastPosition) {
        lastPositionsRef.current[deviceId] = position;
      }
    });
  }, [busPositions, animateBusMovement]);

  // Toggle follow bus mode for specific device
  const toggleFollowBus = (deviceId, routeId) => {
    if (isFollowingBus && followedDeviceId === deviceId) {
      setIsFollowingBus(false);
      setFollowedDeviceId(null);
    } else {
      const route = routes.find(r => (r.smRouteId || r.id) === routeId);
      if (route) {
        setIsFollowingBus(true);
        setFollowedDeviceId(deviceId);
        setSelectedRouteId(routeId);
        setSelectedRoute(route);
        setShowAllRoutes(false);
        calculateDirections(route);
        
        // Center on the bus
        const busPosition = busPositions[deviceId];
        if (busPosition && mapRef.current) {
          setMapCenter({ lat: busPosition.lat, lng: busPosition.lng });
          mapRef.current.panTo({ lat: busPosition.lat, lng: busPosition.lng });
        }
      }
    }
  };

  // Center map on a specific bus
  const centerMapOnBus = (deviceId) => {
    const busPosition = busPositions[deviceId];
    if (busPosition && mapRef.current) {
      setMapCenter({ lat: busPosition.lat, lng: busPosition.lng });
      mapRef.current.panTo({ lat: busPosition.lat, lng: busPosition.lng });
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
  }, [routes, selectedRoute, showAllRoutes, isLoaded, currentTime]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full">
          <div className="text-center p-6 dark:bg-slate-800/60 dark:border-slate-600 bg-white/80 border-gray-200 backdrop-blur-sm rounded-lg shadow-xl border">
            <p className="text-red-400 font-semibold">Google Maps API Error</p>
            <p className="dark:text-gray-300 text-gray-600">{loadError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const routeDisplayInfo = getRouteDisplayInfo();
  const displayPoints = getRoutePointsForDisplay();

  const formattedDate = format(currentTime, 'EEE, MMM d');
  const formattedTime = formatDisplayTime(currentTime);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 from-gray-50 via-gray-100 to-gray-200 dark:text-white text-gray-800 overflow-hidden">
      {/* Enhanced Top Controls with Dropdown on Top-Right */}
      <div className="dark:bg-slate-800/80 bg-white/80 backdrop-blur-xl p-4 lg:p-6 flex items-center justify-between border-b dark:border-slate-600 border-gray-200 flex-wrap gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r dark:from-yellow-400 dark:via-orange-500 dark:to-red-500 from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent truncate">
            🚌 {showAllRoutes ? 'ALL ROUTES - LIVE VIEW' : selectedRoute?.routeName || 'LIVE MAP'}
          </div>
          {loading && (
            <div className="text-sm dark:text-gray-300 text-gray-600 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 dark:border-yellow-400 border-blue-500 mr-2"></div>
              Loading routes...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/dashboard/admin')}
            className="px-6 py-2 bg-gradient-to-r dark:from-yellow-500 dark:to-orange-500 dark:text-black from-blue-500 to-blue-600 text-white dark:hover:from-yellow-600 dark:hover:to-orange-600 hover:from-blue-600 hover:to-blue-700 font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ← Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/historical-map', { 
              state: { pageTitle: 'Historical Map', userType, username } 
            })}
            className="px-6 py-2 dark:bg-slate-700/50 bg-gray-200/50 backdrop-blur-md dark:hover:bg-slate-700 hover:bg-gray-300 dark:text-white text-gray-800 rounded-full dark:border-slate-600 border-gray-300 border transition-all duration-200 flex items-center space-x-2"
          >
            <History className="w-4 h-4" />
            <span>Historical</span>
          </Button>
          <div className="w-48">
            <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
              <SelectTrigger className="dark:bg-slate-700/50 dark:border-slate-600 bg-gray-200/50 border-gray-300 dark:text-white text-gray-800 rounded-xl py-4 font-medium dark:hover:bg-slate-700 hover:bg-gray-300 transition-all">
                <div className="flex items-center">
                  <Route className="w-4 h-4 mr-2 dark:text-yellow-400 text-blue-600" />
                  <SelectValue placeholder="Select Route" />
                </div>
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-700 dark:border-slate-600 bg-white border-gray-200 rounded-xl dark:text-white text-gray-800">
                <div className="p-3 dark:bg-slate-800 bg-gray-50">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 bg-white border-gray-300 text-gray-800 placeholder-gray-500 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <SelectItem value="all" className="font-semibold dark:hover:bg-slate-600 hover:bg-gray-100">
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-2 dark:text-yellow-400 text-blue-600" />
                    All Routes
                  </div>
                </SelectItem>
                {filteredRoutes.map((route) => (
                  <SelectItem 
                    key={route.smRouteId || route.id} 
                    value={route.smRouteId || route.id}
                    className="dark:hover:bg-slate-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 mr-2 dark:text-yellow-400 text-blue-600" />
                      {route.routeName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Map and Preview Card */}
      <div className="flex-1 relative flex">
        {/* Map */}
        <div className="flex-1">
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
              {(showAllRoutes ? getAllRoutePoints() : displayPoints).map((point, index) => {
                const isSchool = showAllRoutes ? point.isSchoolLocation : point.routePointName.toLowerCase().includes('school');
                return (
                  <Marker
                    key={point.smRoutePointId || point.id}
                    position={{
                      lat: parseCoordinate(point.latitude),
                      lng: parseCoordinate(point.longitude),
                    }}
                    icon={isSchool ? schoolIconRef.current : mapPinIconRef.current}
                    title={point.routePointName}
                    label={!showAllRoutes && !isSchool ? {
                      text: (index + 1).toString(),
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      className: 'absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md',
                    } : null}
                    zIndex={isSchool ? 1000 : 100}
                  />
                );
              })}

              {/* Bus Markers */}
              {Object.entries(busPositions).map(([deviceId, position]) => {
                const routeForBus = routes.find(route => 
                  (route.smRouteId || route.id) === position.routeId
                );
                
                if (!routeForBus) return null;
                
                const isDefault = deviceId.startsWith('default-');
                const title = isDefault ? `Awaiting start - ${routeForBus.routeName}` : `Bus ${deviceId} - ${routeForBus.routeName}`;
                
                return (
                  <Marker
                    key={deviceId}
                    position={{
                      lat: position.lat,
                      lng: position.lng,
                    }}
                    icon={{
                      ...busIconRef.current,
                      rotation: position.heading || 0,
                    }}
                    zIndex={1001}
                    title={title}
                    onClick={() => {
                      toggleFollowBus(deviceId, position.routeId);
                    }}
                  />
                );
              })}
            </GoogleMap>
          )}
        </div>

        {/* Enhanced Live Mode Preview Card - Vertical on the left, wider and attractive */}
        {!showAllRoutes && selectedRoute && routeDisplayInfo && (
          <div className="absolute left-4 top-4 bottom-4 w-96 bg-gradient-to-br dark:from-slate-800/95 dark:to-slate-900/95 from-white/95 to-gray-100/95 p-6 rounded-2xl shadow-2xl z-10 dark:border-slate-600/50 border-gray-300/50 border backdrop-blur-md overflow-auto">
            <div className="absolute inset-0 bg-gradient-to-r dark:from-yellow-500/10 dark:to-orange-500/10 from-blue-500/10 to-blue-600/10 rounded-2xl blur-md"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-extrabold text-2xl dark:text-white text-gray-800 tracking-tight">{selectedRoute.routeName}</h2>
                  <p className="text-sm dark:text-gray-300 text-gray-600 font-medium">{formattedDate} • {formattedTime}</p>
                </div>
                <div
                  className={`${
                    isMorningShift() ? 'dark:bg-yellow-500/20 dark:text-yellow-300 bg-yellow-100 text-yellow-800' : 'dark:bg-purple-500/20 dark:text-purple-300 bg-purple-100 text-purple-800'
                  } px-3 py-1 rounded-full text-xs font-semibold border border-current shadow-sm animate-pulse`}
                >
                  {isMorningShift() ? 'Morning Shift' : 'Evening Shift'}
                </div>
              </div>

              {/* Bus Status */}
              {Object.entries(busPositions).filter(([id, pos]) => pos.routeId === selectedRouteId && !id.startsWith('default-')).length > 0 ? (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg shadow-md">
                  <p className="text-green-300 text-sm font-medium text-center">Bus is active and moving</p>
                </div>
              ) : (
                <div className="mb-4 p-3 dark:bg-yellow-500/20 dark:border-yellow-500/30 bg-yellow-100 border-yellow-300 border rounded-lg shadow-md">
                  <p className="dark:text-yellow-300 text-yellow-800 text-sm font-medium text-center">Bus not started yet</p>
                </div>
              )}

              <div className="mb-6">
                <div className="flex justify-between text-sm dark:text-gray-300 text-gray-600 mb-2">
                  <span className="font-medium">Active Buses</span>
                  <span className="font-bold">
                    {Object.entries(busPositions).filter(([id, pos]) => pos.routeId === selectedRouteId && !id.startsWith('default-')).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(busPositions)
                    .filter(([id, pos]) => pos.routeId === selectedRouteId && !id.startsWith('default-'))
                    .map(([deviceId, position]) => (
                      <div key={deviceId} className="flex items-center justify-between p-2 dark:bg-slate-700/30 bg-gray-100/50 rounded-lg">
                        <div className="flex items-center">
                          <Bus className="w-4 h-4 mr-2 dark:text-yellow-400 text-blue-600" />
                          <span className="text-sm dark:text-white text-gray-800">Bus {deviceId}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => centerMapOnBus(deviceId)}
                            className="dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:text-black bg-blue-600 hover:bg-blue-700 text-white text-xs"
                          >
                            Center
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => toggleFollowBus(deviceId, position.routeId)}
                            className={`${isFollowingBus && followedDeviceId === deviceId ? 'bg-green-600' : 'dark:bg-slate-600 bg-gray-400'} hover:bg-green-700 text-white text-xs`}
                          >
                            {isFollowingBus && followedDeviceId === deviceId ? 'Following' : 'Follow'}
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto pr-3 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {displayPoints.map((point, index) => {
                  const isStart = index === 0;
                  const isEnd = index === displayPoints.length - 1;
                  const isBoardingPoint = point.routePointName.toLowerCase().includes('boarding') || point.id === 226;
                  const isCompleted = false; // No real-time
                  const isCurrent = false; // No real-time

                  return (
                    <div key={point.id} className="relative">
                      {index < displayPoints.length - 1 && (
                        <div
                          className={`absolute left-8 top-12 w-0.5 h-12 z-0 ${
                            isCompleted ? 'bg-gradient-to-b dark:from-yellow-500 dark:to-orange-500 from-blue-500 to-blue-600' : 'dark:bg-slate-600 bg-gray-400'
                          }`}
                        ></div>
                      )}
                      <div
                        className={`flex items-start p-3 rounded-xl relative z-10 w-full transition-all duration-300 ${
                          isCurrent
                            ? 'dark:bg-slate-700/30 dark:border-yellow-500/50 bg-blue-100/50 border-blue-500/50 border shadow-lg dark:shadow-yellow-500/20 shadow-blue-500/20'
                            : isCompleted
                            ? 'dark:bg-slate-700/30 bg-gray-100/30'
                            : 'dark:bg-slate-800/30 bg-gray-50/30'
                        } dark:hover:bg-slate-700/50 hover:bg-gray-100/50 hover:shadow-lg dark:hover:shadow-yellow-500/10 hover:shadow-blue-500/10`}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5 ${
                            isStart
                              ? 'bg-green-500 shadow-lg shadow-green-500/30'
                              : isEnd
                              ? 'bg-red-500 shadow-lg shadow-red-500/30'
                              : isBoardingPoint
                              ? 'bg-purple-500 shadow-lg shadow-purple-500/30'
                              : isCompleted
                              ? 'dark:bg-yellow-500 bg-blue-500 shadow-lg dark:shadow-yellow-500/20 shadow-blue-500/20'
                              : 'dark:bg-yellow-400 bg-blue-400 shadow-md'
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <span className="text-sm text-white font-bold">{point.displayOrder}</span>
                          )}
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isCurrent ? 'dark:text-yellow-300 text-blue-600 font-semibold' : isCompleted ? 'dark:text-gray-400 text-gray-500' : 'dark:text-white text-gray-800'
                            }`}
                          >
                            {point.routePointName}
                            {isBoardingPoint && (
                              <span className="ml-2 dark:bg-purple-500/20 dark:text-purple-300 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full dark:border-purple-400/30 border-purple-300 border">
                                {isMorningShift() ? 'Boarding' : 'Destination'}
                              </span>
                            )}
                          </p>
                          {isCurrent && (
                            <p className="text-xs dark:text-yellow-300 text-blue-600 mt-1 flex items-center">
                              <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M5 9a7 7 0 1110 0A7 7 0 015 9zm7-5a5 5 0 00-5 5c5 0 5 5 5 5s5-2.24 5-5a5 5 0 00-5-5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Approaching...
                            </p>
                          )}
                        </div>
                        {isCurrent && (
                          <div className="ml-auto flex-shrink-0">
                            <div className="animate-pulse dark:bg-yellow-500 bg-blue-500 rounded-full p-2 shadow-lg dark:shadow-yellow-500/30 shadow-blue-500/30">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Enhanced Hover Tooltip */}
                      {hoveredPoint && hoveredPoint.id === point.id && (
                        <div className="absolute left-full ml-4 px-6 py-4 dark:bg-slate-800/95 bg-white/95 backdrop-blur-md dark:text-white text-gray-800 text-sm rounded-xl shadow-2xl whitespace-nowrap z-20 min-w-64 dark:border-slate-600 border-gray-300 border">
                          <div className="font-bold dark:text-yellow-400 text-blue-600 mb-2 text-base">{point.routePointName}</div>
                          <div className="text-green-400 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Current Time: {formattedTime}
                          </div>
                          <div className="dark:text-yellow-400 text-orange-500 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Status: {Object.entries(busPositions).filter(([id, pos]) => pos.routeId === selectedRouteId && !id.startsWith('default-')).length > 0 ? 'Bus active' : 'Bus not started yet'}
                          </div>
                          <div className="absolute right-full top-1/2 transform translate-x-1/2 -translate-y-1/2 border-8 border-transparent dark:border-r-slate-800 border-r-white rotate-180"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r dark:from-slate-700/30 dark:to-slate-800/30 from-gray-100/30 to-gray-200/30 rounded-xl dark:border-slate-600/20 border-gray-300/20 border shadow-lg dark:shadow-yellow-500/10 shadow-blue-500/10">
                <div className="flex items-center">
                  <div className="dark:bg-yellow-500/20 bg-blue-500/20 p-2 rounded-full dark:border-yellow-400/30 border-blue-400/30 border shadow-md">
                    <Bus className="w-6 h-6 dark:text-white text-gray-800" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium dark:text-white text-gray-800">Bus Status</p>
                    <p className="text-xs dark:text-gray-300 text-gray-600">
                      {Object.entries(busPositions).filter(([id, pos]) => pos.routeId === selectedRouteId && !id.startsWith('default-')).length > 0 
                        ? 'Active and moving' 
                        : 'Not started yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bus List Panel for All Routes View */}
        {showAllRoutes && Object.keys(busPositions).length > 0 && (
          <div className="absolute right-4 top-4 w-80 bg-gradient-to-br dark:from-slate-800/95 dark:to-slate-900/95 from-white/95 to-gray-100/95 p-6 rounded-2xl shadow-2xl z-10 dark:border-slate-600/50 border-gray-300/50 border backdrop-blur-md overflow-auto max-h-96">
            <h3 className="font-bold text-lg dark:text-white text-gray-800 mb-4">Active Buses</h3>
            <div className="space-y-3">
              {Object.entries(busPositions).filter(([id]) => !id.startsWith('default-')).map(([deviceId, position]) => {
                const routeForBus = routes.find(route => 
                  (route.smRouteId || route.id) === position.routeId
                );
                
                return (
                  <div key={deviceId} className="p-3 dark:bg-slate-700/30 bg-gray-100/50 rounded-lg dark:border-slate-600/20 border-gray-300/20 border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="dark:text-white text-gray-800 font-medium">Bus {deviceId}</p>
                        <p className="dark:text-gray-300 text-gray-600 text-sm">{routeForBus?.routeName || 'Unknown Route'}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => toggleFollowBus(deviceId, position.routeId)}
                        className="dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:text-black bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isFollowingBus && followedDeviceId === deviceId ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                    <div className="mt-2 text-xs dark:text-gray-400 text-gray-500">
                      Updated: {new Date(position.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enhanced Error Message */}
        {error && (
          <div className="absolute top-4 right-4 max-w-md">
            <Card className="dark:bg-red-900/95 bg-red-100/95 dark:border-red-700 border-red-300 backdrop-blur-md p-4 rounded-xl">
              <div className="dark:text-red-300 text-red-800 text-sm flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6B7280;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default LiveMap;