import React, { useState, useEffect } from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Close sidebar on desktop resize
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (sidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target) &&
          menuButton && 
          !menuButton.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Close on escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') setSidebarOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [sidebarOpen]);

  const menuItems = [
    { 
      id: 'automation', 
      label: 'Automation', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ) 
    },
    { 
      id: 'loops', 
      label: 'Loop Controls', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) 
    },
    { 
      id: 'logs', 
      label: 'Logs', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ) 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2-5a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2H6z" />
        </svg>
      ) 
    },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Online': return 'text-emerald-600 bg-emerald-100 border-emerald-300';
      case 'Connected': return 'text-emerald-600 bg-emerald-100 border-emerald-300';
      case 'Pending': return 'text-amber-600 bg-amber-100 border-amber-300';
      default: return 'text-slate-500 bg-slate-100 border-slate-300';
    }
  };

  const statusData = [
    { label: 'Backend API', status: 'Online' },
    { label: 'Database Sync', status: 'Connected' },
    { label: 'Webhooks Queue', status: 'Pending' },
  ];

  // Mobile Menu Button (to be added to your Navbar or main layout)
  const MobileMenuButton = () => (
    <button
      id="mobile-menu-button"
      onClick={() => setSidebarOpen(true)}
      className="md:hidden flex items-center justify-center p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors duration-200 ml-2"
      aria-label="Open menu"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  // Sidebar Content Component (reused for both mobile and desktop)
  const SidebarContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'p-4' : 'p-6'} flex flex-col h-full`}>
      {/* Close button for mobile */}
      {isMobile && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Section */}
      <div className={`${isMobile ? 'flex-grow' : 'flex-grow overflow-y-auto pr-2 custom-scrollbar'}`}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Dashboard</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between ${isMobile ? 'px-3 py-3' : 'px-4 py-3'} rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <span className="flex items-center space-x-3">
                <span className={`p-1.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm sm:text-base">{item.label}</span>
              </span>
              {activeTab === item.id && (
                <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* System Status Section */}
      <div className={`${isMobile ? 'mt-4' : 'mt-8 pt-6'} border-t border-slate-100 flex-shrink-0`}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">System Status</h3>
        <div className="space-y-2">
          {statusData.map(({ label, status }) => (
            <div key={label} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-600 font-medium text-xs sm:text-sm">{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusClasses(status)}`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button - Add this to your Navbar */}
      {isMobile && <MobileMenuButton />}

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div 
            id="mobile-sidebar"
            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out"
            style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            <SidebarContent isMobile={true} />
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed top-0 left-0 bottom-0 pt-20 bg-white shadow-xl shadow-slate-100/50 border-r border-slate-100">
        <SidebarContent />
      </div>

      {/* Mobile Bottom Navigation Bar (Alternative) */}
      {isMobile && !sidebarOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30 md:hidden">
          <div className="flex justify-around p-2">
            {menuItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 flex-1 mx-1 ${
                  activeTab === item.id
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-500 hover:text-indigo-500'
                }`}
              >
                <span className={`p-1.5 rounded-lg ${activeTab === item.id ? 'bg-indigo-100' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-xs mt-1 font-medium">{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;