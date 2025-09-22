import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame, Bus, ExternalLink } from 'lucide-react';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const OtherServicesSection = ({ otherServicesRef }) => {
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Service cards animations
      gsap.utils.toArray('.other-service-card').forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 90%',
          onEnter: () => {
            gsap.fromTo(card,
              { 
                opacity: 0,
                y: 80,
                scale: 0.9,
                rotationX: 15
              },
              { 
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                duration: 0.8,
                ease: 'back.out(1.7)',
                delay: index * 0.2
              }
            );
          },
          onLeaveBack: () => {
            gsap.to(card, {
              opacity: 0,
              y: 80,
              duration: 0.6,
              ease: 'power2.in'
            });
          }
        });

        // Enhanced hover animations
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            y: -10,
            duration: 0.4,
            ease: 'power2.out'
          });
          gsap.to(card.querySelector('.service-icon'), {
            scale: 1.2,
            rotation: 5,
            duration: 0.3,
            ease: 'back.out(2)'
          });
          gsap.to(card.querySelector('.demo-button'), {
            scale: 1.1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
          gsap.to(card.querySelector('.service-icon'), {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
          gsap.to(card.querySelector('.demo-button'), {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // Section header animation
      gsap.fromTo('.other-services-header',
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.other-services-header',
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Floating background elements animation
      gsap.to('.floating-element-1', {
        y: 30,
        x: 20,
        duration: 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });

      gsap.to('.floating-element-2', {
        y: -25,
        x: -15,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 1
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const otherServices = [
    {
      title: "Fire Station Management",
      description: "Advanced fire station management system with real-time emergency response tracking and resource allocation.",
      features: ["Emergency Response Tracking", "Resource Management", "Real-time Dispatch", "Performance Analytics"],
      icon: <Flame className="w-12 h-12" />,
      color: "from-red-500 to-red-600",
      demoLink: "http://68.178.203.99:5000/",
      bgGradient: "from-red-500/10 to-red-600/10",
      accentColor: "red"
    },
    {
      title: "STV Smart Travel Bus",
      description: "Intelligent travel bus management with route optimization, passenger tracking, and smart scheduling.",
      features: ["Smart Route Planning", "Passenger Management", "Live Tracking", "Automated Scheduling"],
      icon: <Bus className="w-12 h-12" />,
      color: "from-green-500 to-green-600", 
      demoLink: "http://68.178.203.99:3000/",
      bgGradient: "from-green-500/10 to-green-600/10",
      accentColor: "green"
    }
  ];

  const handleDemoClick = (demoLink, title) => {
    window.open(demoLink, '_blank'); // Open the demo link in a new tab
  };

  return (
    <section ref={sectionRef} className="py-24 px-6 relative overflow-hidden bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 from-sky-50 to-white">
      {/* Floating background elements */}
      <div className="floating-element-1 absolute top-10 left-10 w-32 h-32 bg-gradient-to-br dark:from-yellow-400/10 from-sky-400/10 to-sky-500/10 rounded-full blur-xl"></div>
      <div className="floating-element-2 absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br dark:from-yellow-500/15 dark:to-yellow-600/15 from-sky-500/15 to-sky-600/15 rounded-full blur-lg"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-3 dark:opacity-5">
        <div className="absolute inset-0 bg-grid-pattern bg-cover"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 other-services-header">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r dark:from-yellow-400/20 dark:to-yellow-600/20 from-sky-400/20 to-sky-600/20 mb-6">
            <span className="text-sm font-semibold dark:text-yellow-400 text-sky-600">EXTENDED SOLUTIONS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
            Our Other <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            Expanding beyond school transportation with comprehensive solutions for various industries and use cases
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {otherServices.map((service, index) => (
            <div 
              key={index} 
              className="other-service-card relative group cursor-pointer"
            >
              {/* Main card */}
              <div className="relative p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${service.color} transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`service-icon inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-6 shadow-lg`}>
                    {service.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-black dark:group-hover:text-black transition-colors duration-500">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed group-hover:text-black dark:group-hover:text-black transition-colors duration-500">
                    {service.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-black transition-colors duration-500">
                        <div className={`w-2 h-2 rounded-full mr-3 bg-gradient-to-r ${service.color} flex-shrink-0`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Demo button */}
                  <button
                    onClick={() => handleDemoClick(service.demoLink, service.title)}
                    className={`demo-button w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r ${service.color} text-white font-semibold hover:shadow-lg transition-all duration-300 group/btn`}
                  >
                    <span>View Demo</span>
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
              </div>

              {/* Glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${service.color} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Call to action banner */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r dark:from-gray-800/90 dark:to-gray-700/90 from-gray-100/90 to-gray-50/90 border dark:border-gray-700/50 border-gray-200/50 text-center backdrop-blur-sm overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-3">
              Need a Custom Solution?
            </h3>
            <p className="text-lg dark:text-gray-300 text-gray-600 mb-6 max-w-2xl mx-auto">
              At EmCom, we specialize in delivering cutting-edge training, development, and testing services in embedded systems and communication technologies. Our mission is to empower engineers and businesses to build world-class solutions.
            </p>
            <button
              onClick={() => window.location.href = "https://emcomserv.com/"}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <span>Get Custom Quote</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 0.02)' stroke-width='1'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
        .dark .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.02)' stroke-width='1'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </section>
  );
};

export default OtherServicesSection;