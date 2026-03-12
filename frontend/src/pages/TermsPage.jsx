import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsPage = () => {
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
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-syne font-bold text-white">
                Terms & Conditions
              </h1>
              <p className="text-slate-400 font-manrope text-sm">Last updated: January 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-700">
            <p className="text-slate-300 font-manrope leading-relaxed">
              Welcome to DK KINETIC DIGITAL. By accessing our website and using our services, 
              you agree to be bound by these Terms and Conditions.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">1. Services</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              DK KINETIC DIGITAL provides software development, digital marketing, web development, 
              AI solutions, and related technology services. The scope of services for each project 
              will be defined in a separate agreement or proposal.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">2. Intellectual Property</h2>
            <p className="text-slate-400 font-manrope leading-relaxed mb-4">
              All content on this website, including text, graphics, logos, and software, is the 
              property of DK KINETIC DIGITAL and is protected by intellectual property laws.
            </p>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Upon full payment, clients receive ownership of deliverables as specified in the 
              project agreement. DK KINETIC DIGITAL retains the right to showcase completed 
              projects in our portfolio unless otherwise agreed.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">3. Payment Terms</h2>
            <ul className="text-slate-400 font-manrope space-y-2 list-disc list-inside">
              <li>Payment terms will be specified in project proposals</li>
              <li>A deposit may be required before project commencement</li>
              <li>Late payments may incur additional charges</li>
              <li>All prices are in Indian Rupees unless otherwise specified</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">4. Confidentiality</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              We maintain strict confidentiality of all client information and project details. 
              Both parties agree not to disclose confidential information to third parties without 
              prior written consent.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              DK KINETIC DIGITAL shall not be liable for any indirect, incidental, or consequential 
              damages arising from the use of our services. Our liability is limited to the amount 
              paid for the specific service in question.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">6. Termination</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              Either party may terminate services with written notice as specified in the project 
              agreement. Upon termination, payment for work completed up to the termination date 
              is due immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">7. Governing Law</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, 
              Maharashtra.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-syne font-bold text-white mb-4">8. Contact</h2>
            <p className="text-slate-400 font-manrope leading-relaxed">
              For questions about these Terms & Conditions, please contact us at:
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
            <Link to="/privacy" className="text-slate-400 hover:text-white font-manrope text-sm transition-colors">
              Privacy Policy
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

export default TermsPage;
