import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import { toast } from '../hooks/use-toast';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const libraries = ['places', 'geometry'];

const mapOptions = {
  styles: [
    { featureType: 'poi.business', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.attraction', elementType: 'all', stylers: [{ visibility: 'on' }] },
    { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'administrative.locality', elementType: 'labels', stylers: [{ visibility: 'on' }] },
    { featureType: 'landscape.natural', elementType: 'all', stylers: [{ visibility: 'on' }] },
  ],
};

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

const StudentMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, routeId, username } = location.state || { studentName: 'Student', routeId: null, username: 'User' };
  const [error, setError] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [isFollowingBus, setIsFollowingBus] = useState(true);
  const [completedRoutePath, setCompletedRoutePath] = useState([]);
  const [upcomingRoutePath, setUpcomingRoutePath] = useState([]);
  const [etaToNextStop, setEtaToNextStop] = useState('');
  const [busInfo, setBusInfo] = useState({ nextStop: '' });
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMorningShift, setIsMorningShift] = useState(true);
  const [routeSegments, setRouteSegments] = useState([]);
  const [busStatusMessage, setBusStatusMessage] = useState('');

  const mapRef = useRef(null);
  const stompClientRef = useRef(null);
  const lastPositionRef = useRef(null);
  const animationRef = useRef(null);
  const routePathRef = useRef([]);
  const directionsServiceRef = useRef(null);
  const stopPathIndicesRef = useRef([]);
  const timeIntervalRef = useRef(null);

  const busIconRef = useRef({
    url: '/assets/bus.png',
    scaledSize: undefined,
    anchor: undefined,
  });
  const mapPinIconRef = useRef({
    url: '/assets/map.png',
    scaledSize: undefined,
    anchor: undefined,
  });
  const boardingPointIconRef = useRef({
    url: '/assets/boarding.png',
    scaledSize: undefined,
    anchor: undefined,
  });
  const schoolIconRef = useRef({
    url: '/assets/school2.png',
    scaledSize: undefined,
    anchor: undefined,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const findClosestPointOnRoute = useCallback((busPosition) => {
    if (routePathRef.current.length === 0) return 0;

    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < routePathRef.current.length; i++) {
      const point = routePathRef.current[i];
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(busPosition.lat, busPosition.lng),
        point
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }, []);

  const calculateETA = useCallback((closestIndex) => {
    if (!routeData || routeSegments.length === 0) return;

    const sortedPoints = isMorningShift ? routeData.routePoints : [...routeData.routePoints].reverse();
    const stopPathIndices = stopPathIndicesRef.current;

    let lastPassedIndex = -1;
    for (let i = 0; i < stopPathIndices.length; i++) {
      if (closestIndex >= stopPathIndices[i]) {
        lastPassedIndex = i;
      } else {
        break;
      }
    }

    const nextStopIndex = Math.min(lastPassedIndex + 1, sortedPoints.length - 1);
    setCurrentStopIndex(nextStopIndex);
    setBusInfo({ nextStop: sortedPoints[nextStopIndex].routePointName });

    const nextStopPathIndex = stopPathIndices[nextStopIndex];
    let etaString = '';

    if (closestIndex >= nextStopPathIndex) {
      etaString = `Arrived at ${nextStopIndex === sortedPoints.length - 1 ? 'destination' : 'stop'}`;
    } else {
      const remainingPath = routePathRef.current.slice(closestIndex, nextStopPathIndex + 1);
      const distance = window.google.maps.geometry.spherical.computeLength(remainingPath);
      const speed = 11; // m/s ~40km/h
      const timeInSeconds = distance / speed;

      if (timeInSeconds < 30) {
        etaString = 'Arriving soon';
      } else if (timeInSeconds < 60) {
        etaString = `Arriving in ${Math.round(timeInSeconds)} seconds`;
      } else {
        const minutes = Math.round(timeInSeconds / 60);
        etaString = `Arriving in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    }

    setEtaToNextStop(etaString);
  }, [routeData, routeSegments, isMorningShift]);

  const splitRoute = useCallback((busPosition) => {
    const closestIndex = findClosestPointOnRoute(busPosition);

    const completed = routePathRef.current.slice(0, closestIndex + 1);
    const upcoming = routePathRef.current.slice(closestIndex);

    setCompletedRoutePath(completed);
    setUpcomingRoutePath(upcoming);

    const progress = routePathRef.current.length > 1
      ? (closestIndex / (routePathRef.current.length - 1)) * 100
      : 0;
    setProgressPercentage(Math.min(100, Math.max(0, Math.round(progress))));

    calculateETA(closestIndex);
  }, [findClosestPointOnRoute, calculateETA]);

  const animateBusMovement = useCallback((start, end) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
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
      };

      setCurrentPosition(newPosition);
      splitRoute(newPosition);

      if (isFollowingBus && mapRef.current) {
        setMapCenter({ lat, lng });
        mapRef.current.panTo({ lat, lng });
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        lastPositionRef.current = end;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isFollowingBus, splitRoute]);

  const generateRoadRoute = useCallback((points) => {
    if (points.length < 2 || !directionsServiceRef.current) return;

    const sortedPoints = isMorningShift ? points : [...points].reverse();
    const waypoints = sortedPoints
      .slice(1, -1)
      .map((point) => ({
        location: new window.google.maps.LatLng(Number(point.latitude), Number(point.longitude)),
        stopover: true,
      }));

    directionsServiceRef.current.route(
      {
        origin: new window.google.maps.LatLng(Number(sortedPoints[0].latitude), Number(sortedPoints[0].longitude)),
        destination: new window.google.maps.LatLng(
          Number(sortedPoints[sortedPoints.length - 1].latitude),
          Number(sortedPoints[sortedPoints.length - 1].longitude)
        ),
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          const fullPath = [];
          const segments = [];

          result.routes[0].legs.forEach((leg) => {
            if (leg.steps) {
              const segmentPath = [];
              leg.steps.forEach((step) => {
                step.path.forEach((point) => {
                  fullPath.push(point);
                  segmentPath.push(point);
                });
              });
              segments.push(segmentPath);
            }
          });

          routePathRef.current = fullPath;
          setRouteSegments(segments);

          stopPathIndicesRef.current = sortedPoints.map((point) => {
            const pos = {
              lat: Number(point.latitude),
              lng: Number(point.longitude),
              timestamp: 0,
            };
            return findClosestPointOnRoute(pos);
          });

          setCompletedRoutePath([]);
          setUpcomingRoutePath(fullPath);
          setCurrentStopIndex(0);
          setProgressPercentage(0);
        } else {
          console.error('Directions request failed:', status);
          toast({
            title: "Directions API Error",
            description: `Failed to fetch road routes: ${status}. Please check your API key and enable Directions API.`,
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    );
  }, [isMorningShift, findClosestPointOnRoute]);

  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const hours = currentTime.getHours();
    setIsMorningShift(hours < 12);
  }, [currentTime]);

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      busIconRef.current = {
        url: '/assets/bus.png',
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24),
      };

      mapPinIconRef.current = {
        url: '/assets/map.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };

      boardingPointIconRef.current = {
        url: '/assets/boarding.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };

      schoolIconRef.current = {
        url: '/assets/school2.png',
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };

      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (loadError) {
      setError(`Google Maps API Load Error: ${loadError.message}`);
      return;
    }

    if (!routeId) {
      setError('Route ID is missing');
      toast({
        title: 'Error',
        description: 'Route ID is missing. Please select a student again.',
        variant: 'destructive',
        duration: 5000,
      });
      navigate('/dashboard/parent');
      return;
    }

    const fetchRouteData = async () => {
      const token = localStorage.getItem('parenttoken');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'No token found. Please log in again.',
          variant: 'destructive',
          duration: 5000,
        });
        navigate('/login/parent');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/route/${routeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Client-Type': 'web',
          },
        });

        const data = response.data;
        const validPoints = data.routePoints.filter((point) => {
          const lat = Number(point.latitude);
          const lng = Number(point.longitude);
          const isValid =
            typeof point.latitude !== 'undefined' &&
            typeof point.longitude !== 'undefined' &&
            !isNaN(lat) &&
            !isNaN(lng);
          return isValid;
        });

        if (validPoints.length === 0) {
          throw new Error('No valid coordinates found in route points');
        }

        setRouteData({ ...data, routePoints: validPoints });
        setMapCenter({
          lat: Number(validPoints[isMorningShift ? 0 : validPoints.length - 1].latitude),
          lng: Number(validPoints[isMorningShift ? 0 : validPoints.length - 1].longitude),
        });

        generateRoadRoute(validPoints);
      } catch (err) {
        console.error('Error fetching route data:', err);
        setError('Failed to load route data. Please check the route points or try again.');
        toast({
          title: 'Error',
          description: 'Failed to load route data. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    };

    fetchRouteData();
  }, [routeId, navigate, loadError, isMorningShift, generateRoadRoute]);

  useEffect(() => {
    if (!currentPosition) {
      setBusStatusMessage(isMorningShift ? 'Bus not started for morning shift' : 'Bus not started for evening shift');
    } else {
      setBusStatusMessage('');
    }
  }, [currentPosition, isMorningShift]);

  useEffect(() => {
    if (routeData && routeData.schId && routeData.smRouteId) {
      const token = localStorage.getItem('parenttoken');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'No token found. Please log in again.',
          variant: 'destructive',
          duration: 5000,
        });
        navigate('/login/parent');
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

        client.subscribe(`/topic/gps/${routeData.schId}/${routeData.smRouteId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data.type === 'gps_location' && data.latitude && data.longitude) {
              const newPosition = {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
                heading: data.heading || undefined,
                timestamp: Date.now(),
              };

              if (lastPositionRef.current) {
                animateBusMovement(lastPositionRef.current, newPosition);
              } else {
                setCurrentPosition(newPosition);
                splitRoute(newPosition);
                lastPositionRef.current = newPosition;

                if (isFollowingBus && mapRef.current) {
                  setMapCenter({ lat: newPosition.lat, lng: newPosition.lng });
                  mapRef.current.panTo({ lat: newPosition.lat, lng: newPosition.lng });
                }
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        });

        console.log(`Subscribed to /topic/gps/${routeData.schId}/${routeData.smRouteId}`);
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
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        if (stompClientRef.current) {
          stompClientRef.current.deactivate().then(() => {
            console.log('Disconnected cleanly.');
          });
        }
      };
    }
  }, [routeData, isFollowingBus, animateBusMovement, splitRoute, navigate]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const toggleFollowBus = () => {
    setIsFollowingBus(!isFollowingBus);
  };

  const centerMapOnBus = () => {
    if (currentPosition && mapRef.current) {
      setMapCenter({ lat: currentPosition.lat, lng: currentPosition.lng });
      mapRef.current.panTo({ lat: currentPosition.lat, lng: currentPosition.lng });
      setIsFollowingBus(true);
    }
  };

  const fitRouteToView = () => {
    if (mapRef.current && routePathRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      routePathRef.current.forEach((point) => bounds.extend(point));
      mapRef.current.fitBounds(bounds);
      setIsFollowingBus(false);
    }
  };

  if (!isLoaded) return <div className="p-4 text-white bg-gray-900">Loading Map...</div>;
  if (loadError) return <div className="p-4 text-red-500 bg-gray-900">Error loading maps: {loadError.message}</div>;
  if (error) return <div className="p-4 text-red-500 bg-gray-900">{error}</div>;
  if (!routeData || routeData.routePoints.length === 0) {
    return <div className="p-4 text-white bg-gray-900">No valid route data found</div>;
  }

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const totalStops = routeData.routePoints.length;
  const displayPoints = isMorningShift
    ? [...routeData.routePoints]
    : routeData.routePoints.map((point) => ({
        ...point,
        seqOrder: totalStops - point.seqOrder + 1,
      })).reverse();

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-yellow-500 flex justify-between items-center shadow-xl flex-wrap md:flex-nowrap">
        <div className="flex items-center mb-2 md:mb-0">
          <Button
            onClick={() => navigate(-1)}
            className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold rounded-full px-6 py-2 transition-all duration-300 shadow-md"
          >
            ← Back
          </Button>
          <div className="ml-4">
            <h1 className="text-white text-2xl font-extrabold tracking-tight">{routeData.routeName} Route - {studentName}</h1>
            <p className="text-gray-300 text-sm font-medium">{routeData.title}</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap md:flex-nowrap">
          <Button
            onClick={fitRouteToView}
            className="bg-gray-700 text-white hover:bg-gray-600 font-medium rounded-full px-6 py-2 transition-all duration-300 shadow-md"
          >
            Show Full Route
          </Button>

          <Button
            onClick={centerMapOnBus}
            className="bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-full px-6 py-2 transition-all duration-300 shadow-md"
            disabled={!currentPosition}
          >
            Center on Bus
          </Button>

          <Button
            onClick={toggleFollowBus}
            className={`${
              isFollowingBus ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-500'
            } text-white font-medium rounded-full px-6 py-2 transition-all duration-300 shadow-md`}
          >
            {isFollowingBus ? 'Following Bus ✓' : 'Follow Bus'}
          </Button>
        </div>
      </div>

      <div className="absolute top-20 left-4 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl z-10 max-w-sm border border-gray-700/50 backdrop-blur-md bg-opacity-95 overflow-auto md:max-w-md lg:max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-md"></div>
        <div className="relative">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h2 className="font-extrabold text-2xl text-white tracking-tight">{routeData.routeName}</h2>
              <p className="text-sm text-gray-300 font-medium">{formattedDate} • {formattedTime}</p>
            </div>
            <div
              className={`${
                isMorningShift ? 'bg-yellow-500/20 text-yellow-300' : 'bg-purple-500/20 text-purple-300'
              } px-3 py-1 rounded-full text-xs font-semibold border border-current shadow-sm animate-pulse`}
            >
              {isMorningShift ? 'Morning Shift' : 'Evening Shift'}
            </div>
          </div>

          {busStatusMessage && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm font-medium text-center">{busStatusMessage}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span className="font-medium">Route Progress</span>
              <span className="font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg animate-pulse"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-3 custom-scrollbar">
            {displayPoints.map((point, index) => {
              const isStart = isMorningShift ? index === 0 : index === 0;
              const isEnd = isMorningShift ? index === displayPoints.length - 1 : index === displayPoints.length - 1;
              const isBoardingPoint = point.id === 226;
              const isCompleted = index < currentStopIndex;
              const isCurrent = index === currentStopIndex;

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
                        <span className="text-sm text-white font-bold">{point.seqOrder}</span>
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
                            {isMorningShift ? 'Boarding' : 'Destination'}
                          </span>
                        )}
                      </p>
                      {isCurrent && currentPosition && (
                        <p className="text-xs text-blue-300 mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M5 9a7 7 0 1110 0A7 7 0 015 9zm7-5a5 5 0 00-5 5c5 0 5 5 5 5s5-2.24 5-5a5 5 0 00-5-5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {etaToNextStop || 'Approaching...'}
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
                </div>
              );
            })}
          </div>

          {currentPosition && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <div className="flex items-center">
                <div className="bg-blue-500/20 p-2 rounded-full border border-blue-400/30 shadow-md">
                  <img src="/assets/bus.png" alt="Bus" width={24} height={24} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Bus Status</p>
                  <p className="text-xs text-gray-300">Next: {busInfo.nextStop || 'Calculating...'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {currentPosition && (
        <div className="absolute top-20 right-4 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl z-10 max-w-xs border border-gray-700/50 backdrop-blur-md bg-opacity-95 md:max-w-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-md"></div>
          <div className="relative">
            <h3 className="font-extrabold text-lg text-white mb-4 tracking-tight">Bus Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm text-gray-300 font-medium">Next Stop:</div>
              <div className="text-sm font-semibold text-white">{busInfo.nextStop || 'Calculating...'}</div>

              <div className="text-sm text-gray-300 font-medium">ETA:</div>
              <div className="text-sm font-semibold text-white">{etaToNextStop || 'Calculating...'}</div>
            </div>
          </div>
        </div>
      )}

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={15}
          options={mapOptions}
          onLoad={handleMapLoad}
          onDrag={() => setIsFollowingBus(false)}
        >
          {completedRoutePath.length > 0 && (
            <Polyline
              path={completedRoutePath}
              options={{
                strokeColor: '#3B82F6',
                strokeOpacity: 0.4,
                strokeWeight: 6,
                zIndex: 1,
              }}
            />
          )}

          {upcomingRoutePath.length > 0 && (
            <Polyline
              path={upcomingRoutePath}
              options={{
                strokeColor: '#3B82F6',
                strokeOpacity: 0.9,
                strokeWeight: 6,
                zIndex: 2,
              }}
            />
          )}

          {displayPoints.map((point, index) => {
            const isBoardingPoint = point.id === 226;
            const isSchool = index === (isMorningShift ? displayPoints.length - 1 : 0);

            return (
              <Marker
                key={point.id}
                position={{ lat: Number(point.latitude), lng: Number(point.longitude) }}
                icon={isBoardingPoint ? boardingPointIconRef.current : isSchool ? schoolIconRef.current : mapPinIconRef.current}
                label={{
                  text: point.seqOrder.toString(),
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  className:
                    'absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md',
                }}
                zIndex={isBoardingPoint || isSchool ? 7 : 6}
              />
            );
          })}

          {currentPosition && busIconRef.current && (
            <Marker
              position={currentPosition}
              icon={{
                ...busIconRef.current,
                rotation: currentPosition.heading || 0,
              }}
              zIndex={8}
            />
          )}
        </GoogleMap>
      )}

      <style>{`
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

export default StudentMap;