import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, HeartPulse } from 'lucide-react';
import { NavItem } from '../types';

const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Find a Screening', path: '/screenings' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Am I At Risk?', path: '/quiz' },
  { label: 'AI Screening', path: '/ai-screening' },
  { label: 'Learn About PAD', path: '/learn' },
  { label: 'Volunteer', path: '/volunteer' },
  { label: 'About', path: '/about' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3" onClick={closeMenu}>
              <div className="bg-brand-red p-1.5 rounded">
                <HeartPulse className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-brand-dark tracking-tight font-serif">CHAMPIONS</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Limb Preservation Network</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu - Full width at xl breakpoint */}
          <div className="hidden xl:flex xl:items-center xl:space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded text-sm font-semibold whitespace-nowrap transition-colors ${
                  location.pathname === item.path
                    ? 'text-brand-red bg-red-50'
                    : 'text-slate-600 hover:text-brand-red hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Medium Screen Menu - Compact version for lg screens */}
          <div className="hidden lg:flex xl:hidden lg:items-center lg:space-x-1 lg:overflow-x-auto lg:scrollbar-hide">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2 py-2 rounded text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  location.pathname === item.path
                    ? 'text-brand-red bg-red-50'
                    : 'text-slate-600 hover:text-brand-red hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded text-slate-600 hover:text-brand-red hover:bg-slate-100 focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-xl absolute w-full z-50 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded text-base font-semibold ${
                  location.pathname === item.path
                    ? 'bg-red-50 text-brand-red'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-brand-red'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;