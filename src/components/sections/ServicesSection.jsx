import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Shield, Bus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ServicesSection = ({ servicesRef }) => {
  const sectionRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Services cards animations
      gsap.utils.toArray('.service-card').forEach((card, index) => {
        gsap.set(card, { transformStyle: 'preserve-3d', perspective: 1000 });
        
        // Scroll animation with smooth entrance
        ScrollTrigger.create({
          trigger: card,
          start: 'top 95%',
          onEnter: () => {
            gsap.fromTo(card,
              { 
                opacity: 0,
                y: 120,
                scale: 0.95
              },
              { 
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: 'power4.out',
                delay: index * 0.3
              }
            );
          },
          onLeaveBack: () => {
            gsap.to(card, {
              opacity: 0,
              y: 120,
              duration: 0.8,
              ease: 'power2.in'
            });
          }
        });
      });

      // Section header animation
      gsap.fromTo('.services-header',
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.6,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.services-header',
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const services = [
    {
      title: "For Parents",
      description: "Track your child's bus in real-time, receive notifications, and ensure their safety with our intuitive platform.",
      features: ["Real-time GPS tracking", "Instant push notifications", "Advanced safety alerts", "Detailed trip history"],
      icon: <Users className="w-12 h-12" />,
      color: "from-emerald-400 to-emerald-600",
      action: () => navigate('/login/parent'),
      backTitle: "Parent Access Portal",
      backDescription: "Secure access to real-time updates, safety features, and complete transportation monitoring for your child's journey."
    },
    {
      title: "For School Admins",
      description: "Efficiently manage routes, drivers, students, and oversee all transportation operations from a single dashboard.",
      features: ["Dynamic route management", "Driver assignment tools", "Student attendance tracking", "Advanced analytics dashboard"],
      icon: <Shield className="w-12 h-12" />,
      color: "from-blue-400 to-blue-600",
      action: () => navigate('/login/admin'),
      backTitle: "Admin Access Portal",
      backDescription: "Powerful tools for managing your school's entire transportation system with ease and precision."
    },
    {
      title: "For Super Admins",
      description: "Gain system-wide control, manage users, and maintain comprehensive oversight with advanced administrative features.",
      features: ["Full system administration", "Multi-user management", "Global performance analytics", "Enhanced security controls"],
      icon: <Bus className="w-12 h-12" />,
      color: "from-indigo-400 to-indigo-600",
      action: () => navigate('/login/superadmin'),
      backTitle: "Super Admin Access Portal",
      backDescription: "Enterprise-level control with sophisticated analytics, user oversight, and robust security management."
    }
  ];

  return (
    <StyledWrapper ref={sectionRef} className="py-28 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 services-header">
          <h2 className="text-5xl md:text-6xl font-extrabold dark:text-white text-gray-900 mb-8 tracking-tight leading-tight">
            Our <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-600 from-sky-500 to-sky-700 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl md:text-2xl dark:text-gray-300 text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Tailored solutions combining cutting-edge technology with user-centric design for optimal school transportation management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="content">
                    <div className={`icon-container inline-flex p-5 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-8 shadow-md`}>
                      {service.icon}
                    </div>
                    <h3 className="title text-3xl font-bold mb-6">{service.title}</h3>
                    <p className="description text-base leading-relaxed">{service.description}</p>
                    <ul className="features space-y-4 mt-6 flex-grow">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-base font-medium">
                          <div className={`w-3 h-3 rounded-full mr-4 bg-gradient-to-r ${service.color}`}></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flip-card-back">
                  <div className="content">
                    <div className={`icon-container inline-flex p-5 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-8 shadow-md`}>
                      {service.icon}
                    </div>
                    <h3 className="title text-3xl font-bold mb-6">{service.backTitle}</h3>
                    <p className="description text-base leading-relaxed mb-10">{service.backDescription}</p>
                    <button 
                      onClick={service.action}
                      className={`access-button w-full py-4 text-lg font-semibold bg-gradient-to-r ${service.color} text-white hover:opacity-90 transform hover:scale-105 transition-all duration-300 rounded-lg shadow-md`}
                    >
                      Enter Portal <ArrowRight className="ml-3 w-5 h-5 inline" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.section`
  background: linear-gradient(to bottom, rgba(240, 249, 255, 0.5), rgba(255, 255, 255, 0.5));
  .dark & {
    background: linear-gradient(to bottom, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9));
  }

  .service-card {
    background-color: transparent;
    width: 100%;
    max-width: 360px;
    height: 480px;
    perspective: 1000px;
    font-family: sans-serif;
    margin: 0 auto;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 800;
    text-align: center;
    margin: 0;
    color: #1f2937;
    .dark & {
      color: #ffffff;
    }
  }

  .description {
    color: #4b5563;
    .dark & {
      color: #d1d5db;
    }
  }

  .features {
    color: #4b5563;
    .dark & {
      color: #d1d5db;
    }
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transition-timing-function: cubic-bezier(0.61, 0.98, 0.48, 1.01);
    transform-style: preserve-3d;
  }

  .service-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 1rem;
    padding: 2rem;
  }

  .flip-card-front {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    color: #000;
    .dark & {
      background: rgba(31, 41, 55, 0.9);
      color: #fff;
    }
  }

  .flip-card-back {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    color: #000;
    transform: rotateY(180deg);
    .dark & {
      background: rgba(31, 41, 55, 0.9);
      color: #fff;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1.5rem;
  }

  .access-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default ServicesSection;