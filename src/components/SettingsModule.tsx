import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOrg } from '../context/OrgContext';

export const SettingsModule: React.FC = () => {
  const { currentOrg, fetchOrganizations } = useOrg();
  const [name, setName] = useState(currentOrg?.name || '');
  const [slug, setSlug] = useState(currentOrg?.slug || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!currentOrg) {
    return (
      <div className="text-center py-12 text-slate-400 font-mono text-sm">
        Please select an organization to view settings.
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
        })
        .eq('id', currentOrg.id);

      if (error) throw error;

      alert('Organization settings updated successfully!');
      await fetchOrganizations();
    } catch (err: any) {
      alert(err.message || 'Failed to update organization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmName = prompt(
      `Type "${currentOrg.name}" to confirm workspace deletion:`
    );

    if (confirmName !== currentOrg.name) {
      alert('Workspace name did not match. Deletion cancelled.');
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', currentOrg.id);

      if (error) throw error;

      alert('Workspace deleted successfully.');
      await fetchOrganizations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Update Workspace Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-base font-semibold text-slate-100 mb-1">
          General Settings
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Update your workspace profile and identifier.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Workspace Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-900 border border-red-500/20 p-6 rounded-2xl">
        <h3 className="text-base font-semibold text-red-400 mb-1">
          Danger Zone
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Deleting a workspace will remove all member associations and invitations permanently.
        </p>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium rounded-lg transition disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : 'Delete Workspace'}
        </button>
      </div>
    </div>
  );
};