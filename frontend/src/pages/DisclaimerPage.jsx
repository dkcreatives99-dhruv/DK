import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DisclaimerPage = () => {
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
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-syne font-bold text-white">
                Disclaimer
              </h1>
              <p className="text-slate-400 font-manrope text-sm">Last updated: January 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-yellow-500/10 rounded-2xl p-8 mb-8 border border-yellow-500/20">
            <p className="text-slate-300 font-manrope leading-relaxed">
              The information provided on the DK KINETIC DIGITAL website is for general informational 
              purposes only. By using this website, you acknowledge and agree to the following disclaimers.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">1. Website Content</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              While we strive to keep the information on our website accurate and up-to-date, 
              DK KINETIC DIGITAL makes no representations or warranties of any kind, express or implied, 
              about the completeness, accuracy, reliability, suitability, or availability of the website 
              or the information, products, services, or related graphics contained on the website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">2. Professional Advice</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              The content on this website does not constitute professional advice. For specific advice 
              related to your business or technical needs, please consult with our team directly or 
              seek appropriate professional counsel. Any reliance you place on information from this 
              website is strictly at your own risk.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">3. Project Results</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Case studies, testimonials, and examples shown on our website represent results achieved 
              by specific clients. Results may vary depending on various factors including but not limited 
              to market conditions, client cooperation, and project scope. Past performance does not 
              guarantee similar results.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">4. Third-Party Services</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Our services may integrate with or depend on third-party platforms, APIs, or services. 
              DK KINETIC DIGITAL is not responsible for any interruptions, changes, or issues caused 
              by third-party services. We recommend clients maintain their own backup and contingency plans.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">5. External Links</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Our website may contain links to external websites that are not operated by us. 
              We have no control over the content, privacy policies, or practices of any third-party 
              sites and assume no responsibility for them. We encourage you to review the terms and 
              privacy policies of any external sites you visit.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">6. Technical Information</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Technical specifications, pricing, features, and service descriptions are subject to 
              change without notice. While we make reasonable efforts to update information, some 
              details may become outdated. Always confirm current specifications before making decisions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-400 font-manrope leading-relaxed mb-4">
              In no event shall DK KINETIC DIGITAL be liable for any:
            </p>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>Direct, indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Personal injury or property damage</li>
              <li>Any damages arising from the use or inability to use our website or services</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">8. Intellectual Property</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              All trademarks, logos, and brand names mentioned on this website are the property of their 
              respective owners. Mention of third-party products or services does not imply endorsement 
              or affiliation unless explicitly stated.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">9. Service Availability</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              We strive to ensure our website and services are available 24/7, but we cannot guarantee 
              uninterrupted access. We reserve the right to modify, suspend, or discontinue any aspect 
              of our website or services at any time without prior notice.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">10. Governing Law</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              This disclaimer shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising from this disclaimer shall be subject to the exclusive jurisdiction 
              of the courts in Mumbai, Maharashtra.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">11. Contact</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              If you have any questions about this disclaimer, please contact us:
            </p>
            <div className="bg-slate-800/50 rounded-xl p-6 mt-4 border border-slate-700">
              <p className="text-white font-manrope">DK KINETIC DIGITAL</p>
              <p className="text-slate-400 font-manrope">1A/204 NG Suncity 2, Kandivali East, Mumbai 400101</p>
              <p className="text-slate-400 font-manrope">Phone: +91 9996749994</p>
              <p className="text-slate-400 font-manrope">Email: hello@dkkineticdigital.com</p>
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
            <Link to="/privacy" className="text-slate-400 hover:text-white font-manrope text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
