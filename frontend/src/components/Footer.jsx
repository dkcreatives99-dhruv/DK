import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Linkedin, Twitter, Instagram, Facebook, Youtube,
  ArrowUpRight, Heart, MapPin, Phone, Mail, MessageCircle
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Software Development', href: '#services' },
      { name: 'Web Development', href: '#services' },
      { name: 'AI Solutions', href: '#tech' },
      { name: 'Digital Marketing', href: '#services' },
    ],
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Services', href: '#services' },
      { name: 'Industries', href: '#tech' },
      { name: 'Contact', href: '#contact' },
    ],
    legal: [
      { name: 'Terms & Conditions', href: '/terms', isRoute: true },
      { name: 'Privacy Policy', href: '/privacy', isRoute: true },
      { name: 'Disclaimer', href: '/disclaimer', isRoute: true },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com/company/dkkineticdigital', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com/dkkineticdigital', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/dkkineticdigital', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/dkkineticdigital', label: 'Facebook' },
    { icon: Youtube, href: 'https://youtube.com/@dkkineticdigital', label: 'YouTube' },
  ];

  const scrollToSection = (e, href) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="section-dark border-t border-white/5" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')} className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-syne font-bold text-xl">DK</span>
              </div>
              <div>
                <span className="text-white font-syne font-bold text-xl block">KINETIC DIGITAL</span>
                <span className="text-slate-500 font-manrope text-xs">Where Creativity Meets Technology</span>
              </div>
            </a>
            <p className="text-slate-400 font-manrope text-sm leading-relaxed mb-6">
              Software and digital tech support company delivering innovative solutions 
              with a strong focus on privacy and security. Transform your business with us.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <span className="font-manrope text-sm">
                  1A/204 NG Suncity 2,<br />
                  Kandivali East, Mumbai 400101
                </span>
              </div>
              <a href="tel:+919996749994" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-manrope text-sm">+91 9996749994</span>
              </a>
              <a href="https://wa.me/919996749994" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-green-400 transition-colors">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="font-manrope text-sm">WhatsApp: +91 9996749994</span>
              </a>
              <a href="mailto:hello@dkkineticdigital.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-manrope text-sm">hello@dkkineticdigital.com</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-primary/20 flex items-center justify-center transition-colors duration-200"
                  data-testid={`social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5 text-slate-400 hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-white font-syne font-bold text-lg mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-slate-400 hover:text-white font-manrope text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-syne font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-slate-400 hover:text-white font-manrope text-sm transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-syne font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white font-manrope text-sm transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => scrollToSection(e, link.href)}
                      className="text-slate-400 hover:text-white font-manrope text-sm transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-manrope text-sm text-center md:text-left">
            © {currentYear} DK KINETIC DIGITAL. All rights reserved.
          </p>
          <p className="text-slate-500 font-manrope text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
