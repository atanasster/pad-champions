import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { NavItem } from '../types';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const navItems: NavItem[] = [
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
  const navigate = useNavigate();
  const { currentUser, userRole, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="shrink-0 flex items-center gap-3" onClick={closeMenu}>
              <img src="/img/logo-2.png" alt="CHAMPIONS Logo" className="h-12 w-auto" />
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
                className={`px-2 py-2 rounded text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  location.pathname === item.path
                    ? 'text-brand-red bg-red-50'
                    : 'text-slate-600 hover:text-brand-red hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage
                        src={currentUser.photoURL || ''}
                        alt={currentUser.displayName || 'User'}
                      />
                      <AvatarFallback>
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(userRole === 'admin' || userRole === 'moderator') && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Console</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="hidden lg:block">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 hover:text-brand-red hover:bg-slate-100"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
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
            {!currentUser && (
              <Link
                to="/login"
                onClick={closeMenu}
                className="block px-4 py-3 rounded text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-red"
              >
                Log In
              </Link>
            )}
            {currentUser && (
              <>
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-red"
                  >
                    Admin Console
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-red"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-red"
                >
                  Profile
                </Link>
                <div
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="block px-4 py-3 rounded text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-red cursor-pointer"
                >
                  Log Out
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
