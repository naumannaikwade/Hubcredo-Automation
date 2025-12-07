import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './Layout/Navbar';
import Sidebar from './Layout/Sidebar';
import AutomationPanel from './Dashboard/AutomationPanel';
import AnalyticsPanel from './Dashboard/AnalyticsPanel';
import LoopControls from './Dashboard/LoopControls';
import LogViewer from './Dashboard/LogViewer';
import { analyticsAPI } from '../services/api';

const Dashboard = ({ setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState('automation');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAutomations: 0,
    successfulCycles: 0,
    failedCycles: 0,
    recentAutomations: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await analyticsAPI.getStats();
      setStats(statsData.stats);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'automation':
        return <AutomationPanel user={user} />;
      case 'analytics':
        return <AnalyticsPanel stats={stats} />;
      case 'loops':
        return <LoopControls user={user} />;
      case 'logs':
        return <LogViewer user={user} />;
      default:
        return <AutomationPanel user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar user={user} setIsAuthenticated={setIsAuthenticated} />
      <div className="flex max-w-[1920px] mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 md:p-10 transition-all duration-300 md:ml-64 mt-20">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;