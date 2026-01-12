import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Bot, Cpu, BarChart3, Cog, Sparkles, ArrowRight } from 'lucide-react';

const TechSection = () => {
  const techServices = [
    {
      icon: Bot,
      title: 'AI Chatbots',
      desc: 'Intelligent conversational agents that provide 24/7 customer support and lead qualification.',
      features: ['Natural Language Processing', 'Multi-platform Integration', 'Smart Routing']
    },
    {
      icon: Brain,
      title: 'Machine Learning',
      desc: 'Data-driven solutions that learn and adapt to optimize your business processes.',
      features: ['Predictive Analytics', 'Pattern Recognition', 'Automated Insights']
    },
    {
      icon: Cog,
      title: 'Process Automation',
      desc: 'Streamline operations with intelligent automation that reduces manual work.',
      features: ['Workflow Automation', 'Task Scheduling', 'Integration APIs']
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      desc: 'Transform raw data into actionable insights with AI-powered analytics.',
      features: ['Real-time Dashboards', 'Custom Reports', 'Trend Analysis']
    },
  ];

  return (
    <section id="tech" className="section-dark py-20 md:py-32 relative overflow-hidden" data-testid="tech-section">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-manrope font-medium text-slate-300 mb-4"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Technology & AI
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-syne font-bold text-white mb-4"
            data-testid="tech-title"
          >
            Powering Tomorrow's Business
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-manrope text-base md:text-lg max-w-2xl mx-auto"
          >
            Leverage cutting-edge AI and automation technologies to stay ahead 
            of the competition and transform your operations.
          </motion.p>
        </div>

        {/* Main Tech Visual */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden animated-border">
              <img
                src="https://images.unsplash.com/photo-1737505599159-5ffc1dcbc08f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwYnJhaW4lMjBjaXJjdWl0fGVufDB8fHx8MTc2ODIxMzc3MHww&ixlib=rb-4.1.0&q=85"
                alt="AI Technology"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>

            {/* Floating Stats */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-6 left-6 glass rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-white font-syne font-bold text-xl">99.9%</div>
                  <div className="text-slate-400 text-xs font-manrope">Uptime Guaranteed</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-6 -right-6 glass rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="text-white font-syne font-bold text-xl">3x</div>
                  <div className="text-slate-400 text-xs font-manrope">Efficiency Boost</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="tech-card glass p-6 rounded-2xl hover:bg-white/5 transition-colors duration-300"
                data-testid={`tech-card-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-white font-syne font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-slate-400 font-manrope text-sm mb-4 leading-relaxed">{service.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-4 font-manrope font-semibold transition-colors duration-300 glow-hover"
            data-testid="tech-cta"
          >
            Explore AI Solutions
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TechSection;
