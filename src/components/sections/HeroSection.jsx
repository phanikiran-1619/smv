import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

// Register GSAP plugins
gsap.registerPlugin(TextPlugin);

const HeroSection = ({ handleGetStarted, scrollToSection, featuresRef }) => {
  const heroRef = useRef();
  const typingTextRef = useRef();
  const proximityRef = useRef();
  const cursorRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
      console.error('GSAP is not available');
      return;
    }

    console.log('GSAP loaded successfully');

    const ctx = gsap.context(() => {
      // Set initial visibility to ensure content shows
      gsap.set('.hero-subtitle, .hero-buttons, .hero-image', { opacity: 1 });

      // Hero animations with fallback
      const tl = gsap.timeline({ defaults: { duration: 1, ease: 'power2.out' } });
      
      tl.from('.hero-title', { 
          duration: 1.2, 
          y: 50, 
          opacity: 0,
          stagger: 0.1 
        })
        .from('.hero-subtitle', { 
          duration: 1, 
          y: 30, 
          opacity: 0
        }, '-=0.8')
        .from('.hero-buttons', { 
          duration: 1, 
          y: 20, 
          opacity: 0
        }, '-=0.6')
        .from('.hero-image', { 
          duration: 1.5, 
          scale: 0.9, 
          opacity: 0
        }, '-=1');

      // Typing animation for hero subtitle (with fallback)
      if (typingTextRef.current) {
        try {
          gsap.to(typingTextRef.current, {
            duration: 3,
            text: "Smart. Safe. Reliable School Transportation",
            ease: "none",
            delay: 1.5
          });
        } catch (error) {
          console.warn('TextPlugin not available, setting text directly');
          typingTextRef.current.textContent = "Smart. Safe. Reliable School Transportation";
        }
      }

      // Variable Proximity Effect (simplified)
      const handleMouseMove = (e) => {
        if (!proximityRef.current) return;
        
        try {
          const rect = proximityRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = (e.clientX - centerX) / 100;
          const deltaY = (e.clientY - centerY) / 100;
          
          gsap.to('.proximity-text', {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: 'power2.out'
          });

          gsap.to('.proximity-word', {
            scale: 1 + Math.abs(deltaX + deltaY) / 200,
            duration: 0.3,
            ease: 'power2.out',
            stagger: 0.01
          });
        } catch (error) {
          console.warn('Proximity effect error:', error);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 dark:bg-yellow-400/5 bg-sky-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 dark:bg-gray-600/5 bg-sky-300/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 dark:bg-yellow-500/5 bg-sky-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8 text-center lg:text-left">
          <div ref={proximityRef} className="space-y-4">
            <h1 className="hero-title text-6xl sm:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="proximity-text bg-gradient-to-r dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 from-sky-500 via-sky-600 to-sky-700 bg-clip-text text-transparent inline-block">
                <span className="proximity-word inline-block">S</span>
                <span className="proximity-word inline-block">m</span>
                <span className="proximity-word inline-block">a</span>
                <span className="proximity-word inline-block">r</span>
                <span className="proximity-word inline-block">t</span>
              </span>
            </h1>
            <h2 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="proximity-text bg-gradient-to-r dark:from-gray-200 dark:via-gray-300 dark:to-gray-400 from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent inline-block">
                <span className="proximity-word inline-block">School&nbsp;</span>
                <span className="proximity-word inline-block">Bus</span>
              </span>
            </h2>
            <h3 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="proximity-text bg-gradient-to-r dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-300 from-sky-600 via-sky-500 to-sky-400 bg-clip-text text-transparent inline-block">
                <span className="proximity-word inline-block">Management</span>
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
              className="bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl group"
            >
              Get Started 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
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
  );
};

export default HeroSection;