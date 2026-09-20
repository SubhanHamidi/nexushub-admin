import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { useOrg } from '../context/OrgContext';

// Invite Form Zod Validation Schema
const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface MemberRecord {
  id: string;
  email?: string;
  role: string;
  status?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
}

export const MembersModule: React.FC = () => {
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();

  // Form Setup with React Hook Form + Zod
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  // 1. Fetch Organization Members using React Query
  const { data: members = [], isLoading, isError, error } = useQuery<MemberRecord[]>({
    queryKey: ['members', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      const { data, error } = await supabase
        .from('organization_members')
        .select('*, profiles(full_name, email)')
        .eq('organization_id', currentOrg.id);

      if (error) throw error;
      return (data || []) as MemberRecord[];
    },
    enabled: !!currentOrg?.id,
  });

  // 2. Invite Member Mutation via Supabase Edge Function
  const inviteMutation = useMutation({
    mutationFn: async (formData: InviteFormData) => {
      if (!currentOrg?.id) throw new Error('No active organization selected');

      // Invoking Supabase Edge Function: 'invite-member'
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: {
          email: formData.email,
          role: formData.role,
          organizationId: currentOrg.id,
        },
      });

      if (error) throw new Error(error.message || 'Failed to send member invitation');
      return data;
    },
    onSuccess: () => {
      alert('Member invitation sent successfully!');
      reset();
      queryClient.invalidateQueries({ queryKey: ['members', currentOrg?.id] });
    },
    onError: (err: Error) => {
      alert(err.message || 'An error occurred while inviting the member');
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    await inviteMutation.mutateAsync(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Team Members</h2>
          <p className="text-xs text-slate-400">
            Manage team members and send invites for <span className="text-indigo-400 font-medium">{currentOrg?.name || 'Workspace'}</span>
          </p>
        </div>
      </div>

      {/* Invite Form with Zod Validation */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <input
              type="email"
              placeholder="colleague@company.com"
              {...register('email')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white text-sm rounded-lg focus:outline-none focus:border-indigo-500 transition"
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="w-full sm:w-auto">
            <select
              {...register('role')}
              className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 text-white text-sm rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || inviteMutation.isPending}
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting || inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Members List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading workspace members...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-400 text-sm">
            {(error as Error)?.message || 'Failed to load members list'}
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No members found. Send your first invite above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Member / Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 text-white font-medium">
                      {m.profiles?.email || m.email || 'Invited User'}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-400">{m.role}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {m.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};