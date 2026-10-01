import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, X, Radio } from 'lucide-react';
import api from '../../api/axios';
import { EmailLog } from '../../types';

export const SystemLogsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system/email-logs/');
      setLogs(res.data);
    } catch (e) {
      console.warn('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-[#2D5851] text-[#FDFDFE] hover:bg-[#3D766D] shadow-xl px-3.5 py-2.5 rounded-full text-xs font-semibold tracking-wide border border-[#3D766D] transition-transform active:scale-95 cursor-pointer"
        title="View Django SMTP console emails and signal dispatches"
      >
        <Mail className="w-4 h-4 text-[#EBF3F1] animate-pulse" />
        <span>Django Console SMTP &amp; Signals</span>
        {logs.length > 0 && (
          <span className="bg-[#3D766D] text-[#FDFDFE] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {logs.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[#1E252B]/40 backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FDFDFE] shadow-2xl flex flex-col border-l border-[#D6D9DF]">
              
              {/* Header */}
              <div className="p-4 border-b border-[#D6D9DF] flex items-center justify-between bg-[#F0F3F5]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#EBF3F1] text-[#3D766D] rounded-lg border border-[#D6D9DF]">
                    <Radio className="w-4 h-4 text-[#3D766D]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1E252B]">Django Console SMTP Backend</h3>
                    <p className="text-[11px] text-[#8F9192]">Live dispatched emails and signals</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchLogs}
                    className="p-1.5 text-[#8F9192] hover:text-[#1E252B] rounded-md hover:bg-[#EBF3F1] transition-colors"
                    title="Refresh Logs"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-[#8F9192] hover:text-[#1E252B] rounded-md hover:bg-[#EBF3F1] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logs Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-[#8F9192] text-xs">
                    No emails logged yet. Perform an action like registering, registering for an event, or completing a task!
                  </div>
                ) : (
                  logs.map(log => (
                    <div
                      key={log.id}
                      className="border border-[#D6D9DF] rounded-xl p-3 bg-[#F0F3F5] space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[#8F9192] text-[10px]">
                        <span className="font-semibold text-[#3D766D]">EMAIL SENT</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[#1E252B] font-bold truncate">
                        {log.subject}
                      </div>
                      <div className="text-[#8F9192] text-[11px]">
                        To: <span className="text-[#3D766D] font-semibold">{log.to}</span>
                      </div>
                      <div className="bg-[#FDFDFE] border border-[#D6D9DF] p-2 rounded text-[11px] whitespace-pre-wrap text-[#1E252B]">
                        {log.body}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer info */}
              <div className="p-3 border-t border-[#D6D9DF] bg-[#F0F3F5] text-[11px] text-[#8F9192] text-center">
                Matches Django <code className="text-[#3D766D] font-mono">EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'</code>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
