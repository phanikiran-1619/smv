import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { 
  Bus, 
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import ThemeToggle from '../../components/ThemeToggle';

// Import section components
import HeroSection from '../../components/sections/HeroSection';
import FeaturesSection from '../../components/sections/FeaturesSection';
import ServicesSection from '../../components/sections/ServicesSection';
import AppsSection from '../../components/sections/AppsSection';
import HowItWorksSection from '../../components/sections/HowItWorksSection';
import ContactSection from '../../components/sections/ContactSection';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef();

  // Section refs
  const featuresRef = useRef();
  const servicesRef = useRef();
  const appsRef = useRef();
  const aboutRef = useRef();
  const contactRef = useRef();
  const footerRef = useRef();

  useEffect(() => {
    // Smooth scrolling setup
    const ctx = gsap.context(() => {
      // Add smooth scrolling behavior
      gsap.config({
        force3D: true,
        nullTargetWarn: false,
      });

      // Footer animation
      gsap.fromTo('.footer-content',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-content',
            start: 'top 90%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

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
    sectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
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
              <button onClick={() => scrollToSection(aboutRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors font-medium">
                How It Works
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
      <HeroSection 
        handleGetStarted={handleGetStarted}
        scrollToSection={scrollToSection}
        featuresRef={featuresRef}
      />

      {/* Features Section */}
      <div ref={featuresRef}>
        <FeaturesSection featuresRef={featuresRef} />
      </div>

      {/* Services Section */}
      <div ref={servicesRef}>
        <ServicesSection 
          servicesRef={servicesRef} 
          handleLoginRedirect={handleLoginRedirect}
        />
      </div>

      {/* Apps Showcase Section */}
      <div ref={appsRef}>
        <AppsSection appsRef={appsRef} />
      </div>

      {/* How It Works Section */}
      <div ref={aboutRef}>
        <HowItWorksSection aboutRef={aboutRef} />
      </div>

      {/* Contact Section */}
      <div ref={contactRef}>
        <ContactSection 
          contactRef={contactRef}
          handleGetStarted={handleGetStarted}
        />
      </div>

      {/* Footer */}
      <footer ref={footerRef} className="py-16 px-4 dark:bg-gray-900/50 bg-gray-50 border-t dark:border-gray-800 border-gray-200">
        <div className="max-w-7xl mx-auto footer-content">
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
                    className="p-2 rounded-lg dark:bg-gray-800 bg-white dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-colors duration-200 transform hover:scale-110"
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