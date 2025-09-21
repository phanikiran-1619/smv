import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin as LocationIcon, ArrowRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ContactSection = ({ contactRef, handleGetStarted }) => {
  const sectionRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Contact items animation
      gsap.utils.toArray('.contact-item').forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(item,
              { 
                opacity: 0, 
                y: 50,
                scale: 0.9
              },
              { 
                opacity: 1, 
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.7)',
                delay: index * 0.1
              }
            );
          }
        });

        // Hover animations for contact items
        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // Form inputs animation
      gsap.utils.toArray('.form-input').forEach((input, index) => {
        input.addEventListener('focus', () => {
          gsap.to(input, {
            scale: 1.02,
            duration: 0.2,
            ease: 'power2.out'
          });
        });

        input.addEventListener('blur', () => {
          gsap.to(input, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out'
          });
        });
      });

      // Section header animation
      gsap.fromTo('.contact-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-header',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Form card animation
      gsap.fromTo('.contact-form',
        { opacity: 0, x: 50, rotateY: -10 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Contact info animation
      gsap.fromTo('.contact-info',
        { opacity: 0, x: -50, rotateY: 10 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.contact-info',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const contactDetails = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"]
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email", 
      details: ["info@schoolbustracker.com", "support@schoolbustracker.com"]
    },
    {
      icon: <LocationIcon className="w-6 h-6" />,
      title: "Address",
      details: ["123 Education Street", "Learning City, LC 12345"]
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 contact-header">
          <h2 className="text-4xl sm:text-5xl font-bold dark:text-white text-gray-800 mb-6">
            Get In <span className="bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            Ready to revolutionize your school transportation? Contact us today to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="contact-info space-y-8">
            <div className="space-y-6">
              {contactDetails.map((contact, index) => (
                <div key={index} className="contact-item flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-300">
                  <div className="p-3 rounded-lg bg-gradient-to-br dark:from-yellow-400/20 dark:to-yellow-500/20 from-sky-400/20 to-sky-500/20 dark:text-yellow-400 text-sky-600 flex-shrink-0">
                    {contact.icon}
                  </div>
                  <div>
                    <h3 className="font-bold dark:text-white text-gray-800 mb-2 text-lg">{contact.title}</h3>
                    {contact.details.map((detail, idx) => (
                      <p key={idx} className="dark:text-gray-300 text-gray-600">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <div className="p-6 rounded-xl bg-gradient-to-r dark:from-gray-800/50 dark:to-gray-700/50 from-sky-50/50 to-white/50 backdrop-blur-sm border dark:border-gray-700/30 border-sky-200/30">
                <h3 className="font-bold dark:text-white text-gray-800 text-xl mb-4">Why Choose Us?</h3>
                <ul className="space-y-3">
                  {[
                    "24/7 Real-time tracking and support",
                    "Advanced safety monitoring system",
                    "Mobile-first responsive design",
                    "Comprehensive analytics and reporting"
                  ].map((benefit, idx) => (
                    <li key={idx} className="flex items-start dark:text-gray-300 text-gray-600">
                      <div className="w-2 h-2 bg-gradient-to-r dark:from-yellow-400 dark:to-yellow-500 from-sky-500 to-sky-600 rounded-full mr-3 mt-3 flex-shrink-0"></div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                onClick={handleGetStarted}
                className="w-full mt-6 bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-xl group"
              >
                Start Your Free Trial 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </div>

          <Card className="contact-form p-8 dark:bg-gray-800/80 bg-white/80 backdrop-blur-sm border-2 dark:border-gray-700/50 border-sky-200/50 shadow-2xl">
            <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-6">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">School/Organization</label>
                <input 
                  type="text" 
                  className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="ABC Elementary School"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your requirements..."
                ></textarea>
              </div>
              <Button className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 py-6 text-lg group">
                Send Message
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;