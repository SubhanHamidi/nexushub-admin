import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrg } from '../context/OrgContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab = 'dashboard',
  setActiveTab = () => {},
}) => {
  const { user, signOut } = useAuth();
  const { organizations, currentOrg, setCurrentOrg, createOrganization } = useOrg();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

 const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Pass single object matching CreateOrgFormData format
      await createOrganization({
        type: 'business',
        name: orgName,
        slug: orgSlug,
        companyRegistrationNumber: 'DEFAULT-123',
      });
      setOrgName('');
      setOrgSlug('');
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create organization');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-4">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
              N
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">NexusHub</span>
          </div>

          {/* Org Switcher Dropdown */}
          <div className="relative mb-6">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
              Organization
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="truncate text-left">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {currentOrg ? currentOrg.name : 'Select Organization'}
                </p>
                {currentOrg && (
                  <p className="text-[11px] text-slate-500 truncate">@{currentOrg.slug}</p>
                )}
              </div>
              <span className="text-xs text-slate-400">▼</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-30 py-1 max-h-48 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setCurrentOrg(org);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center hover:bg-slate-800 transition ${
                      currentOrg?.id === org.id ? 'bg-indigo-600/10 text-indigo-400 font-medium' : 'text-slate-300'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {currentOrg?.id === org.id && <span>✓</span>}
                  </button>
                ))}
                
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-400 hover:bg-slate-800 font-medium flex items-center gap-1"
                  >
                    <span>+</span> Create Organization
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>📊</span> Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'members' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>👥</span> Members
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'settings' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>⚙️</span> Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'activity' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>📜</span> Activity Logs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === 'profile' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>👤</span> Profile
            </button>
          </nav>
        </div>

        {/* User Profile / Sign Out */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between px-2">
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-500">Admin</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-red-400 hover:text-red-300 transition font-medium"
          >
            Exit
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            {currentOrg ? `${currentOrg.name} / ${activeTab}` : 'Overview'}
          </h1>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Modal: Create Organization */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">Create New Organization</h2>
            <p className="text-xs text-slate-400 mb-6">Set up a workspace for your team.</p>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => {
                    setOrgName(e.target.value);
                    setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Slug URL</label>
                <input
                  type="text"
                  required
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder="acme-corp"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};