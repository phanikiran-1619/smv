import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { FaTimes, FaMapMarkerAlt, FaSchool, FaRoute } from "react-icons/fa";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "70vh",
};

// Default center if no valid points are available
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }; // Default to Bengaluru

// Define colors for different routes
const ROUTE_COLORS = [
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#F59E0B", // Orange
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#FACC15", // Yellow
  "#06B6D4", // Cyan
  "#F87171", // Light Red
];

// Libraries for Google Maps
const libraries = ["places", "geometry"];

const AllRoutesPage = () => {
  const location = useLocation();
  const { pageTitle, userType, username } = location.state || { 
    pageTitle: 'All Routes', 
    userType: 'admin', 
    username: 'Admin' 
  };

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [routeDirections, setRouteDirections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [schoolPoint, setSchoolPoint] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [visibleRoutes, setVisibleRoutes] = useState([]);
  const [allRoutesVisible, setAllRoutesVisible] = useState(true);
  const modalRef = useRef(null);
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // Helper function to get auth token
  const getAuthToken = () => {
    try {
      return localStorage.getItem("admintoken");
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  };

  // Helper function to validate if a value is a finite number
  const isValidCoordinate = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  };

  // Helper function to parse coordinate string to number
  const parseCoordinate = (value) => {
    return parseFloat(value);
  };

  // Find common destination point (school)
  const findSchoolPoint = (routes) => {
    if (routes.length === 0) return null;
    
    const lastPoints = routes
      .filter(route => route.routePoints && route.routePoints.length > 0)
      .map(route => route.routePoints[route.routePoints.length - 1]);
    
    if (lastPoints.length === 0) return null;

    const firstPoint = lastPoints[0];
    const allSame = lastPoints.every(point => 
      point.latitude === firstPoint.latitude && 
      point.longitude === firstPoint.longitude
    );

    return allSame ? firstPoint : null;
  };

  // Handle individual route checkbox toggle
  const handleRouteToggle = (routeId) => {
    setVisibleRoutes(prev => {
      const newVisibleRoutes = prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId];
      
      setAllRoutesVisible(newVisibleRoutes.length === routes.length);
      return newVisibleRoutes;
    });
  };

  // Handle "All" checkbox toggle
  const handleAllRoutesToggle = () => {
    if (allRoutesVisible) {
      setVisibleRoutes([]);
      setAllRoutesVisible(false);
    } else {
      setVisibleRoutes(routes.map(route => route.smRouteId || route.id));
      setAllRoutesVisible(true);
    }
  };

  // Focus trapping for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedPoint) {
        setSelectedPoint(null);
      }

      if (!modalRef.current || !selectedPoint) return;
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPoint]);

  // Fetch routes from API
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    if (!token) {
      setError("No authorization token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const schoolId = localStorage.getItem("adminSchoolId") || "AC0F0001";
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      if (!API_BASE_URL) {
        throw new Error("API base URL is not configured");
      }

      const response = await fetch(`${API_BASE_URL}/route/school/${schoolId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
          localStorage.removeItem("admintoken");
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
      setVisibleRoutes(validRoutes.map(route => route.smRouteId || route.id));
      setAllRoutesVisible(true);
      const foundSchoolPoint = findSchoolPoint(validRoutes);
      setSchoolPoint(foundSchoolPoint);

      if (foundSchoolPoint && isValidCoordinate(foundSchoolPoint.latitude) && isValidCoordinate(foundSchoolPoint.longitude)) {
        setMapCenter({
          lat: parseCoordinate(foundSchoolPoint.latitude),
          lng: parseCoordinate(foundSchoolPoint.longitude),
        });
      } else if (validRoutes.length > 0 && validRoutes[0].routePoints.length > 0) {
        const firstPoint = validRoutes[0].routePoints[0];
        setMapCenter({
          lat: parseCoordinate(firstPoint.latitude),
          lng: parseCoordinate(firstPoint.longitude),
        });
      } else {
        setMapCenter(DEFAULT_CENTER);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(message);
      console.error("Route fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate directions for all routes
  useEffect(() => {
    if (isLoaded && routes.length > 0) {
      const calculateDirections = async () => {
        const directionsPromises = routes.map(async (route) => {
          const validPoints = route.routePoints
            .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude))
            .sort((a, b) => a.seqOrder - b.seqOrder);

          if (validPoints.length < 2) {
            return { routeId: route.smRouteId || route.id, directions: null };
          }

          try {
            const directionsService = new window.google.maps.DirectionsService();

            const waypoints = validPoints.slice(0, -1).map((point) => ({
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

            return { routeId: route.smRouteId || route.id, directions: result };
          } catch (error) {
            console.error(`Error calculating directions for route ${route.routeName}:`, error);
            return { routeId: route.smRouteId || route.id, directions: null };
          }
        });

        try {
          const directionsResults = await Promise.all(directionsPromises);
          setRouteDirections(directionsResults);
        } catch (error) {
          console.error("Error calculating directions:", error);
        }
      };

      calculateDirections();
    }
  }, [isLoaded, routes]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Function to get all route points from visible routes
  const getAllRoutePoints = () => {
    const routePoints = routes
      .filter(route => visibleRoutes.includes(route.smRouteId || route.id))
      .flatMap((route) => route.routePoints || [])
      .filter((point) => isValidCoordinate(point.latitude) && isValidCoordinate(point.longitude));
    
    // Always include school point if it exists
    if (schoolPoint && isValidCoordinate(schoolPoint.latitude) && isValidCoordinate(schoolPoint.longitude)) {
      const schoolExists = routePoints.some(point => 
        point.latitude === schoolPoint.latitude && 
        point.longitude === schoolPoint.longitude
      );
      if (!schoolExists) {
        routePoints.push(schoolPoint);
      }
    }
    
    return routePoints;
  };

  // Calculate text size based on zoom level
  const getMarkerTextSize = () => {
    if (zoomLevel >= 15) return "14px";
    if (zoomLevel >= 13) return "12px";
    return "10px";
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full" role="alert">
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md">
            <p className="text-red-400 font-semibold">Google Maps API Error</p>
            <p className="text-gray-300">{loadError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400 text-lg">Loading Route Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full" role="alert">
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md">
            <p className="text-red-400 font-semibold">{error}</p>
            {error.includes("Authentication") && (
              <button
                onClick={() => (window.location.href = "/login/admin")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
        <Navbar showBackButton={true} />
        <div className="pt-24 flex items-center justify-center h-full" role="status">
          <div className="text-center p-6 bg-slate-800 rounded-lg shadow-md">
            <p className="text-gray-300 font-medium">No valid routes available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white">
      <Navbar showBackButton={true} />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              {pageTitle}
            </h1>
            <p className="text-gray-300 text-lg">Interactive map view of all school routes</p>
          </div>

          <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  selectedPoint &&
                  isValidCoordinate(selectedPoint.latitude) &&
                  isValidCoordinate(selectedPoint.longitude)
                    ? {
                        lat: parseCoordinate(selectedPoint.latitude),
                        lng: parseCoordinate(selectedPoint.longitude),
                      }
                    : mapCenter
                }
                zoom={zoomLevel}
                options={{
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: true,
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }],
                    },
                    {
                      featureType: "transit",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }],
                    },
                    {
                      featureType: "all",
                      elementType: "labels.text",
                      stylers: [{ visibility: "simplified" }],
                    },
                  ],
                }}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                onZoomChanged={() => {
                  if (mapRef.current) {
                    setZoomLevel(mapRef.current.getZoom() || 12);
                  }
                }}
              >
                {routeDirections
                  .filter((routeDir) => visibleRoutes.includes(routeDir.routeId))
                  .map((routeDir, index) => {
                    if (!routeDir.directions) return null;

                    return (
                      <DirectionsRenderer
                        key={routeDir.routeId}
                        directions={routeDir.directions}
                        options={{
                          polylineOptions: {
                            strokeColor: ROUTE_COLORS[index % ROUTE_COLORS.length],
                            strokeWeight: 5,
                            zIndex: 10 + index,
                            strokeOpacity: 0.85,
                          },
                          suppressMarkers: true,
                          preserveViewport: true,
                        }}
                      />
                    );
                  })}

                {getAllRoutePoints().map((point) => {
                  const isSchool = schoolPoint && 
                    point.latitude === schoolPoint.latitude && 
                    point.longitude === schoolPoint.longitude;

                  return (
                    <Marker
                      key={`${point.smRoutePointId || point.id}-${point.id}`}
                      position={{
                        lat: parseCoordinate(point.latitude),
                        lng: parseCoordinate(point.longitude),
                      }}
                      onClick={() => setSelectedPoint(point)}
                      icon={{
                        url: isSchool ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23EF4444'%3E%3Cpath d='M12 2L13.09 7.09L18 6L16.91 11.09L22 12L16.91 12.91L18 18L12.91 16.91L12 22L11.09 16.91L6 18L7.09 12.91L2 12L7.09 11.09L6 6L11.09 7.09L12 2Z'/%3E%3C/svg%3E" : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%233B82F6'%3E%3Cpath d='M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z'/%3E%3C/svg%3E",
                        scaledSize: new window.google.maps.Size(isSchool ? 40 : 28, isSchool ? 40 : 28),
                      }}
                      label={isSchool ? undefined : {
                        text: point.routePointName || `Point ${point.seqOrder}`,
                        color: "#1F2937",
                        fontSize: getMarkerTextSize(),
                        fontWeight: "normal",
                        className: "marker-label bg-white bg-opacity-80 px-2 py-1 rounded",
                      }}
                      zIndex={isSchool ? 1000 : 100}
                      animation={isSchool ? window.google.maps.Animation.BOUNCE : undefined}
                    />
                  );
                })}
              </GoogleMap>
            )}

            {/* Route legend with checkboxes */}
            <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg max-w-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaRoute className="text-blue-500" />
                Route Legend
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="route-all"
                    checked={allRoutesVisible}
                    onChange={handleAllRoutesToggle}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="route-all" className="text-sm text-gray-700 font-medium cursor-pointer">
                    All Routes
                  </label>
                </div>
                {routes.map((route, index) => (
                  <div key={route.smRouteId || route.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`route-${route.smRouteId || route.id}`}
                      checked={visibleRoutes.includes(route.smRouteId || route.id)}
                      onChange={() => handleRouteToggle(route.smRouteId || route.id)}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ROUTE_COLORS[index % ROUTE_COLORS.length] }}
                    ></div>
                    <label htmlFor={`route-${route.smRouteId || route.id}`} className="text-sm text-gray-700 truncate cursor-pointer">
                      {route.routeName}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {selectedPoint && (
              <div
                ref={modalRef}
                className="absolute top-6 right-6 w-80 bg-white rounded-xl shadow-xl p-5"
                role="dialog"
                aria-labelledby="route-point-title"
                aria-modal="true"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 id="route-point-title" className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaMapMarkerAlt className="w-5 h-5 mr-2 text-blue-500" />
                    Point Details
                  </h3>
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close route point details"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{selectedPoint.routePointName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Coordinates:</span>
                    <span>{`${selectedPoint.latitude}, ${selectedPoint.longitude}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sequence:</span>
                    <span>{selectedPoint.seqOrder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className={`font-medium ${selectedPoint.status ? "text-green-500" : "text-red-500"}`}>
                      {selectedPoint.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {schoolPoint && selectedPoint.latitude === schoolPoint.latitude && selectedPoint.longitude === schoolPoint.longitude && (
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span className="text-blue-500 font-medium flex items-center gap-1">
                        <FaSchool />
                        School
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRoutesPage;