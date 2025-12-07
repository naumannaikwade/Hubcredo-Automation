import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { automationAPI } from '../../services/api';

const AutomationPanel = ({ user }) => {
  const [cycles, setCycles] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleStartAutomation = async () => {
    if (cycles < 1 || cycles > 20) {
      toast.error('Cycles must be between 1 and 20');
      return;
    }

    setLoading(true);
    try {
      const result = await automationAPI.startLoop(cycles);
      toast.success(`Automation started with ${cycles} cycles!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start automation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up mb-[90px]">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Control Panel</h2>
        <p className="text-slate-500 mt-1">Configure and launch your automation workflows</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 opacity-90"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Configuration</h3>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100">
                  Ready
                </span>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Cycle Count
                    </label>
                    <span className="text-4xl font-extrabold text-indigo-600 leading-none">
                      {cycles}
                    </span>
                  </div>
                  
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={cycles}
                      onChange={(e) => setCycles(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-medium mt-2">
                      <span>1 Cycle</span>
                      <span>5 Cycles</span>
                      <span>10 Cycles</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Workflow:</span> Webhook trigger ➝ Email Simulation ➝ Confirmation
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                   <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Presets</h4>
                   <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setCycles(num)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                          cycles === num 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        {num} {num === 1 ? 'Cycle' : 'Cycles'}
                      </button>
                    ))}
                   </div>
                </div>

                <button
                  onClick={handleStartAutomation}
                  disabled={loading}
                  className="w-full group relative flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                   <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Initializing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-base">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Launch Automation
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Steps */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Workflow Steps</h3>
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-50 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">01</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-700 text-sm">Webhook Trigger</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">System initiates call to the entry endpoint.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-purple-50 text-purple-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">02</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-700 text-sm">Email Process</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Simulates sending data via SMTP service.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-50 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-xs font-bold">03</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-700 text-sm">Completion</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Final webhook confirms successful cycle.</p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 flex gap-4">
             <div className="shrink-0 mt-1">
               <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             </div>
             <div>
               <h4 className="text-sm font-bold text-amber-800">System Notice</h4>
               <ul className="mt-2 text-xs text-amber-700/80 space-y-1 list-disc list-inside">
                 <li>Approx. 5-10s execution per cycle</li>
                 <li>Email delivery is simulated in Dev mode</li>
                 <li>Ensure local webhooks are reachable</li>
               </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;