import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FaCar, 
  FaUserTie, 
  FaUserShield, 
  FaUsers, 
  FaMobileAlt, 
  FaMapMarkerAlt, 
  FaShieldAlt,
  FaBus,
  FaRocket,
  FaSyncAlt,
  FaLayerGroup,
  FaWaveSquare
} from 'react-icons/fa';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const AppsSection = ({ appsRef }) => {
  const sectionRef = useRef();
  const orbitContainerRef = useRef();
  const iconRefs = useRef([]);
  const featureRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Central icon pulse animation
      gsap.to('.central-icon', {
        scale: 1.05,
        duration: 2,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      });

      // Create orbital animation
      const orbitRadius = 160;
      const centerX = orbitContainerRef.current ? orbitContainerRef.current.offsetWidth / 2 : 200;
      const centerY = orbitContainerRef.current ? orbitContainerRef.current.offsetHeight / 2 : 200;
      const duration = 20;

      // Set initial positions in a circle
      iconRefs.current.forEach((el, index) => {
        if (el) {
          const angle = (index * 90) * (Math.PI / 180);
          const x = Math.cos(angle) * orbitRadius;
          const y = Math.sin(angle) * orbitRadius;
          gsap.set(el, { x, y });
        }
      });

      // Create orbital animation
      iconRefs.current.forEach((el, index) => {
        if (el) {
          const startAngle = index * 90;
          const target = { angle: startAngle };

          gsap.to(target, {
            angle: startAngle + 360,
            duration: duration,
            repeat: -1,
            ease: 'linear',
            onUpdate: () => {
              const rad = target.angle * (Math.PI / 180);
              const x = Math.cos(rad) * orbitRadius;
              const y = Math.sin(rad) * orbitRadius;
              gsap.set(el, { x, y });
            }
          });

          // Hover animations
          el.addEventListener('mouseenter', () => {
            gsap.to(el, {
              scale: 1.3,
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.6)',
              duration: 0.4,
              ease: 'back.out(2)'
            });
            
            // Pause orbit animation on hover
            gsap.to(el, {
              timeScale: 0.3,
              duration: 0.5
            });
          });
          
          el.addEventListener('mouseleave', () => {
            gsap.to(el, {
              scale: 1,
              boxShadow: '0 0 0 rgba(255, 255, 255, 0)',
              duration: 0.4,
              ease: 'power2.out'
            });
            
            // Resume orbit animation
            gsap.to(el, {
              timeScale: 1,
              duration: 0.5
            });
          });
        }
      });

      // Enhanced feature cards animation with stagger
      featureRefs.current.forEach((feature, index) => {
        if (feature) {
          ScrollTrigger.create({
            trigger: feature,
            start: 'top 90%',
            onEnter: () => {
              gsap.fromTo(feature,
                { 
                  opacity: 0, 
                  x: -100, 
                  scale: 0.9,
                  rotationY: -15
                },
                { 
                  opacity: 1, 
                  x: 0, 
                  scale: 1,
                  rotationY: 0,
                  duration: 0.8,
                  ease: 'back.out(1.7)',
                  delay: index * 0.2
                }
              );
            }
          });
        }
      });

      // Section header animation with enhanced effects
      gsap.fromTo('.apps-header',
        { 
          opacity: 0, 
          y: 80, 
          scale: 0.95,
          rotationX: 5 
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.5,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.apps-header',
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Background elements animation
      gsap.to('.floating-bg-1', {
        y: 20,
        duration: 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

      gsap.to('.floating-bg-2', {
        y: -20,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.5
      });

      // Orbit path animation
      gsap.to('.orbit-path', {
        rotation: 360,
        duration: 40,
        ease: 'linear',
        repeat: -1
      });

      // Wave animation for integration banner
      gsap.to('.wave-icon', {
        rotation: 10,
        duration: 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const appIcons = [
    {
      icon: <FaCar className="w-10 h-10" />,
      title: "Driver App",
      color: "from-blue-500 to-blue-600",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      orbitSpeed: 1.0
    },
    {
      icon: <FaUserTie className="w-10 h-10" />,
      title: "Attender App", 
      color: "from-green-500 to-green-600",
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
      orbitSpeed: 0.8
    },
    {
      icon: <FaUserShield className="w-10 h-10" />,
      title: "Admin App",
      color: "from-purple-500 to-purple-600",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      orbitSpeed: 1.2
    },
    {
      icon: <FaUsers className="w-10 h-10" />,
      title: "Parent App",
      color: "from-orange-500 to-orange-600",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      orbitSpeed: 0.9
    }
  ];

  const features = [
    { 
      icon: <FaMobileAlt className="w-8 h-8" />, 
      title: "Mobile-First Design", 
      desc: "Optimized for smartphones and tablets with intuitive interfaces" 
    },
    { 
      icon: <FaMapMarkerAlt className="w-8 h-8" />, 
      title: "Real-Time GPS", 
      desc: "Live location tracking with high precision and route optimization" 
    },
    { 
      icon: <FaShieldAlt className="w-8 h-8" />, 
      title: "Safety Features", 
      desc: "Comprehensive safety monitoring, alerts, and emergency protocols" 
    },
    { 
      icon: <FaLayerGroup className="w-8 h-8" />, 
      title: "Multi-Platform", 
      desc: "Seamless experience across iOS, Android, and web platforms" 
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 px-6 relative overflow-hidden bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 from-sky-50 to-white">
      {/* Animated background elements */}
      <div className="floating-bg-1 absolute top-0 left-0 w-72 h-72 bg-gradient-to-br dark:from-yellow-400/10 from-sky-400/10 to-transparent -translate-y-1/2 -translate-x-1/2 rounded-full"></div>
      <div className="floating-bg-2 absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl dark:from-yellow-400/10 from-sky-400/10 to-transparent translate-y-1/2 translate-x-1/2 rounded-full"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-grid-pattern dark:bg-grid-pattern-dark bg-cover"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 apps-header">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r dark:from-yellow-400/20 dark:to-yellow-600/20 from-sky-400/20 to-sky-600/20 mb-6">
            <FaRocket className="w-6 h-6 dark:text-yellow-400 text-sky-600 mr-2" />
            <span className="text-sm font-semibold dark:text-yellow-400 text-sky-600">INTEGRATED ECOSYSTEM</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
            Our <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Apps</span>
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            A complete ecosystem of specialized applications designed for every role in school transportation management
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          {/* Circular App Icons */}
          <div className="lg:w-1/2 flex justify-center">
            <div 
              ref={orbitContainerRef}
              className="relative w-96 h-96 flex items-center justify-center"
            >
              {/* Orbit path visualization */}
              <div className="orbit-path absolute w-80 h-80 rounded-full border-2 border-dashed dark:border-yellow-400/20 border-sky-400/20"></div>
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {appIcons.map((_, index) => {
                  const angle = (index * 90) * (Math.PI / 180);
                  const radius = 160;
                  const centerX = 192;
                  const centerY = 192;
                  const x = Math.cos(angle) * radius + centerX;
                  const y = Math.sin(angle) * radius + centerY;
                  
                  return (
                    <line
                      key={index}
                      className={`connection-line-${index} stroke-current dark:text-yellow-400/30 text-sky-400/30 opacity-30 stroke-1`}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                    />
                  );
                })}
              </svg>

              {/* App icons in orbit */}
              {appIcons.map((app, index) => (
                <div
                  key={index}
                  ref={(el) => iconRefs.current[index] = el}
                  className="app-icon absolute w-20 h-20 rounded-2xl shadow-xl border-2 dark:border-yellow-400/40 border-sky-400/40 cursor-pointer group overflow-hidden"
                  style={{
                    transformOrigin: 'center'
                  }}
                >
                  <div className={`w-full h-full ${app.gradient} flex flex-col items-center justify-center text-white relative overflow-hidden transition-all duration-500 p-3`}>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      {app.icon}
                    </div>
                    
                    {/* Hover overlay with title */}
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
                      <span className="text-white text-xs font-bold text-center mb-1">{app.title}</span>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </div>
                </div>
              ))}
              
              {/* Center logo */}
              <div className="central-icon absolute w-28 h-28 rounded-2xl bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 flex items-center justify-center shadow-2xl border-2 dark:border-yellow-500/30 border-sky-500/30">
                <div className="relative">
                  <FaBus className="w-12 h-12 text-white" />
                  <div className="absolute -inset-3 bg-gradient-to-br dark:from-yellow-400/20 dark:to-yellow-600/20 from-sky-400/20 to-sky-600/20 rounded-full blur-md"></div>
                </div>
              </div>
            </div>
          </div>

          {/* App Features */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold dark:text-white text-gray-800">
                Integrated Ecosystem
              </h3>
              <p className="text-lg dark:text-gray-300 text-gray-600">
                Our platform provides specialized applications for every user type in your school transportation ecosystem, ensuring seamless coordination and communication across all roles.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  ref={(el) => featureRefs.current[index] = el}
                  className="app-feature flex items-start gap-4 p-6 rounded-2xl dark:bg-gray-800/50 bg-white/80 backdrop-blur-sm border dark:border-gray-700/30 border-sky-200/30 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br dark:from-yellow-400/20 dark:to-yellow-500/20 from-sky-400/20 to-sky-500/20 dark:text-yellow-400 text-sky-600 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold dark:text-white text-gray-800 text-lg mb-2">{feature.title}</h4>
                    <p className="text-sm dark:text-gray-300 text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integration Banner with enhanced animation */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 from-sky-50 to-white border dark:border-gray-700/30 border-sky-200/30 text-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br dark:from-yellow-400/10 from-sky-400/10 to-transparent rounded-full"></div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-tl dark:from-yellow-400/10 from-sky-400/10 to-transparent rounded-full"></div>
          
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-r dark:from-yellow-400/20 dark:to-yellow-600/20 from-sky-400/20 to-sky-600/20 mb-4 relative z-10">
            <FaWaveSquare className="wave-icon w-5 h-5 dark:text-yellow-400 text-sky-600" />
          </div>
          <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-3 relative z-10">Seamless Integration</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto relative z-10">
            All applications work together in perfect harmony, sharing data in real-time to provide a cohesive experience across your entire transportation ecosystem.
          </p>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(14 165 233 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
        .dark .bg-grid-pattern-dark {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(250 204 21 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </section>
  );
};

export default AppsSection;