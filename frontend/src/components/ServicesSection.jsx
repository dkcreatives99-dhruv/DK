import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Palette, Code, Brain, Calendar, 
  Search, Share2, Mail, Target, Megaphone,
  Layout, ShoppingCart, Server, MessageSquare,
  BarChart3, Users, Mic
} from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      category: 'Digital Marketing',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      items: [
        { name: 'SEO & SEM', icon: Search, desc: 'Rank higher, get found faster' },
        { name: 'Social Media', icon: Share2, desc: 'Engage your audience everywhere' },
        { name: 'Email Marketing', icon: Mail, desc: 'Convert leads into customers' },
        { name: 'Performance Ads', icon: Target, desc: 'ROI-focused campaigns' },
      ]
    },
    {
      category: 'Creative & Branding',
      icon: Palette,
      color: 'from-purple-500 to-pink-500',
      items: [
        { name: 'Brand Strategy', icon: Target, desc: 'Define your unique identity' },
        { name: 'Campaign Planning', icon: Megaphone, desc: 'Strategic market positioning' },
        { name: 'Content Creation', icon: Layout, desc: 'Stories that resonate' },
        { name: 'Media Planning', icon: BarChart3, desc: 'Maximize your reach' },
      ]
    },
    {
      category: 'Web & Technology',
      icon: Code,
      color: 'from-emerald-500 to-teal-500',
      items: [
        { name: 'Web Development', icon: Layout, desc: 'Fast, modern websites' },
        { name: 'E-commerce', icon: ShoppingCart, desc: 'Sell online seamlessly' },
        { name: 'Custom Portals', icon: Server, desc: 'Tailored business solutions' },
        { name: 'Domain & Hosting', icon: Server, desc: 'Reliable infrastructure' },
      ]
    },
    {
      category: 'AI & Automation',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      items: [
        { name: 'AI Chatbots', icon: MessageSquare, desc: '24/7 intelligent support' },
        { name: 'ML Solutions', icon: Brain, desc: 'Data-driven decisions' },
        { name: 'Process Automation', icon: BarChart3, desc: 'Streamline operations' },
        { name: 'Smart Apps', icon: Code, desc: 'Intelligent applications' },
      ]
    },
    {
      category: 'Events & Media',
      icon: Calendar,
      color: 'from-amber-500 to-yellow-500',
      items: [
        { name: 'Corporate Events', icon: Users, desc: 'Memorable experiences' },
        { name: 'Artist Management', icon: Mic, desc: 'Celebrity partnerships' },
        { name: 'Digital Campaigns', icon: Megaphone, desc: 'Viral brand moments' },
        { name: 'Live Productions', icon: Calendar, desc: 'Flawless execution' },
      ]
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="services" className="section-light py-20 md:py-32 relative" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-manrope font-medium mb-4"
          >
            Our Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-syne font-bold text-slate-900 mb-4"
            data-testid="services-title"
          >
            360° Digital Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 font-manrope text-base md:text-lg max-w-2xl mx-auto"
          >
            From strategy to execution, we offer comprehensive digital services 
            to accelerate your business growth.
          </motion.p>
        </div>

        {/* Services Grid - Bento Style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.category}
              variants={itemVariants}
              className={`service-card bg-white p-8 rounded-2xl border border-slate-100 hover:shadow-xl transition-shadow duration-300 ${
                index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
              }`}
              data-testid={`service-card-${service.category.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-syne font-bold text-slate-900">
                  {service.category}
                </h3>
              </div>

              {/* Service Items */}
              <div className={`grid ${index === 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} gap-4`}>
                {service.items.map((item) => (
                  <div
                    key={item.name}
                    className="group p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow duration-200">
                      <item.icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <h4 className="font-manrope font-semibold text-slate-900 text-sm mb-1">
                      {item.name}
                    </h4>
                    <p className="font-manrope text-slate-500 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-4 font-manrope font-semibold transition-colors duration-300"
            data-testid="services-cta"
          >
            Discuss Your Project
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
