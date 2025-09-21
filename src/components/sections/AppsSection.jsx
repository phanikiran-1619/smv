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
  FaBus
} from 'react-icons/fa';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const AppsSection = ({ appsRef }) => {
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Circular icons rotation animation
      gsap.to('.apps-circle', {
        rotation: 360,
        duration: 25,
        ease: 'none',
        repeat: -1
      });

      // Individual app icons hover animations
      gsap.utils.toArray('.app-icon').forEach((icon, index) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, {
            scale: 1.3,
            rotation: 10,
            duration: 0.3,
            ease: 'back.out(2)'
          });
        });
        
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // Feature cards animation
      gsap.utils.toArray('.app-feature').forEach((feature, index) => {
        ScrollTrigger.create({
          trigger: feature,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(feature,
              { opacity: 0, x: -50, scale: 0.8 },
              { 
                opacity: 1, 
                x: 0, 
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
                delay: index * 0.1
              }
            );
          }
        });
      });

      // Section header animation
      gsap.fromTo('.apps-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.apps-header',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const appIcons = [
    {
      icon: <FaCar className="w-8 h-8" />,
      title: "Driver App",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaUserTie className="w-8 h-8" />,
      title: "Attender App", 
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FaUserShield className="w-8 h-8" />,
      title: "Admin App",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Parent App",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const features = [
    { 
      icon: <FaMobileAlt className="w-6 h-6" />, 
      title: "Mobile-First Design", 
      desc: "Optimized for smartphones and tablets" 
    },
    { 
      icon: <FaMapMarkerAlt className="w-6 h-6" />, 
      title: "Real-Time GPS", 
      desc: "Live location tracking with high precision" 
    },
    { 
      icon: <FaShieldAlt className="w-6 h-6" />, 
      title: "Safety Features", 
      desc: "Comprehensive safety monitoring and alerts" 
    },
    { 
      icon: <FaUsers className="w-6 h-6" />, 
      title: "Multi-User Support", 
      desc: "Different interfaces for different roles" 
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 apps-header">
          <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
            Our <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Apps</span>
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            Complete Solution Suite - Our integrated platform provides specialized applications for every user type in your school transportation ecosystem.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Circular App Icons */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-96 h-96">
              <div className="apps-circle absolute inset-0">
                {appIcons.map((app, index) => {
                  const angle = (index * 90) * (Math.PI / 180);
                  const radius = 120;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={index}
                      className="app-icon absolute w-24 h-24 rounded-full shadow-2xl border-4 dark:border-yellow-400/50 border-sky-400/50 cursor-pointer group overflow-hidden"
                      style={{
                        transform: `translate(${x + 168}px, ${y + 168}px)`,
                      }}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${app.color} flex items-center justify-center text-white relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                        {app.icon}
                        
                        {/* Hover overlay with title */}
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-xs font-bold text-center px-2">{app.title}</span>
                        </div>
                        
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Center logo */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 flex items-center justify-center shadow-2xl">
                <FaBus className="w-12 h-12 text-white" />
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

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="app-feature flex items-start gap-4 p-6 rounded-xl dark:bg-gray-800/50 bg-white/50 backdrop-blur-sm border dark:border-gray-700/30 border-sky-200/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br dark:from-yellow-400/20 dark:to-yellow-500/20 from-sky-400/20 to-sky-500/20 dark:text-yellow-400 text-sky-600 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold dark:text-white text-gray-800 text-lg mb-2">{feature.title}</h4>
                    <p className="text-sm dark:text-gray-300 text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <div className="p-6 rounded-xl dark:bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-700/50 bg-gradient-to-r from-sky-50/50 to-white/50 backdrop-blur-sm border dark:border-gray-700/30 border-sky-200/30">
                <h4 className="font-bold dark:text-white text-gray-800 text-lg mb-3">Key Benefits:</h4>
                <ul className="space-y-2">
                  {[
                    "Mobile-First Design - Optimized for smartphones and tablets",
                    "Real-Time GPS - Live location tracking with high precision", 
                    "Safety Features - Comprehensive safety monitoring and alerts",
                    "Multi-User Support - Different interfaces for different roles"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start dark:text-gray-300 text-gray-600 text-sm">
                      <div className="w-2 h-2 bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppsSection;