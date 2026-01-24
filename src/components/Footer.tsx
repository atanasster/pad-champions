import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-brand-red">CHAMPIONS</h3>
            <p className="text-slate-300 mb-4">
              Comprehensive Heart and Limb Multidisciplinary Limb Preservation Networks. Dedicated
              to saving limbs and lives through early detection.
            </p>
            <p className="text-sm text-slate-400">
              Note: We are not affiliated with the "CHAMPION Trial" for heart failure.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/screenings"
                  className="text-slate-300 hover:text-white underline decoration-dotted"
                >
                  Find a Free Screening
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="text-slate-300 hover:text-white underline decoration-dotted"
                >
                  Take the Risk Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/volunteer"
                  className="text-slate-300 hover:text-white underline decoration-dotted"
                >
                  Medical Student Volunteers
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white underline decoration-dotted"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-slate-300 mb-2">Foundation to Advance Vascular Cures</p>
            <p className="text-slate-300 mb-2">Email: info@vascularcures.org</p>
            <p className="text-slate-300">
              <span className="block mt-4 text-sm font-semibold text-brand-red">
                Emergency Warning:
              </span>
              <span className="text-sm">
                If you have sudden severe leg pain, coldness, or numbness, call 911 or go to the ER
                immediately.
              </span>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} CHAMPIONS Project. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
