import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_interest: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    'Software Development',
    'Web Development',
    'AI & Automation',
    'Digital Marketing',
    'Mobile App Development',
    'Other'
  ];

  const contactInfo = [
    { icon: MapPin, label: 'Office', value: '1A/204 NG Suncity 2, Kandivali East, Mumbai 400101' },
    { icon: Phone, label: 'Phone', value: '+91 9996749994', href: 'tel:+919996749994' },
    { icon: MessageCircle, label: 'WhatsApp', value: '+91 9996749994', href: 'https://wa.me/919996749994', color: 'text-green-500' },
    { icon: Clock, label: 'Hours', value: 'Mon - Sat: 9AM - 6PM' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API}/contact`, formData);
      
      if (response.data.success) {
        setIsSubmitted(true);
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service_interest: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-dark py-20 md:py-32 relative overflow-hidden" data-testid="contact-section">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 glass text-slate-300 rounded-full text-sm font-manrope font-medium mb-4"
          >
            Get In Touch
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-syne font-bold text-white mb-4"
            data-testid="contact-title"
          >
            Let's Build Something Great
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-manrope text-base md:text-lg max-w-2xl mx-auto"
          >
            Ready to transform your digital presence? Drop us a message and 
            our team will get back to you within 24 hours.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-10"
          >
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-white font-syne font-bold text-2xl mb-3">
                  Thank You!
                </h3>
                <p className="text-slate-400 font-manrope mb-6">
                  We've received your message and will be in touch shortly.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 font-manrope text-sm mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-manrope text-sm mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@company.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 font-manrope text-sm mb-2">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      data-testid="contact-phone-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-manrope text-sm mb-2">
                      Company
                    </label>
                    <Input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      data-testid="contact-company-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-manrope text-sm mb-2">
                    Service Interest
                  </label>
                  <select
                    name="service_interest"
                    value={formData.service_interest}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none appearance-none cursor-pointer"
                    data-testid="contact-service-select"
                  >
                    <option value="" className="bg-slate-900">Select a service</option>
                    {services.map((service) => (
                      <option key={service} value={service} className="bg-slate-900">
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-manrope text-sm mb-2">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us about your project..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    data-testid="contact-message-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-4 font-manrope font-semibold text-base transition-all duration-300 glow-hover disabled:opacity-50"
                  data-testid="contact-submit-button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      Send Message
                      <Send className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Contact Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className={`w-10 h-10 rounded-xl ${info.color ? 'bg-green-500/10' : 'bg-primary/10'} flex items-center justify-center mb-3`}>
                    <info.icon className={`w-5 h-5 ${info.color || 'text-primary'}`} />
                  </div>
                  <p className="text-slate-500 font-manrope text-xs mb-1">{info.label}</p>
                  {info.href ? (
                    <a 
                      href={info.href} 
                      target={info.href.startsWith('https') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className={`font-manrope text-sm font-medium ${info.color ? 'text-green-400 hover:text-green-300' : 'text-white hover:text-primary'} transition-colors`}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-white font-manrope text-sm font-medium">{info.value}</p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Map - Mumbai Kandivali */}
            <div className="glass rounded-3xl overflow-hidden h-64 md:h-80">
              <iframe
                title="DK KINETIC DIGITAL Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.5508832671986!2d72.85970307620982!3d19.20428364813697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b7b5ee6d0001%3A0x8c2e5c5c5c5c5c5c!2sKandivali%20East%2C%20Mumbai%2C%20Maharashtra%20400101!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="map-container"
                data-testid="contact-map"
              />
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919996749994?text=Hi%20DK%20KINETIC%20DIGITAL!%20I'm%20interested%20in%20your%20services."
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-2xl p-6 flex items-center gap-4 hover:bg-green-500/10 transition-colors cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h4 className="text-white font-syne font-bold text-lg group-hover:text-green-400 transition-colors">
                  Chat on WhatsApp
                </h4>
                <p className="text-slate-400 font-manrope text-sm">
                  Quick response • Available Mon-Sat
                </p>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
