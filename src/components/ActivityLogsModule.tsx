import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOrg } from '../context/OrgContext';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

export const ActivityLogsModule: React.FC = () => {
  const { currentOrg } = useOrg();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentOrg) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, action, details, created_at')
          .eq('organization_id', currentOrg.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLogs(data || []);
      } catch (err: any) {
        console.error('Failed to load audit logs:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [currentOrg]);

  if (loading) {
    return <div className="text-sm text-slate-400 font-mono">Loading activity logs...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-base font-semibold text-slate-100 mb-1">
          Workspace Activity Logs
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Audit trail of actions taken inside {currentOrg?.name}.
        </p>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono border border-dashed border-slate-800 rounded-xl">
            No activities recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-indigo-400">{log.action}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};