import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const scrollToContact = (e) => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToServices = (e) => {
    e.preventDefault();
    document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { value: '150+', label: 'Projects Delivered', icon: Sparkles },
    { value: '50+', label: 'Happy Clients', icon: Globe },
    { value: '5+', label: 'Years Experience', icon: Zap },
  ];

  return (
    <section id="hero" className="hero-bg grid-bg relative min-h-screen flex items-center overflow-hidden" data-testid="hero-section">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-slate-300 text-sm font-manrope">Digital Transformation Partner</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-syne font-bold text-white leading-tight mb-6"
              data-testid="hero-title"
            >
              Accelerating Your{' '}
              <span className="gradient-text">Digital Future</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-base md:text-lg font-manrope leading-relaxed mb-8 max-w-lg"
              data-testid="hero-description"
            >
              We craft exceptional digital experiences through innovative marketing, 
              cutting-edge technology, and AI-powered solutions. Transform your 
              business with India's emerging digital agency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button
                onClick={scrollToContact}
                className="bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-6 font-manrope font-semibold text-base btn-shine glow-hover transition-shadow duration-300"
                data-testid="hero-cta-primary"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={scrollToServices}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 font-manrope font-semibold text-base transition-colors duration-300"
                data-testid="hero-cta-secondary"
              >
                Explore Services
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-white font-syne font-bold text-2xl">{stat.value}</div>
                    <div className="text-slate-500 font-manrope text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square">
              {/* Main Image */}
              <div className="absolute inset-8 rounded-3xl overflow-hidden animated-border">
                <img
                  src="https://images.unsplash.com/photo-1746470427686-4c3551f3d689?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwZGlnaXRhbCUyMG5ldHdvcmslMjBhYnN0cmFjdCUyMGJsdWV8ZW58MHx8fHwxNzY4MjEzNzY1fDA&ixlib=rb-4.1.0&q=85"
                  alt="Digital Network"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-4 right-4 glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">AI Powered</div>
                    <div className="text-slate-400 text-xs">Smart Solutions</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-4 left-4 glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Global Reach</div>
                    <div className="text-slate-400 text-xs">Worldwide Clients</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-slate-500 text-xs font-manrope">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-slate-700 flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
