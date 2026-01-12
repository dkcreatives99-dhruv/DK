import React from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Building2, ShoppingBag, PartyPopper, 
  GraduationCap, Stethoscope, Utensils, Plane
} from 'lucide-react';

const IndustriesSection = () => {
  const industries = [
    { icon: Rocket, name: 'Startups', desc: 'Launch and scale with digital-first strategies' },
    { icon: Building2, name: 'Corporates', desc: 'Enterprise solutions for digital transformation' },
    { icon: ShoppingBag, name: 'E-commerce', desc: 'Drive sales with optimized online experiences' },
    { icon: PartyPopper, name: 'Events', desc: 'Create memorable brand experiences' },
    { icon: GraduationCap, name: 'Education', desc: 'EdTech solutions and student engagement' },
    { icon: Stethoscope, name: 'Healthcare', desc: 'Patient-centric digital solutions' },
    { icon: Utensils, name: 'F&B', desc: 'Restaurant and food brand marketing' },
    { icon: Plane, name: 'Travel', desc: 'Hospitality and tourism marketing' },
  ];

  return (
    <section id="industries" className="section-light py-20 md:py-32 relative" data-testid="industries-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-manrope font-medium mb-4"
          >
            Industries We Serve
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-syne font-bold text-slate-900 mb-4"
            data-testid="industries-title"
          >
            Empowering Every Sector
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 font-manrope text-base md:text-lg max-w-2xl mx-auto"
          >
            We bring industry-specific expertise to deliver tailored digital 
            solutions that address your unique challenges.
          </motion.p>
        </div>

        {/* Industries Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {industries.map((industry, index) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-6 md:p-8 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
              data-testid={`industry-${industry.name.toLowerCase()}`}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary flex items-center justify-center mb-4 transition-all duration-300">
                  <industry.icon className="w-7 h-7 text-slate-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-syne font-bold text-slate-900 text-lg mb-2">
                  {industry.name}
                </h3>
                <p className="text-slate-500 font-manrope text-sm leading-relaxed">
                  {industry.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 font-manrope text-lg mb-4">
            Don't see your industry? <span className="text-slate-900 font-semibold">We adapt.</span>
          </p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-primary font-manrope font-semibold hover:underline"
            data-testid="industries-contact-link"
          >
            Let's discuss your needs →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default IndustriesSection;
