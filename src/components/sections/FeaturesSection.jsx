import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Shield, Smartphone, Users, Clock, Star } from 'lucide-react';
import styled from 'styled-components';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const FeaturesSection = ({ featuresRef }) => {
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced features cards animations
      gsap.utils.toArray('.card').forEach((card, index) => {
        gsap.set(card, { 
          opacity: 0,
          y: 100
        });
        
        // Staggered entrance animation
        ScrollTrigger.create({
          trigger: card,
          start: 'top 85%',
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
              delay: index * 0.1,
              overwrite: 'auto'
            });
          },
          onLeaveBack: () => {
            gsap.to(card, {
              opacity: 0,
              y: 100,
              duration: 0.6,
              ease: 'power2.in'
            });
          }
        });
      });

      // Animate section header
      gsap.fromTo('.features-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.features-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
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
  ];

  return (
    <StyledWrapper ref={sectionRef} className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 features-header">
          <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
            Powerful <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            Advanced technology meets safety and convenience for modern school transportation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card">
              <div className="content">
                <div className="icon-container dark:text-yellow-400 text-sky-600 mb-6">
                  {feature.icon}
                </div>
                <p className="heading">{feature.title}</p>
                <p className="para">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.section`
  .card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 24px;
    line-height: 1.6;
    transition: all 0.64s cubic-bezier(0.23, 1, 0.32, 1);
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    
    .dark & {
      background: rgba(31, 41, 55, 0.7);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
  }
  
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 36px;
    border-radius: 24px;
    background: transparent;
    color: #000000;
    z-index: 1;
    transition: all 0.64s cubic-bezier(0.23, 1, 0.32, 1);
    width: 100%;
    height: 100%;
    
    .dark & {
      color: #ffffff;
    }
  }
  
  .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    border-radius: inherit;
    height: 100%;
    width: 100%;
    opacity: 0;
    transform: skew(-24deg);
    clip-path: circle(0% at 50% 50%);
    transition: all 0.64s cubic-bezier(0.23, 1, 0.32, 1);
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.9), rgba(56, 189, 248, 0.9));
    
    .dark & {
      background: linear-gradient(135deg, rgba(250, 204, 21, 0.9), rgba(234, 179, 8, 0.9));
    }
  }
  
  .content .heading {
    font-weight: 700;
    font-size: 24px;
    line-height: 1.3;
    z-index: 1;
    margin: 0;
  }
  
  .content .para {
    z-index: 1;
    opacity: 0.8;
    font-size: 16px;
    margin: 0;
  }
  
  .icon-container {
    z-index: 1;
    transition: all 0.64s cubic-bezier(0.23, 1, 0.32, 1);
  }
  
  .card:hover::before {
    opacity: 1;
    transform: skew(0deg);
    clip-path: circle(140.9% at 0 0);
  }
  
  .card:hover .content {
    color: #ffffff;
  }
  
  .card:hover .icon-container {
    color: #ffffff !important;
    transform: scale(1.2) rotate(5deg);
  }
`;

export default FeaturesSection;