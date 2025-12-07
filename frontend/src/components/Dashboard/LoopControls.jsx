import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { automationAPI } from '../../services/api';

const LoopControls = ({ user }) => {
  const [maxCycles, setMaxCycles] = useState(10);
  const [activeLoops, setActiveLoops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchLoopStatus();
    
    const interval = setInterval(fetchLoopStatus, 5000);
    setRefreshInterval(interval);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLoopStatus = async () => {
    try {
      const response = await automationAPI.getLoopStatus();
      setActiveLoops(response.activeLoops || []);
    } catch (error) {
      // Error handling matches original
    }
  };

  const handleStartInfiniteLoop = async () => {
    if (maxCycles < 1 || maxCycles > 100) {
      toast.error('Max cycles must be between 1 and 100');
      return;
    }

    setLoading(true);
    try {
      const result = await automationAPI.startInfiniteLoop(maxCycles);
      toast.success(`Infinite loop started!`);
      fetchLoopStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start infinite loop');
    } finally {
      setLoading(false);
    }
  };

  const handleStopLoop = async (loopId) => {
    try {
      await automationAPI.stopLoop(loopId);
      toast.success(`Loop ${loopId} stopped`);
      fetchLoopStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to stop loop');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'stopped': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up mb-[90px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Loop Orchestrator
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          </h2>
          <p className="text-slate-500 mt-1">Manage continuous infinite automation sequences</p>
        </div>
        
        <button
          onClick={fetchLoopStatus}
          className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm gap-2 group"
        >
          <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:rotate-180 transition-all duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Control Card */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <svg className="w-32 h-32 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>

            <div className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800">New Loop Instance</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Max Cycles Limit
                    </label>
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                      {maxCycles}
                    </span>
                  </div>
                  
                  <div className="relative h-12 flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={maxCycles}
                      onChange={(e) => setMaxCycles(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-400">
                    <span>1 Cycle</span>
                    <span>25 Cycles</span>
                    <span>50 Cycles</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <strong className="text-slate-700">Workflow:</strong> Initiates an infinite loop sequence. Each iteration performs a Webhook → Email → Webhook cycle until the max limit is reached.
                  </p>
                </div>

                <button
                  onClick={handleStartInfiniteLoop}
                  disabled={loading}
                  className="w-full group relative flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Initializing Sequence...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                      Start Infinite Loop
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Settings / Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4">
             <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Auto-refresh rate</span>
                <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">5000ms</span>
             </div>
             <div className="w-full h-px bg-slate-100"></div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Active User</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-slate-900 font-bold truncate max-w-[150px]">{user?.email}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Active Loops & Stats */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Statistics Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
               <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
               <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Active Loops</p>
               <h3 className="text-4xl font-extrabold mt-2">{activeLoops.length}</h3>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300">
               <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Cycles</p>
               <h3 className="text-4xl font-extrabold mt-2 text-slate-800">
                 {activeLoops.reduce((total, loop) => total + (loop.cyclesCompleted || 0), 0)}
               </h3>
            </div>
          </div>

          {/* Active Loops List */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 Active Instances
                 <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs">{activeLoops.length}</span>
               </h3>
               {activeLoops.length > 0 && (
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
               )}
            </div>

            <div className="overflow-y-auto p-4 space-y-3 flex-1 custom-scrollbar">
              {activeLoops.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800">System Idle</h4>
                  <p className="text-slate-500 text-sm mt-1">No active loops running. Start a new instance.</p>
                </div>
              ) : (
                activeLoops.map((loop) => (
                  <div key={loop.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${loop.status === 'running' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                           </svg>
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                             ID: {loop.id.substring(0, 8)}
                             {loop.status === 'running' && (
                               <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                             )}
                           </h4>
                           <p className="text-xs text-slate-500 mt-0.5">{loop.userEmail}</p>
                         </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(loop.status)}`}>
                        {loop.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-400 font-bold">Started At</p>
                          <p className="text-sm font-medium text-slate-700">{new Date(loop.startTime).toLocaleTimeString()}</p>
                       </div>
                       <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] uppercase text-slate-400 font-bold">Cycles Completed</p>
                          <p className="text-sm font-medium text-slate-700">{loop.cyclesCompleted || 0}</p>
                       </div>
                    </div>

                    {loop.status === 'running' && (
                      <button
                        onClick={() => handleStopLoop(loop.id)}
                        className="w-full py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-bold hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        Terminate Loop
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopControls;