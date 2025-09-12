import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Search, MapPin, Bus, Users, School, Navigation, Clock, History, Route, AlertCircle, ChevronRight } from 'lucide-react';
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
  
  // Refs
  const mapRef = useRef(null);
  const timeUpdateRef = useRef(null);
  const mapPinIconRef = useRef(null);
  const schoolIconRef = useRef(null);
  const busIconRef = useRef(null);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
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

  const formattedDate = format(currentTime, 'EEE, MMM d');
  const formattedTime = formatDisplayTime(currentTime);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Enhanced Top Controls with Dropdown on Top-Right */}
      <div className="bg-white/10 backdrop-blur-xl p-4 lg:p-6 flex items-center justify-between border-b border-white/20 flex-wrap gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent truncate">
            🚌 {showAllRoutes ? 'ALL ROUTES - LIVE VIEW' : selectedRoute?.routeName || 'LIVE MAP'}
          </div>
          {loading && (
            <div className="text-sm text-gray-300 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
              Loading routes...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/dashboard/admin')}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600 font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ← Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/historical-map', { 
              state: { pageTitle: 'Historical Map', userType, username } 
            })}
            className="px-6 py-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full border border-white/30 transition-all duration-200 flex items-center space-x-2"
          >
            <History className="w-4 h-4" />
            <span>Historical</span>
          </Button>
          <div className="w-48">
            <Select value={selectedRouteId} onValueChange={handleRouteSelect}>
              <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/30 text-white rounded-xl py-4 font-medium hover:bg-white/20 transition-all">
                <div className="flex items-center">
                  <Route className="w-4 h-4 mr-2 text-blue-400" />
                  <SelectValue placeholder="Select Route" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 rounded-xl text-gray-900">
                <div className="p-3 bg-gray-50">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <Input
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <SelectItem value="all" className="font-semibold hover:bg-gray-100">
                  <div className="flex items-center">
                    <Navigation className="w-4 h-4 mr-2 text-blue-600" />
                    All Routes
                  </div>
                </SelectItem>
                {filteredRoutes.map((route) => (
                  <SelectItem 
                    key={route.smRouteId || route.id} 
                    value={route.smRouteId || route.id}
                    className="hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <Bus className="w-4 h-4 mr-2 text-blue-600" />
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

              {/* Bus Marker at Starting Point for Single Route */}
              {!showAllRoutes && displayPoints.length > 0 && busIconRef.current && (
                <Marker
                  position={{
                    lat: parseCoordinate(displayPoints[0].latitude),
                    lng: parseCoordinate(displayPoints[0].longitude),
                  }}
                  icon={busIconRef.current}
                  zIndex={1001}
                />
              )}
            </GoogleMap>
          )}
        </div>

        {/* Enhanced Live Mode Preview Card - Vertical on the left, wider and attractive */}
        {!showAllRoutes && selectedRoute && routeDisplayInfo && (
          <div className="absolute left-4 top-4 bottom-4 w-96 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl z-10 border border-gray-700/50 backdrop-blur-md bg-opacity-95 overflow-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-md"></div>
            <div className="relative">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-extrabold text-2xl text-white tracking-tight">{selectedRoute.routeName}</h2>
                  <p className="text-sm text-gray-300 font-medium">{formattedDate} • {formattedTime}</p>
                </div>
                <div
                  className={`${
                    isMorningShift() ? 'bg-yellow-500/20 text-yellow-300' : 'bg-purple-500/20 text-purple-300'
                  } px-3 py-1 rounded-full text-xs font-semibold border border-current shadow-sm animate-pulse`}
                >
                  {isMorningShift() ? 'Morning Shift' : 'Evening Shift'}
                </div>
              </div>

              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg shadow-md">
                <p className="text-yellow-300 text-sm font-medium text-center">Bus not started yet</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span className="font-medium">Route Progress</span>
                  <span className="font-bold">0%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg animate-pulse"
                    style={{ width: `0%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto pr-3 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {displayPoints.map((point, index) => {
                  const isStart = index === 0;
                  const isEnd = index === displayPoints.length - 1;
                  const isBoardingPoint = point.routePointName.toLowerCase().includes('boarding') || point.id === 226; // Example
                  const isCompleted = false; // No real-time
                  const isCurrent = false; // No real-time

                  return (
                    <div key={point.id} className="relative">
                      {index < displayPoints.length - 1 && (
                        <div
                          className={`absolute left-8 top-12 w-0.5 h-12 z-0 ${
                            isCompleted ? 'bg-gradient-to-b from-blue-500 to-purple-500' : 'bg-gray-600'
                          }`}
                        ></div>
                      )}
                      <div
                        className={`flex items-start p-3 rounded-xl relative z-10 w-full transition-all duration-300 ${
                          isCurrent
                            ? 'bg-blue-900/30 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                            : isCompleted
                            ? 'bg-gray-700/30'
                            : 'bg-gray-800/30'
                        } hover:bg-gray-700/50 hover:shadow-lg hover:shadow-blue-500/10`}
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
                              ? 'bg-blue-500 shadow-lg shadow-blue-500/20'
                              : 'bg-blue-400 shadow-md'
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
                              isCurrent ? 'text-blue-300 font-semibold' : isCompleted ? 'text-gray-400' : 'text-white'
                            }`}
                          >
                            {point.routePointName}
                            {isBoardingPoint && (
                              <span className="ml-2 bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full border border-purple-400/30">
                                {isMorningShift() ? 'Boarding' : 'Destination'}
                              </span>
                            )}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-blue-300 mt-1 flex items-center">
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
                            <div className="animate-pulse bg-blue-500 rounded-full p-2 shadow-lg shadow-blue-500/30">
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
                        <div className="absolute left-full ml-4 px-6 py-4 bg-gray-900/95 backdrop-blur-md text-white text-sm rounded-xl shadow-2xl whitespace-nowrap z-20 min-w-64 border border-gray-700">
                          <div className="font-bold text-blue-400 mb-2 text-base">{point.routePointName}</div>
                          <div className="text-green-400 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Current Time: {formattedTime}
                          </div>
                          <div className="text-yellow-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Status: Bus not started yet
                          </div>
                          <div className="absolute right-full top-1/2 transform translate-x-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 rotate-180"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-2 rounded-full border border-blue-400/30 shadow-md">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">Bus Status</p>
                    <p className="text-xs text-gray-300">Next: Calculating...</p>
                  </div>
                </div>
              </div>
            </div>
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