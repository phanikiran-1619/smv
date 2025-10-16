import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin as LocationIcon, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ContactSection = ({ contactRef }) => {
  const sectionRef = useRef();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone || !school.trim() || !message.trim()) {
      setError('All fields are required');
      return;
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Phone must be exactly 10 digits');
      return;
    }

    if (!email.trim().includes('@')) {
      setError('Valid email is required');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactNumber: phone,
          email: email.trim(),
          fullName,
          message: message.trim(),
          schoolName: school.trim()
        })
      });

      if (res.ok) {
        setSuccess(true);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setSchool('');
        setMessage('');
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactDetails = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: ["+91 9912940042"]
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email", 
      details: ["info@emcomserv.com"]
    },
    {
      icon: <LocationIcon className="w-6 h-6" />,
      title: "Address",
      details: ["Beside Bhagani, Hoodi, Bangalore – 560048, INDIA"]
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
          </div>

          <Card className="contact-form p-8 dark:bg-gray-800/80 bg-white/80 backdrop-blur-sm border-2 dark:border-gray-700/50 border-sky-200/50 shadow-2xl">
            <h3 className="text-2xl font-bold dark:text-white text-gray-800 mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter Your Email Id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    maxLength={10}
                    className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Escape' && e.key !== 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">School/Organization</label>
                <input 
                  type="text" 
                  className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter Your School Name"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="form-input w-full px-4 py-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-white border border-gray-300 focus:ring-2 dark:focus:ring-yellow-400 focus:ring-sky-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              {error && (
                <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-red-200 dark:text-red-800 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-green-200 dark:text-green-800 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Message sent successfully!
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 from-sky-500 to-sky-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 py-6 text-lg group">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;