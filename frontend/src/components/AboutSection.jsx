import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Award, Users, Lightbulb, Shield } from 'lucide-react';

const AboutSection = () => {
  const values = [
    { icon: Lightbulb, title: 'Innovation', desc: 'Pushing boundaries with creative solutions' },
    { icon: Heart, title: 'Integrity', desc: 'Building trust through transparency' },
    { icon: Shield, title: 'Privacy', desc: 'Your data security is our priority' },
    { icon: Award, title: 'Excellence', desc: 'Delivering exceptional quality always' },
  ];

  return (
    <section id="about" className="section-light py-20 md:py-32 relative overflow-hidden" data-testid="about-section">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Main About Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1667351326034-c6d733c57dc9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjb3Jwb3JhdGUlMjBidXNpbmVzcyUyMHRlYW0lMjBwcm9mZXNzaW9uYWwlMjBzbWlsaW5nfGVufDB8fHx8MTc2ODIxMzc5MXww&ixlib=rb-4.1.0&q=85"
                alt="DK Kinetic Team"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
            </div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-syne font-bold text-primary">5+</div>
                  <div className="text-slate-500 text-sm font-manrope">Years</div>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <div className="text-3xl font-syne font-bold text-primary">150+</div>
                  <div className="text-slate-500 text-sm font-manrope">Projects</div>
                </div>
                <div className="w-px h-12 bg-slate-200" />
                <div className="text-center">
                  <div className="text-3xl font-syne font-bold text-primary">50+</div>
                  <div className="text-slate-500 text-sm font-manrope">Clients</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-manrope font-medium mb-4">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-syne font-bold text-slate-900 mb-6" data-testid="about-title">
              Your Partner in Digital Excellence
            </h2>
            <p className="text-slate-600 font-manrope text-base md:text-lg leading-relaxed mb-6">
              <strong>DK KINETIC DIGITAL</strong> is a premier software and digital technology 
              company dedicated to transforming businesses through innovative digital solutions 
              with a strong focus on privacy and security.
            </p>
            <p className="text-slate-600 font-manrope text-base md:text-lg leading-relaxed mb-8">
              We combine creativity with technology to deliver results that matter. From 
              startups to enterprises, we've helped over 50 clients achieve their digital 
              goals through strategic software development, cutting-edge web solutions, and 
              AI-powered applications—all while keeping your data secure.
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-slate-900 mb-1">Our Mission</h4>
                  <p className="text-slate-600 font-manrope text-sm">
                    Empower businesses with transformative digital solutions that drive growth.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-syne font-bold text-slate-900 mb-1">Our Vision</h4>
                  <p className="text-slate-600 font-manrope text-sm">
                    Be the leading digital agency revolutionizing businesses across India.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-syne font-bold text-slate-900 text-center mb-10">
            Our Core Values
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h4 className="font-syne font-bold text-slate-900 mb-2">{value.title}</h4>
                <p className="text-slate-500 font-manrope text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
