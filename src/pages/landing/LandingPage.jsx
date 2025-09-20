import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { 
  Bus, 
  MapPin, 
  Shield, 
  Smartphone, 
  Users, 
  Clock, 
  Star, 
  ArrowRight, 
  Phone, 
  Mail, 
  MapPin as LocationIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import ThemeToggle from '../../components/ThemeToggle';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef();

  // Animation refs
  const heroRef = useRef();
  const featuresRef = useRef();
  const servicesRef = useRef();
  const appsRef = useRef();
  const aboutRef = useRef();
  const contactRef = useRef();
  const footerRef = useRef();

  // Text animation ref
  const typingTextRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.timeline()
        .from('.hero-title', { 
          duration: 1.2, 
          y: 100, 
          opacity: 0, 
          ease: 'power3.out',
          stagger: 0.2 
        })
        .from('.hero-subtitle', { 
          duration: 1, 
          y: 50, 
          opacity: 0, 
          ease: 'power2.out' 
        }, '-=0.8')
        .from('.hero-buttons', { 
          duration: 1, 
          y: 30, 
          opacity: 0, 
          ease: 'back.out(1.7)' 
        }, '-=0.6')
        .from('.hero-image', { 
          duration: 1.5, 
          scale: 0.8, 
          opacity: 0, 
          ease: 'elastic.out(1, 0.5)' 
        }, '-=1');

      // Typing animation for hero subtitle
      gsap.to(typingTextRef.current, {
        duration: 3,
        text: "Smart. Safe. Reliable School Transportation",
        ease: "none",
        delay: 1.5
      });

      // Scroll-triggered animations
      gsap.utils.toArray('.animate-on-scroll').forEach((element, index) => {
        gsap.fromTo(element, 
          {
            y: 100,
            opacity: 0,
            scale: 0.8
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Features cards flip animation
      gsap.utils.toArray('.feature-card').forEach((card, index) => {
        gsap.set(card, { transformStyle: 'preserve-3d' });
        
        ScrollTrigger.create({
          trigger: card,
          start: 'top 70%',
          onEnter: () => {
            gsap.fromTo(card,
              { rotateY: -90, opacity: 0 },
              { 
                rotateY: 0, 
                opacity: 1, 
                duration: 0.8, 
                ease: 'back.out(1.7)',
                delay: index * 0.1
              }
            );
          }
        });
      });

      // Parallax background animation
      gsap.to('.parallax-bg', {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.parallax-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // Circular gallery rotation
      gsap.to('.circle-gallery', {
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1
      });

      // Services cards hover animations
      gsap.utils.toArray('.service-card').forEach(card => {
        const icon = card.querySelector('.service-icon');
        const content = card.querySelector('.service-content');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(icon, { scale: 1.2, rotation: 10, duration: 0.3 });
          gsap.to(content, { y: -5, duration: 0.3 });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
          gsap.to(content, { y: 0, duration: 0.3 });
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    navigate('/get-started');
  };

  const handleLoginRedirect = (userType) => {
    navigate(`/login/${userType}`);
  };

  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-sky-50 via-white to-sky-100 overflow-x-hidden">
      
      {/* Animated Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 dark:bg-slate-800/95 bg-white/95 backdrop-blur-sm border-b dark:border-slate-600 border-sky-200/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-1.5 dark:bg-yellow-500/20 bg-sky-600/90 rounded-lg border dark:border-yellow-500/30 border-sky-700/50 shadow-sm">
                <Bus className="w-5 h-5 dark:text-yellow-500 text-white" />
              </div>
              <h1 className="text-lg font-bold">
                <span className="dark:text-yellow-500 text-sky-600">School Bus</span>
                <span className="dark:text-white text-gray-800 ml-1">Tracker</span>
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection(featuresRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection(servicesRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors font-medium">
                Services
              </button>
              <button onClick={() => scrollToSection(appsRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors font-medium">
                Apps
              </button>
              <button onClick={() => scrollToSection(contactRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors font-medium">
                Contact
              </button>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-yellow-400/5 bg-sky-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-gray-600/5 bg-sky-300/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 dark:bg-yellow-500/5 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="hero-title text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent">
                  Smart
                </span>
              </h1>
              <h2 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r dark:from-gray-200 dark:via-gray-300 dark:to-gray-400 from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  School Bus
                </span>
              </h2>
              <h3 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-300 from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent">
                  Management
                </span>
              </h3>
            </div>
            
            <div className="hero-subtitle">
              <p ref={typingTextRef} className="text-xl sm:text-2xl dark:text-gray-300 text-gray-600 font-medium min-h-[60px]">
                {/* Text will be animated here */}
              </p>
            </div>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => scrollToSection(featuresRef)}
                variant="outline"
                className="dark:border-yellow-400/50 dark:text-yellow-400 dark:hover:bg-yellow-400/10 border-sky-500/50 text-sky-600 hover:bg-sky-50 text-lg px-8 py-6 rounded-xl"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="hero-image flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute inset-0 dark:bg-yellow-400/10 bg-sky-400/10 rounded-3xl blur-md group-hover:blur-lg transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-3xl shadow-2xl dark:shadow-yellow-500/10 shadow-sky-500/20 border-2 dark:border-yellow-400/30 border-sky-400/30 group-hover:scale-105 transition-all duration-500">
                <img 
                  src="https://images.pexels.com/photos/5896948/pexels-photo-5896948.jpeg" 
                  alt="Safe school transportation" 
                  className="w-full max-w-md h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
              Powerful <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
              Advanced technology meets safety and convenience for modern school transportation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Real-Time Tracking",
                description: "Live GPS tracking of school buses with precise location updates every few seconds"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enhanced Safety",
                description: "Complete safety monitoring with student boarding/exit verification and alerts"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile App",
                description: "Easy-to-use mobile applications for parents, drivers, and administrators"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Multi-Role Access",
                description: "Different access levels for parents, school admins, and system administrators"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Route Optimization",
                description: "Intelligent route planning and optimization for efficient transportation"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Analytics & Reports",
                description: "Comprehensive analytics and detailed reports for better decision making"
              }
            ].map((feature, index) => (
              <Card key={index} className="feature-card p-6 dark:bg-gray-800/80 bg-white/80 backdrop-blur-sm border-2 dark:border-gray-700/50 border-sky-200/50 hover:shadow-2xl transition-all duration-300 group">
                <div className="dark:text-yellow-400 text-sky-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold dark:text-white text-gray-800 mb-3">{feature.title}</h3>
                <p className="dark:text-gray-300 text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 px-4 parallax-section relative overflow-hidden">
        <div className="parallax-bg absolute inset-0 dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 from-sky-100/50 to-white/50"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 animate-on-scroll">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
              Our <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions for all your school transportation needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Parents",
                description: "Track your child's bus in real-time, receive notifications, and ensure their safety",
                features: ["Real-time tracking", "Push notifications", "Safety alerts", "Trip history"],
                icon: <Users className="w-10 h-10" />,
                color: "from-green-500 to-green-600",
                action: () => handleLoginRedirect('parent')
              },
              {
                title: "For School Admins",
                description: "Manage routes, drivers, students, and monitor entire transportation operations",
                features: ["Route management", "Driver assignments", "Student tracking", "Analytics dashboard"],
                icon: <Shield className="w-10 h-10" />,
                color: "from-blue-500 to-blue-600",
                action: () => handleLoginRedirect('admin')
              },
              {
                title: "For Super Admins",
                description: "System-wide control, user management, and comprehensive oversight capabilities",
                features: ["System administration", "User management", "Global analytics", "Security controls"],
                icon: <Bus className="w-10 h-10" />,
                color: "from-purple-500 to-purple-600",
                action: () => handleLoginRedirect('superadmin')
              }
            ].map((service, index) => (
              <Card key={index} className="service-card p-8 dark:bg-gray-800/90 bg-white/90 backdrop-blur-sm border-2 dark:border-gray-700/50 border-sky-200/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={service.action}>
                <div className="service-content">
                  <div className={`service-icon inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-6 group-hover:shadow-lg transition-all duration-300`}>
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-4">{service.title}</h3>
                  <p className="dark:text-gray-300 text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center dark:text-gray-300 text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full bg-gradient-to-r ${service.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}>
                    Access Portal <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Showcase Section with Circle Gallery */}
      <section ref={appsRef} className="py-20 px-4 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
              Our <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Apps</span>
            </h2>
            <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
              Discover our comprehensive suite of applications designed for modern school transportation
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Circle Gallery */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-96 h-96">
                <div className="circle-gallery absolute inset-0">
                  {[
                    {
                      image: "https://images.unsplash.com/photo-1601972602237-8c79241e468b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHB8ZW58MHx8fHwxNzU4MzYwNjM5fDA&ixlib=rb-4.1.0&q=85",
                      title: "Parent App"
                    },
                    {
                      image: "https://images.unsplash.com/photo-1634807010323-4309f645e5a4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBpbnRlcmZhY2V8ZW58MHx8fHwxNzU4MzIwNjYwfDA&ixlib=rb-4.1.0&q=85",
                      title: "Admin Dashboard"
                    },
                    {
                      image: "https://images.pexels.com/photos/14277582/pexels-photo-14277582.jpeg",
                      title: "Driver Interface"
                    },
                    {
                      image: "https://images.pexels.com/photos/5896517/pexels-photo-5896517.jpeg",
                      title: "Safety Monitor"
                    },
                    {
                      image: "https://images.unsplash.com/photo-1685645647479-a0232f3fec6d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxzY2hvb2wlMjBidXMlMjB0cmFja2luZ3xlbnwwfHx8fDE3NTgzNjA2MzB8MA&ixlib=rb-4.1.0&q=85",
                      title: "Live Tracking"
                    }
                  ].map((app, index) => {
                    const angle = (index * 72) * (Math.PI / 180);
                    const radius = 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <div
                        key={index}
                        className="absolute w-20 h-20 rounded-full overflow-hidden shadow-2xl border-4 dark:border-yellow-400/50 border-sky-400/50 hover:scale-110 transition-all duration-300 cursor-pointer group"
                        style={{
                          transform: `translate(${x + 140}px, ${y + 140}px)`,
                        }}
                      >
                        <img 
                          src={app.image} 
                          alt={app.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white text-xs font-bold text-center">{app.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Center logo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 flex items-center justify-center shadow-2xl">
                  <Bus className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* App Features */}
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold dark:text-white text-gray-800">
                  Complete Solution Suite
                </h3>
                <p className="text-lg dark:text-gray-300 text-gray-600">
                  Our integrated platform provides specialized applications for every user type in your school transportation ecosystem.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  { icon: <Smartphone className="w-6 h-6" />, title: "Mobile-First Design", desc: "Optimized for smartphones and tablets" },
                  { icon: <MapPin className="w-6 h-6" />, title: "Real-Time GPS", desc: "Live location tracking with high precision" },
                  { icon: <Shield className="w-6 h-6" />, title: "Safety Features", desc: "Comprehensive safety monitoring and alerts" },
                  { icon: <Users className="w-6 h-6" />, title: "Multi-User Support", desc: "Different interfaces for different roles" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg dark:bg-gray-800/50 bg-white/50 backdrop-blur-sm">
                    <div className="p-2 rounded-lg bg-gradient-to-br dark:from-yellow-400/20 dark:to-yellow-500/20 from-sky-400/20 to-sky-500/20 dark:text-yellow-400 text-sky-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold dark:text-white text-gray-800">{feature.title}</h4>
                      <p className="text-sm dark:text-gray-300 text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 px-4 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
                  How It <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Works</span>
                </h2>
                <p className="text-xl dark:text-gray-300 text-gray-600">
                  Our comprehensive school bus tracking system ensures safety, efficiency, and peace of mind for everyone involved.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Real-Time Tracking",
                    description: "GPS-enabled buses provide live location updates to parents and administrators"
                  },
                  {
                    step: "02", 
                    title: "Student Management",
                    description: "Complete student profiles with route assignments and boarding point information"
                  },
                  {
                    step: "03",
                    title: "Safety Monitoring", 
                    description: "Automated alerts for boarding/exit verification and route deviations"
                  },
                  {
                    step: "04",
                    title: "Analytics & Reports",
                    description: "Comprehensive reporting for operational efficiency and compliance"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold dark:text-white text-gray-800 mb-2">{item.title}</h3>
                      <p className="dark:text-gray-300 text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 dark:bg-yellow-400/10 bg-sky-400/10 rounded-3xl blur-lg"></div>
                <img 
                  src="https://images.pexels.com/photos/5896517/pexels-photo-5896517.jpeg"
                  alt="School bus tracking system in action"
                  className="relative rounded-3xl shadow-2xl max-w-md w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20 px-4 animate-on-scroll">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
              Get In <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
              Ready to revolutionize your school transportation? Contact us today to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                {[
                  {
                    icon: <Phone className="w-6 h-6" />,
                    title: "Phone",
                    details: ["+1 (555) 123-4567", "+1 (555) 987-6543"]
                  },
                  {
                    icon: <Mail className="w-6 h-6" />,
                    title: "Email", 
                    details: ["info@schoolbustracker.com", "support@schoolbustracker.com"]
                  },
                  {
                    icon: <LocationIcon className="w-6 h-6" />,
                    title: "Address",
                    details: ["123 Education Street", "Learning City, LC 12345"]
                  }
                ].map((contact, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br dark:from-yellow-400/20 dark:to-yellow-500/20 from-sky-400/20 to-sky-500/20 dark:text-yellow-400 text-sky-600">
                      {contact.icon}
                    </div>
                    <div>
                      <h3 className="font-bold dark:text-white text-gray-800 mb-2">{contact.title}</h3>
                      {contact.details.map((detail, idx) => (
                        <p key={idx} className="dark:text-gray-300 text-gray-600">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl"
                >
                  Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            <Card className="p-8 dark:bg-gray-800/80 bg-white/80 backdrop-blur-sm border-2 dark:border-gray-700/50 border-sky-200/50 shadow-2xl">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">School/Organization</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="ABC Elementary School"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows="4" 
                    className="w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>
                <Button className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 py-6">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="py-16 px-4 dark:bg-gray-900/50 bg-gray-50 border-t dark:border-gray-800 border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 dark:bg-yellow-500/20 bg-sky-600/90 rounded-lg border dark:border-yellow-500/30 border-sky-700/50">
                  <Bus className="w-5 h-5 dark:text-yellow-500 text-white" />
                </div>
                <h3 className="text-lg font-bold">
                  <span className="dark:text-yellow-500 text-sky-600">School Bus</span>
                  <span className="dark:text-white text-gray-800 ml-1">Tracker</span>
                </h3>
              </div>
              <p className="dark:text-gray-400 text-gray-600">
                Leading the future of safe and efficient school transportation management.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Facebook className="w-5 h-5" />, href: "#" },
                  { icon: <Twitter className="w-5 h-5" />, href: "#" },
                  { icon: <Instagram className="w-5 h-5" />, href: "#" },
                  { icon: <Linkedin className="w-5 h-5" />, href: "#" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    className="p-2 rounded-lg dark:bg-gray-800 bg-white dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold dark:text-white text-gray-800 mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Use Cases", "Integrations"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold dark:text-white text-gray-800 mb-4">Solutions</h4>
              <ul className="space-y-2">
                {["For Parents", "For Schools", "For Administrators", "Enterprise"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold dark:text-white text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2">
                {["Documentation", "Help Center", "Contact Us", "System Status"].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors duration-200">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t dark:border-gray-800 border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="dark:text-gray-400 text-gray-600 text-sm">
              © 2024 School Bus Tracker. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors duration-200 text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;