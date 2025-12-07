import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { automationAPI } from '../../services/api';

const LogViewer = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await automationAPI.getLogs(pagination.page, pagination.limit);
      setLogs(response.logs || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'running': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'failed': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'stopped': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="animate-fade-in-up h-[calc(100vh-8rem)] flex flex-col mb-[90px]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Logs</h2>
          <p className="text-slate-500 mt-1">Detailed execution history and diagnostics</p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
           <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
           </svg>
          {loading ? 'Syncing...' : 'Refresh Logs'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Panel: List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Execution History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {logs.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                   <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                   </svg>
                </div>
                <p className="text-slate-500 text-sm">No logs found</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log._id}
                  onClick={() => setSelectedLog(log)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                    selectedLog?._id === log._id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm ${selectedLog?._id === log._id ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {log.automationType}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                     <span>{formatDate(log.createdAt)}</span>
                     <span className="font-medium bg-white px-1.5 py-0.5 rounded border border-slate-100">{log.totalCycles} cycles</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {pagination.pages > 1 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs font-medium text-slate-500">
                Page {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Details */}
        <div className="lg:col-span-2">
          {selectedLog ? (
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden h-full flex flex-col animate-fade-in">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                <div>
                   <h3 className="font-bold text-slate-800 text-lg">Execution Details</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ID: {selectedLog._id}</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">User</p>
                   <p className="text-sm font-medium text-slate-700">{selectedLog.userEmail}</p>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Cycles</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{selectedLog.totalCycles}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Duration</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {selectedLog.createdAt && selectedLog.completedAt
                        ? `${Math.round((new Date(selectedLog.completedAt) - new Date(selectedLog.createdAt)) / 1000)}s`
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   Cycle Breakdown
                </h4>
                
                <div className="space-y-3">
                  {selectedLog.cycles?.map((cycle, index) => (
                    <div key={index} className="group border border-slate-100 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-indigo-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm text-slate-700">Cycle {cycle.cycleNumber}</span>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                           cycle.status === 'completed' 
                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                           : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {cycle.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {cycle.steps?.length || 0} steps executed
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                 <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Log Selected</h3>
              <p className="text-slate-500 max-w-xs mt-2">Select a log entry from the left panel to view full execution details and step-by-step breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogViewer;