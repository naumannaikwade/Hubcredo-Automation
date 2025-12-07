import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
// import { analyticsAPI } from '../../services/api'; // Assume this is correctly imported

// --- Placeholder for API (for demonstration purposes) ---
const mockUserStats = {
  totalAutomations: 18,
  successfulCycles: 987,
  failedCycles: 42,
  // New comparative data for the insane version
  automationChange: 12.5, 
  successChange: 4.1, 
  failureChange: -8.9, 
  recentLogs: [
    { automationType: 'Email Campaign Sync', totalCycles: 15, status: 'completed', createdAt: new Date(Date.now() - 3600000) },
    { automationType: 'DB Cleanup Task', totalCycles: 1, status: 'failed', createdAt: new Date(Date.now() - 7200000) },
    { automationType: 'Lead Generation Flow', totalCycles: 210, status: 'completed', createdAt: new Date(Date.now() - 10800000) },
    { automationType: 'Inventory Update', totalCycles: 5, status: 'completed', createdAt: new Date(Date.now() - 14400000) },
    { automationType: 'User Authentication', totalCycles: 1, status: 'failed', createdAt: new Date(Date.now() - 18000000) },
    { automationType: 'Backup System', totalCycles: 1, status: 'completed', createdAt: new Date(Date.now() - 21600000) },
  ],
};
// --------------------------------------------------------


// Helper Component for Status Indicators
const StatusChange = ({ value }) => {
  if (value === 0 || value === undefined) {
    return <span className="text-xs text-slate-500 font-medium">No change</span>;
  }
  
  const isPositive = value > 0;
  // Use slightly stronger colors for better visibility
  const colorClass = isPositive ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100';
  const icon = isPositive ? (
    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
  ) : (
    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
  );

  const displayValue = Math.abs(value).toFixed(1);

  // Added stronger border for contrast on white cards
  return (
    <div className={`flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full ${colorClass} border border-current shadow-sm`}>
      {icon}
      <span>{displayValue}%</span>
    </div>
  );
};

// Main Component
const AnalyticsPanel = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await analyticsAPI.getUserStats();
      // setUserStats(response.stats);

      // Using mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      setUserStats(mockUserStats);

    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateSuccessRate = () => {
    if (!userStats) return '0%';
    const total = userStats.successfulCycles + userStats.failedCycles;
    if (total === 0) return '0%';
    const rate = (userStats.successfulCycles / total) * 100;
    return `${Math.round(rate)}%`;
  };

  if (loading) {
    return (
      // Loading state designed to fill the content area nicely
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl border border-slate-200 shadow-3xl p-16 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          {/* Custom Gradient Spinner */}
          <div className="relative w-16 h-16 mx-auto mb-6">
             <div className="w-full h-full rounded-full border-4 border-slate-200 absolute"></div>
             <div className="w-full h-full rounded-full border-4 border-t-indigo-500 border-l-violet-500 border-b-fuchsia-500 animate-spin-slow absolute"></div>
          </div>
          <p className="text-xl text-slate-700 font-semibold animate-pulse tracking-wide">Gathering deep insights...</p>
          <p className="text-sm text-slate-400 mt-1">This may take a moment to crunch all performance metrics.</p>
        </div>
      </div>
    );
  }

  return (
    // Main container with appropriate top padding to start below the Navbar
    <div className="space-y-8 animate-fade-in-up mb-[90px]">
      {/* Header and Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Analytics Dashboard</h2>
          <p className="text-slate-500 mt-1 text-lg">Real-time metrics and automation performance</p>
        </div>
        <button
          onClick={fetchUserStats}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          <svg className="w-5 h-5 mr-3 text-slate-500 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Stat Cards (Enhanced Skeuomorphism and Change Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Automations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-50/50 hover:shadow-2xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors shadow-inner shadow-indigo-200/50">
              <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <StatusChange value={userStats?.automationChange} />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Automations</p>
          <h3 className="mt-1 text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
            {userStats?.totalAutomations || 0}
          </h3>
        </div>

        {/* Card 2: Successful Cycles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-50/50 hover:shadow-2xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors shadow-inner shadow-emerald-200/50">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <StatusChange value={userStats?.successChange} />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Successful Cycles</p>
          <h3 className="mt-1 text-4xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
            {userStats?.successfulCycles?.toLocaleString() || 0}
          </h3>
        </div>

        {/* Card 3: Failed Cycles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-50/50 hover:shadow-2xl transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors shadow-inner shadow-rose-200/50">
              <svg className="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <StatusChange value={userStats?.failureChange} />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Failed Cycles</p>
          <h3 className="mt-1 text-4xl font-black text-slate-900 group-hover:text-rose-600 transition-colors">
            {userStats?.failedCycles || 0}
          </h3>
        </div>

        {/* Card 4: Success Rate (Highlight Card) */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-3xl shadow-indigo-300/40 transform hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
            {/* Background pattern for depth */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 opacity-20 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 opacity-10 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative">
            <p className="text-sm font-semibold text-indigo-100 uppercase tracking-wider">Overall Success Rate</p>
            <h3 className="mt-1 text-5xl font-black text-white">
              {calculateSuccessRate()}
            </h3>
            <div className="mt-4 flex items-center justify-between">
                <p className="text-indigo-200 text-sm font-medium">Metric calculated over all time.</p>
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Recent Activity Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-50/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800">Recent Activity Log</h3>
            <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">Real-time Feed</span>
          </div>
          <div className="divide-y divide-slate-100">
            {userStats?.recentLogs?.slice(0, 5).map((log, index) => (
              <div key={index} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    {/* Status Dot */}
                    <div className={`w-2.5 h-2.5 rounded-full ring-2 ${
                      log.status === 'completed' ? 'bg-emerald-500 ring-emerald-200' : 'bg-rose-500 ring-rose-200'
                    }`}></div>
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{log.automationType}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(log.createdAt).toLocaleTimeString()} - {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pl-5 pt-1">
                  <span className="text-sm text-slate-500 italic">
                    Executed <span className="font-semibold text-slate-700">{log.totalCycles}</span> cycle{log.totalCycles !== 1 ? 's' : ''}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    log.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  } shadow-sm`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
            {(!userStats?.recentLogs || userStats.recentLogs.length === 0) && (
               <div className="p-8 text-center text-slate-400 text-base">No recent activity found. Start your first automation!</div>
            )}
          </div>
        </div>

        {/* Performance Overview (Chart Placeholder) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-50/50 p-6 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">Cycle Performance Over Time</h3>
          <div className="flex-1 flex items-center justify-center min-h-[250px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <div className="text-center p-6">
              <div className="bg-indigo-50 p-4 rounded-full shadow-lg shadow-indigo-200/50 inline-block mb-4">
                <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="text-slate-900 font-bold text-lg">Integrate Chart Library</h4>
              <p className="text-sm text-slate-500 mt-1">Connect your charting solution (e.g., Chart.js, Recharts) here to visualize performance data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;