import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info } from 'lucide-react';
import api from '../services/api';

const NoticeMarquee = () => {
  const [scrollingNotices, setScrollingNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScrollingNotices = async () => {
      try {
        const res = await api.get('/notifications');
        // Filter notices that are marked for scrolling
        const notices = (res.data.notifications || []).filter(n => n.isScrolling);
        setScrollingNotices(notices);
      } catch (error) {
        console.error('Failed to fetch scrolling notices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScrollingNotices();
    // Refresh every 5 minutes
    const interval = setInterval(fetchScrollingNotices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || scrollingNotices.length === 0) return null;

  return (
    <div className="bg-slate-900 dark:bg-black text-white py-2 overflow-hidden border-b border-slate-800 relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        <div className="flex items-center space-x-2 mr-6 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 whitespace-nowrap">
          <Bell className="w-4 h-4 text-yellow-400 animate-swing" />
          <span className="text-xs font-bold uppercase tracking-wider">Latest Notices:</span>
        </div>
        
        <div className="relative flex-1 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee hover:pause cursor-default">
            {scrollingNotices.map((notice, index) => (
              <span key={notice._id || index} className="mx-8 flex items-center space-x-2 text-sm font-medium">
                {notice.priority === 'high' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-slate-300">[{new Date(notice.createdAt).toLocaleDateString()}]</span>
                <span className="hover:text-blue-400 transition-colors">{notice.message}</span>
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {scrollingNotices.map((notice, index) => (
              <span key={`dup-${notice._id || index}`} className="mx-8 flex items-center space-x-2 text-sm font-medium">
                {notice.priority === 'high' ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Info className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-slate-300">[{new Date(notice.createdAt).toLocaleDateString()}]</span>
                <span>{notice.message}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes swing {
          0% { transform: rotate(0); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0); }
        }
        .animate-swing {
          animation: swing 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NoticeMarquee;
