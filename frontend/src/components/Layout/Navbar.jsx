import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Navbar = ({ user, setIsAuthenticated }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setShowDropdown(false);
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-lg shadow-slate-200/20 transition-all duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          
          {/* Brand/Logo Area - Optimized for mobile */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center group cursor-pointer"
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
            >
              {/* Logo - Smaller on mobile */}
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-indigo-600 to-fuchsia-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-400/40 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-black text-lg sm:text-xl tracking-tighter">H</span>
              </div>
              
              {/* Brand name - Hidden on very small screens, shown on sm+ */}
              <span className="ml-3 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Hubcredo
              </span>
              
              {/* Version badge - Hidden on mobile */}
              <span className="hidden sm:inline ml-2 sm:ml-3 text-xs text-fuchsia-600 font-bold bg-fuchsia-100/70 px-2 sm:px-3 py-1 rounded-full border border-fuchsia-300">
                V3.0
              </span>
            </div>
          </div>

          {/* Utility & User Controls - Optimized spacing */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            
            {/* Notifications Bell - Hidden on mobile */}
            {!isMobile && (
              <button 
                className="text-slate-500 hover:text-indigo-600 transition-colors duration-200 p-2 rounded-full hover:bg-slate-100 relative group"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 border border-white rounded-full"></span>
              </button>
            )}
            
            <div className="relative">
              <div className="flex items-center space-x-2 sm:space-x-4">
                
                {/* Desktop User Info - Hidden on mobile */}
                <div className="hidden lg:block text-right pr-2">
                  <p className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate max-w-[180px]">
                    {user?.name || 'Jane Doe'}
                  </p>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">
                    {user?.email || 'jane.doe@hubcredo.com'}
                  </p>
                </div>
                
                {/* Profile Button - Optimized for mobile */}
                <div className="relative">
                  <button
                    ref={buttonRef}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-slate-50 hover:bg-slate-100 rounded-full pl-1 pr-3 sm:pl-2 sm:pr-4 py-1.5 sm:py-2 transition-all duration-300 border border-slate-200 shadow-sm sm:shadow-md shadow-slate-300/30 hover:shadow-md focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-indigo-400/50"
                    aria-label="User menu"
                    aria-expanded={showDropdown}
                  >
                    {/* Avatar - Smaller on mobile */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-300/40 transition-transform duration-300 hover:scale-105">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {getInitials(user?.name)}
                      </span>
                    </div>
                    
                    {/* Chevron - Hidden on mobile, shown on desktop */}
                    <svg 
                      className={`hidden sm:block w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    
                    {/* Mobile Menu Icon (when dropdown is closed) */}
                    {isMobile && !showDropdown && (
                      <svg 
                        className="w-5 h-5 text-slate-500"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>

                  {/* Dropdown Menu - Responsive positioning */}
                  {showDropdown && (
                    <div 
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-56 sm:w-60 bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-slate-100 py-2 z-50"
                      style={{ 
                        top: isMobile ? 'calc(100% + 0.5rem)' : 'calc(100% + 0.75rem)',
                        maxWidth: isMobile ? 'calc(100vw - 2rem)' : 'none'
                      }}
                    >
                      
                      {/* Dropdown Header - Shows user info on mobile */}
                      <div className="px-4 py-3 mb-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.name || 'Jane Doe'}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || 'jane.doe@hubcredo.com'}
                        </p>
                      </div>

                      {/* Dropdown Items */}
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // navigate('/settings/profile');
                        }}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150 focus:outline-none focus:bg-indigo-50"
                      >
                        <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.608 3.3 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Profile Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          // navigate('/billing');
                        }}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150 focus:outline-none focus:bg-indigo-50"
                      >
                        <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m0 0l2.5-2.5M7 13h10a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v6z" />
                        </svg>
                        Billing & Plans
                      </button>

                      {/* Sign Out Button */}
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150 focus:outline-none focus:bg-red-50"
                        >
                          <svg className="w-5 h-5 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;