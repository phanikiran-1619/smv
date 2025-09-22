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
  Linkedin,
  ArrowUp
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

      // Enhanced footer animation
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

      // Navbar background animation
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {className: 'navbar-scrolled', targets: '.navbar'}
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGetStarted = () => {
    navigate('/home');
  };

  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-sky-50 via-white to-sky-100 overflow-x-hidden">
      
      {/* Enhanced Animated Navbar */}
      <nav className="navbar fixed top-0 left-0 right-0 z-50 dark:bg-slate-800/80 bg-white/80 backdrop-blur-xl border-b dark:border-slate-600/50 border-sky-200/50 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
              <div className="p-1.5 dark:bg-yellow-500/20 bg-sky-600/90 rounded-lg border dark:border-yellow-500/30 border-sky-700/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-110">
                <Bus className="w-5 h-5 dark:text-yellow-500 text-white" />
              </div>
              <h1 className="text-lg font-bold">
                <span className="dark:text-yellow-500 text-sky-600">School Bus</span>
                <span className="dark:text-white text-gray-800 ml-1">Tracker</span>
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection(featuresRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105">
                Features
              </button>
              <button onClick={() => scrollToSection(servicesRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105">
                Services
              </button>
              <button onClick={() => scrollToSection(appsRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105">
                Apps
              </button>
              <button onClick={() => scrollToSection(aboutRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105">
                How It Works
              </button>
              <button onClick={() => scrollToSection(contactRef)} className="dark:text-gray-300 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 font-medium hover:scale-105">
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
        scrollToSection={scrollToSection}
        featuresRef={featuresRef}
      />

      {/* Features Section */}
      <div ref={featuresRef}>
        <FeaturesSection featuresRef={featuresRef} />
      </div>

      {/* Services Section */}
      <div ref={servicesRef}>
        <ServicesSection servicesRef={servicesRef} />
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

      {/* Enhanced Footer with Working Links */}
      <footer ref={footerRef} className="py-20 px-4 dark:bg-gray-900/60 bg-gray-50/80 border-t dark:border-gray-800/50 border-gray-200/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto footer-content">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={scrollToTop}>
                <div className="p-1.5 dark:bg-yellow-500/20 bg-sky-600/90 rounded-lg border dark:border-yellow-500/30 border-sky-700/50 group-hover:scale-110 transition-all duration-300">
                  <Bus className="w-5 h-5 dark:text-yellow-500 text-white" />
                </div>
                <h3 className="text-lg font-bold">
                  <span className="dark:text-yellow-500 text-sky-600">School Bus</span>
                  <span className="dark:text-white text-gray-800 ml-1">Tracker</span>
                </h3>
              </div>
              <p className="dark:text-gray-400 text-gray-600 leading-relaxed">
                Leading the future of safe and efficient school transportation management with innovative technology solutions.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
                  { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
                  { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
                  { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    aria-label={social.label}
                    className="p-3 rounded-xl dark:bg-gray-800/50 bg-white/70 dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 transform hover:scale-110 hover:shadow-lg backdrop-blur-sm"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold dark:text-white text-gray-800 mb-6 text-lg">Product</h4>
              <ul className="space-y-3">
                {[
                  { name: "Features", action: () => scrollToSection(featuresRef) },
                  { name: "Services", action: () => scrollToSection(servicesRef) },
                  { name: "Apps", action: () => scrollToSection(appsRef) },
                  { name: "How It Works", action: () => scrollToSection(aboutRef) }
                ].map((item, index) => (
                  <li key={index}>
                    <button 
                      onClick={item.action}
                      className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 text-left hover:translate-x-2"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold dark:text-white text-gray-800 mb-6 text-lg">Solutions</h4>
              <ul className="space-y-3">
                {[
                  { name: "For Parents", action: () => scrollToSection(servicesRef) },
                  { name: "For Schools", action: () => scrollToSection(servicesRef) },
                  { name: "For Administrators", action: () => scrollToSection(servicesRef) },
                  { name: "Enterprise", action: () => scrollToSection(contactRef) }
                ].map((item, index) => (
                  <li key={index}>
                    <button 
                      onClick={item.action}
                      className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 text-left hover:translate-x-2"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold dark:text-white text-gray-800 mb-6 text-lg">Support</h4>
              <ul className="space-y-3">
                {[
                  { name: "Documentation", action: () => scrollToSection(aboutRef) },
                  { name: "Help Center", action: () => scrollToSection(contactRef) },
                  { name: "Contact Us", action: () => scrollToSection(contactRef) },
                  { name: "Get Started", action: handleGetStarted }
                ].map((item, index) => (
                  <li key={index}>
                    <button 
                      onClick={item.action}
                      className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 text-left hover:translate-x-2"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t dark:border-gray-800/50 border-gray-200/50 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="dark:text-gray-400 text-gray-600 text-sm">
              © 2025 School Bus Tracker. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {[
                { name: "Privacy Policy", action: () => scrollToSection(contactRef) },
                { name: "Terms of Service", action: () => scrollToSection(contactRef) },
                { name: "Cookie Policy", action: () => scrollToSection(contactRef) }
              ].map((item, index) => (
                <button 
                  key={index}
                  onClick={item.action}
                  className="dark:text-gray-400 text-gray-600 hover:text-sky-600 dark:hover:text-yellow-400 transition-all duration-300 text-sm hover:underline"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 text-white rounded-full shadow-2xl hover:shadow-yellow-500/25 dark:hover:shadow-yellow-500/25 hover:shadow-sky-500/25 transition-all duration-300 hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default LandingPage;