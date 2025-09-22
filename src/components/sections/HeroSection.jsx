import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Variable Proximity Component with improved scaling and overflow handling
const VariableProximity = ({ 
  label, 
  className, 
  fromFontVariationSettings = "'wght' 400", 
  toFontVariationSettings = "'wght' 900", 
  containerRef, 
  radius = 200, 
  falloff = 'linear',
  maxScale = 0.15 // Increased max scale for more dramatic effect
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current || !textRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const textRect = textRef.current.getBoundingClientRect();
      const textCenterX = textRect.left + textRect.width / 2;
      const textCenterY = textRect.top + textRect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - textCenterX, 2) + Math.pow(e.clientY - textCenterY, 2)
      );
      
      let intensity = 0;
      if (distance <= radius) {
        intensity = falloff === 'linear' 
          ? 1 - (distance / radius)
          : Math.pow(1 - (distance / radius), 2);
      }
      
      const fromWeight = parseInt(fromFontVariationSettings.match(/'wght' (\d+)/)?.[1] || '400');
      const toWeight = parseInt(toFontVariationSettings.match(/'wght' (\d+)/)?.[1] || '900');
      const currentWeight = fromWeight + (toWeight - fromWeight) * intensity;
      
      if (textRef.current) {
        textRef.current.style.fontVariationSettings = `'wght' ${Math.round(currentWeight)}`;
        textRef.current.style.transform = `scale(${1 + intensity * maxScale})`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [containerRef, radius, falloff, fromFontVariationSettings, toFontVariationSettings, maxScale]);

  return (
    <span ref={textRef} className={className} style={{ 
      fontVariationSettings: fromFontVariationSettings,
      transition: 'transform 0.2s ease-out, font-variation-settings 0.2s ease-out',
      display: 'inline-block', // Ensure block-like behavior for scaling
      willChange: 'transform' // Optimize for performance
    }}>
      {label}
    </span>
  );
};

// Enhanced Button Component with hover effects
const Button = ({ children, onClick, className, variant = "default" }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl text-lg font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-md hover:shadow-xl";
  
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-500 dark:to-yellow-600 text-white hover:from-blue-700 hover:to-indigo-700",
    outline: "border-2 border-blue-500 dark:border-yellow-400 text-blue-600 dark:text-yellow-400 bg-transparent hover:bg-blue-50 dark:hover:bg-yellow-900/20"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Updated HeroSection with larger text, better layout, and cutoff fix for "Management"
const HeroSection = () => {
  const heroRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/home');
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.style.opacity = '0';
      heroRef.current.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        heroRef.current.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        heroRef.current.style.opacity = '1';
        heroRef.current.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  return (
    <section ref={heroRef} className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-visible bg-gradient-to-br from-white via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 overflow-visible">
        <div className="space-y-12 text-center lg:text-left overflow-visible">
          <div ref={containerRef} className="space-y-6 overflow-visible">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-none tracking-tight overflow-visible">
              <VariableProximity
                label="Smart"
                className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 bg-clip-text text-transparent"
                fromFontVariationSettings="'wght' 500"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={250}
                falloff="quadratic"
                maxScale={0.2}
              />
            </h1>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight overflow-visible">
              <VariableProximity
                label="School Bus"
                className="text-gray-900 dark:text-gray-100"
                fromFontVariationSettings="'wght' 600"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={250}
                falloff="quadratic"
                maxScale={0.2}
              />
            </h2>
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight overflow-visible pb-8"> {/* Increased padding-bottom to prevent cutoff */}
              <VariableProximity
                label="Management"
                className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent"
                fromFontVariationSettings="'wght' 500"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={250}
                falloff="quadratic"
                maxScale={0.2}
              />
            </h3>
          </div>
          
          <div className="hero-subtitle">
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
              Revolutionizing school transportation with smart, safe, and reliable solutions.
            </p>
          </div>

          <div className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <Button 
              onClick={handleGetStarted}
              className="px-10 py-5 text-xl rounded-xl transition-transform duration-300 hover:scale-105"
            >
              Get Started 
              <ArrowRight className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button 
              onClick={() => scrollToSection('features')}
              variant="outline"
              className="px-10 py-5 text-xl rounded-xl transition-transform duration-300 hover:scale-105"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="hero-image flex justify-center lg:justify-end">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img 
              src="/assets/loading.png" 
              alt="Safe school transportation with happy students" 
              className="w-full max-w-2xl h-auto object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.target.src = "https://images.pexels.com/photos/5896948/pexels-photo-5896948.jpeg";
              }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-10 h-14 border-2 border-gray-500 dark:border-gray-400 rounded-full flex justify-center">
          <div className="w-2 h-5 bg-gray-500 dark:bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Full Page Component without Features Section
const FullPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <HeroSection />
    </div>
  );
};

export default FullPage;