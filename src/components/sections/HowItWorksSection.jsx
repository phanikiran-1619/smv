import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUser, FaTachometerAlt, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HowItWorksSection = ({ aboutRef }) => {
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Roadmap items animation
      gsap.utils.toArray('.roadmap-item').forEach((item, index) => {
        const isEven = index % 2 === 0;
        
        ScrollTrigger.create({
          trigger: item,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(item,
              { 
                opacity: 0, 
                x: isEven ? -100 : 100,
                scale: 0.8
              },
              { 
                opacity: 1, 
                x: 0,
                scale: 1,
                duration: 0.8,
                ease: 'back.out(1.7)',
                delay: index * 0.2
              }
            );
          }
        });

        // Hover animations for roadmap items
        item.addEventListener('mouseenter', () => {
          gsap.to(item.querySelector('.roadmap-content'), {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(item.querySelector('.roadmap-icon'), {
            scale: 1.2,
            rotation: 5,
            duration: 0.3,
            ease: 'back.out(2)'
          });
        });

        item.addEventListener('mouseleave', () => {
          gsap.to(item.querySelector('.roadmap-content'), {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(item.querySelector('.roadmap-icon'), {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // Animated roadmap line
      gsap.fromTo('.roadmap-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.roadmap-container',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Section header animation
      gsap.fromTo('.works-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.works-header',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const roadmapSteps = [
    {
      step: "01",
      title: "Login/Select Role",
      description: "Choose your role: Parent, Admin, or Super Admin",
      icon: <FaUser className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600"
    },
    {
      step: "02", 
      title: "Dashboard Access",
      description: "Access your personalized management dashboard",
      icon: <FaTachometerAlt className="w-6 h-6" />,
      color: "from-green-500 to-green-600"
    },
    {
      step: "03",
      title: "Real-time Tracking", 
      description: "Track buses live with GPS precision technology",
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600"
    },
    {
      step: "04",
      title: "Safety Reports",
      description: "Receive alerts and comprehensive safety reports",
      icon: <FaShieldAlt className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 works-header">
          <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
            How It <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            Simple steps to get started with smart school bus management
          </p>
        </div>

        <div className="roadmap-container relative max-w-4xl mx-auto">
          {/* Vertical roadmap line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 roadmap-line bg-gradient-to-b dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 origin-top"></div>

          <div className="space-y-16">
            {roadmapSteps.map((item, index) => (
              <div key={index} className={`roadmap-item flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className={`roadmap-content relative ${index % 2 === 0 ? 'mr-8 pr-12' : 'ml-8 pl-12'} max-w-md`}>
                  {/* Step number circle */}
                  <div className={`absolute ${index % 2 === 0 ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 ${index % 2 === 0 ? 'translate-x-1/2' : '-translate-x-1/2'} w-16 h-16 rounded-full bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-lg shadow-lg z-10`}>
                    {item.step}
                  </div>

                  {/* Content card */}
                  <div className={`p-8 rounded-2xl dark:bg-gray-800/80 bg-white/80 backdrop-blur-sm border-2 dark:border-gray-700/50 border-sky-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                      <div className={`roadmap-icon p-3 rounded-lg bg-gradient-to-br ${item.color} text-white`}>
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-bold dark:text-white text-gray-800">
                        {item.title}
                      </h3>
                    </div>
                    <p className="dark:text-gray-300 text-gray-600 text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Connecting line to center */}
                  <div className={`absolute ${index % 2 === 0 ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 ${index % 2 === 0 ? 'translate-x-8' : '-translate-x-8'} w-8 h-0.5 bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-4 h-4 rounded-full bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 shadow-lg"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 rounded-full bg-gradient-to-br dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-600 shadow-lg"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;