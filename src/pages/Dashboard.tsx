import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { MembersModule } from '../components/MembersModule';
import { SettingsModule } from '../components/SettingsModule';
import { ActivityLogsModule } from '../components/ActivityLogsModule';
import { UserProfileModule } from '../components/UserProfileModule';
import { useOrg } from '../context/OrgContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  const { currentOrg } = useOrg();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'settings' | 'activity' | 'profile'>('dashboard');
  
  const [memberCount, setMemberCount] = useState<number | string>('...');
  const [userRole, setUserRole] = useState<string>('...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrgMetrics = async () => {
      if (!currentOrg || !user) return;

      try {
        setLoading(true);

        const { data: members, error: membersError } = await supabase.rpc(
          'get_organization_members',
          { target_org_id: currentOrg.id }
        );

        if (membersError) throw membersError;
        setMemberCount(members?.length || 0);

        const { data: currentMember, error: roleError } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', currentOrg.id)
          .eq('user_id', user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Role fetch error:', roleError.message);
        }

        setUserRole(currentMember?.role ? currentMember.role.toUpperCase() : 'MEMBER');
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err.message);
        setMemberCount('N/A');
        setUserRole('N/A');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgMetrics();
  }, [currentOrg, user]);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as any)}>
      {!currentOrg && activeTab !== 'profile' ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] border border-dashed border-slate-800 rounded-2xl p-8 text-center bg-slate-900/30">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold mb-4">
            N
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">No Organization Selected</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Create or select an organization from the sidebar dropdown to start managing members and settings.
          </p>
        </div>
      ) : activeTab === 'dashboard' ? (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <h2 className="text-xl font-bold text-indigo-400">{currentOrg?.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Workspace Slug: <span className="text-slate-200 font-mono">@{currentOrg?.slug}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
              Active Workspace
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Members</p>
              <h3 className="text-3xl font-bold text-white mt-2 font-mono">
                {loading ? '...' : memberCount}
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Role</p>
              <h3 className={`text-3xl font-bold mt-2 ${
                userRole === 'OWNER' ? 'text-emerald-400' : userRole === 'ADMIN' ? 'text-indigo-400' : 'text-slate-200'
              }`}>
                {loading ? '...' : userRole}
              </h3>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tenant Isolation</p>
              <h3 className="text-3xl font-bold text-indigo-400 mt-2">RLS Active</h3>
            </div>
          </div>
        </div>
      ) : activeTab === 'members' ? (
        <MembersModule />
      ) : activeTab === 'settings' ? (
        <SettingsModule />
      ) : activeTab === 'activity' ? (
        <ActivityLogsModule />
      ) : (
        <UserProfileModule />
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;