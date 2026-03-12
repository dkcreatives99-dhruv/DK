import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Lock className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-syne font-bold text-white">
                Privacy Policy
              </h1>
              <p className="text-slate-400 font-manrope text-sm">Last updated: January 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-green-500/10 rounded-2xl p-8 mb-8 border border-green-500/20">
            <p className="text-slate-300 font-manrope leading-relaxed">
              At DK KINETIC DIGITAL, we believe that <strong>"Where Creativity Meets Technology with Privacy"</strong>. 
              Your privacy is fundamental to our business. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">1. Information We Collect</h2>
            <h3 className="text-lg font-syne font-semibold text-white mb-2">Personal Information</h3>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside mb-4">
              <li>Name and contact details (email, phone number)</li>
              <li>Company name and business information</li>
              <li>Project requirements and specifications</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>
            <h3 className="text-lg font-syne font-semibold text-white mb-2">Automatically Collected Information</h3>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address (anonymized)</li>
              <li>Pages visited and time spent on site</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">2. How We Use Your Information</h2>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>To provide and improve our services</li>
              <li>To communicate with you about projects and inquiries</li>
              <li>To send relevant updates (with your consent)</li>
              <li>To analyze website usage and improve user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">3. Data Protection</h2>
            <p className="text-slate-400 font-manrope leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure servers with restricted access</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
              <li>Secure backup procedures</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">4. Data Sharing</h2>
            <p className="text-slate-400 font-manrope leading-relaxed mb-4">
              We do NOT sell your personal information. We may share data only with:
            </p>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>Service providers who assist in our operations (under strict confidentiality)</li>
              <li>Legal authorities when required by law</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">5. Cookies</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              We use essential cookies to ensure our website functions properly. Analytics cookies 
              are used only with your consent to help us understand how visitors interact with our site. 
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">6. Your Rights</h2>
            <p className="text-slate-400 font-manrope leading-relaxed mb-4">You have the right to:</p>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">7. Data Retention</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              We retain personal data only as long as necessary for the purposes outlined in this policy, 
              or as required by law. Project-related data is typically retained for 7 years for legal and 
              accounting purposes. You may request earlier deletion of non-essential data.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">8. Third-Party Links</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Our website may contain links to third-party sites. We are not responsible for the privacy 
              practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">9. Children's Privacy</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Our services are not directed at children under 18. We do not knowingly collect personal 
              information from children. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">10. Updates to This Policy</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              We may update this Privacy Policy periodically. Significant changes will be communicated 
              via our website or email. Continued use of our services constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">11. Contact Us</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              For privacy-related inquiries or to exercise your rights, contact us:
            </p>
            <div className="bg-slate-800/50 rounded-xl p-6 mt-4 border border-slate-700">
              <p className="text-white font-manrope">DK KINETIC DIGITAL - Privacy Officer</p>
              <p className="text-slate-400 font-manrope">1A/204 NG Suncity 2, Kandivali East, Mumbai 400101</p>
              <p className="text-slate-400 font-manrope">Phone: +91 9996749994</p>
              <p className="text-slate-400 font-manrope">Email: privacy@dkkineticdigital.com</p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-manrope text-sm">
            © {new Date().getFullYear()} DK KINETIC DIGITAL. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/terms" className="text-slate-400 hover:text-white font-manrope text-sm transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/disclaimer" className="text-slate-400 hover:text-white font-manrope text-sm transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
