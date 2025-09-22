import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import {
  Bus,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import ThemeToggle from '../../components/ThemeToggle';

// ---------- section imports ----------
import HeroSection from '../../components/sections/HeroSection';
import FeaturesSection from '../../components/sections/FeaturesSection';
import ServicesSection from '../../components/sections/ServicesSection';
import OtherServicesSection from '../../components/sections/OtherServicesSection';
import AppsSection from '../../components/sections/AppsSection';
import HowItWorksSection from '../../components/sections/HowItWorksSection';
import ContactSection from '../../components/sections/ContactSection';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef();

  /* ---------- refs ---------- */
  const featuresRef = useRef();
  const servicesRef = useRef();
  const otherServicesRef = useRef();
  const appsRef = useRef();
  const aboutRef = useRef();
  const contactRef = useRef();
  const footerRef = useRef();

  /* ---------- GSAP ---------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.config({ force3D: true, nullTargetWarn: false });

      gsap.fromTo(
        '.footer-content',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.footer-content',
            start: 'top 90%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { className: 'navbar-scrolled', targets: '.navbar' },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  /* ---------- helpers ---------- */
  const handleGetStarted = () => navigate('/home');
  const scrollToSection = (ref) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* ---------- JSX ---------- */
  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden"
    >
      {/* =========================================================
          SKY-BLUE NAVBAR  (light-mode only)
      ========================================================== */}
      <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-sky-600/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* logo */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <div className="p-1.5 bg-white/20 rounded-lg border border-white/30 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {/* School Bus Icon in Yellow */}
                <Bus className="w-5 h-5 text-yellow-400" />
              </div>
              <h1 className="text-lg font-bold text-white">
                School Bus
                <span className="ml-1 opacity-90">Tracker</span>
              </h1>
            </button>

            {/* centre links */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                ['Features', featuresRef],
                ['Services', servicesRef],
                ['Other Services', otherServicesRef],
                ['Apps', appsRef],
                ['How It Works', aboutRef],
                ['Contact', contactRef],
              ].map(([label, ref]) => (
                <button
                  key={label}
                  onClick={() => scrollToSection(ref)}
                  className="text-white/90 hover:text-white font-medium transition-all duration-300 hover:scale-105"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* right buttons */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={handleGetStarted}
                className="bg-white text-sky-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          SECTIONS
      ========================================================== */}
      <HeroSection scrollToSection={scrollToSection} featuresRef={featuresRef} />
      <div ref={featuresRef}><FeaturesSection featuresRef={featuresRef} /></div>
      <div ref={servicesRef}><ServicesSection servicesRef={servicesRef} /></div>
      <div ref={otherServicesRef}><OtherServicesSection otherServicesRef={otherServicesRef} /></div>
      <div ref={appsRef}><AppsSection appsRef={appsRef} /></div>
      <div ref={aboutRef}><HowItWorksSection aboutRef={aboutRef} /></div>
      <div ref={contactRef}><ContactSection contactRef={contactRef} handleGetStarted={handleGetStarted} /></div>

      {/* =========================================================
          SKY-BLUE FOOTER  (light-mode only)
      ========================================================== */}
      <footer
        ref={footerRef}
        className="py-20 px-4 bg-sky-600 dark:bg-gray-900 border-t border-white/20 dark:border-gray-700/50 text-white"
      >
        <div className="max-w-7xl mx-auto footer-content">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* col 1 */}
            <div className="space-y-6">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 group focus:outline-none"
              >
                <div className="p-1.5 bg-white/20 rounded-lg border border-white/30 group-hover:scale-110 transition-transform duration-300">
                  {/* School Bus Icon in Yellow */}
                  <Bus className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  School Bus<span className="ml-1 opacity-90">Tracker</span>
                </h3>
              </button>
              <p className="text-white/80 leading-relaxed">
                Leading the future of safe and efficient school transportation management with innovative technology solutions.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Facebook className="w-5 h-5" />, label: 'Facebook', link: '' },
                  { icon: <Twitter className="w-5 h-5" />, label: 'Twitter', link: '' },
                  { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', link: '' },
                  { icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', link: 'https://www.linkedin.com/company/emcomserv/' },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 transform hover:scale-110"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* utility links */}
            {[
              ['Product', [
                ['Features', featuresRef],
                ['Services', servicesRef],
                ['Other Services', otherServicesRef],
                ['Apps', appsRef],
                ['How It Works', aboutRef],
              ]],
              ['Solutions', [
                ['For Parents', servicesRef],
                ['For Schools', servicesRef],
                ['For Administrators', servicesRef],
                ['Fire Station', otherServicesRef],
                ['Travel Management', otherServicesRef],
                ['Enterprise', contactRef],
              ]],
              ['Support', [
                ['Documentation', aboutRef],
                ['Help Center', contactRef],
                ['Contact Us', contactRef],
                ['Get Started', null, handleGetStarted],
              ]],
            ].map(([title, links]) => (
              <div key={title}>
                <h4 className="font-bold text-white mb-6 text-lg">{title}</h4>
                <ul className="space-y-3">
                  {links.map(([name, ref, action]) => (
                    <li key={name}>
                      <button
                        onClick={action || (() => scrollToSection(ref))}
                        className="text-white/80 hover:text-white transition-all duration-300 text-left hover:translate-x-1"
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 text-sm">© 2025 School Bus Tracker. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((p) => (
                <button
                  key={p}
                  onClick={() => scrollToSection(contactRef)}
                  className="text-white/80 hover:text-white text-sm transition-colors hover:underline"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* scroll-to-top bubble */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-sky-500 to-sky-600 dark:from-yellow-500 dark:to-yellow-600 text-white rounded-full shadow-2xl hover:shadow-sky-500/40 dark:hover:shadow-yellow-500/40 transition-all duration-300 hover:scale-110 z-40"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default LandingPage;
