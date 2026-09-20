import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Organization, CreateOrgFormData } from '../type/organization';

interface OrgContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  loading: boolean;
  setCurrentOrg: (org: Organization) => void;
  fetchOrganizations: () => Promise<void>;
  createOrganization: (formData: CreateOrgFormData) => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  // 1. Fetch Organizations using TanStack React Query
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('organizations')
        .select('*');

      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!user,
  });

  // Auto-select initial organization when list loads
  useEffect(() => {
    if (organizations.length > 0 && !currentOrg) {
      setCurrentOrg(organizations[0]);
    }
  }, [organizations, currentOrg]);

  // Refetch helper function for backwards compatibility
  const fetchOrganizations = async () => {
    await queryClient.invalidateQueries({ queryKey: ['organizations', user?.id] });
  };

  // 2. Create Organization Mutation
  const createMutation = useMutation({
    mutationFn: async (formData: CreateOrgFormData) => {
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
      };

      if (formData.type === 'school') {
        payload.school_district = formData.schoolDistrict;
      } else if (formData.type === 'nonprofit') {
        payload.tax_id = formData.taxId;
      } else if (formData.type === 'business') {
        payload.company_registration_number = formData.companyRegistrationNumber;
      }

      const { data, error } = await supabase
        .from('organizations')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as Organization;
    },
    onSuccess: (newOrg) => {
      // Invalidate cache so React Query re-fetches without full reload
      queryClient.invalidateQueries({ queryKey: ['organizations', user?.id] });
      setCurrentOrg(newOrg);
    },
  });

  const createOrganization = async (formData: CreateOrgFormData) => {
    try {
      await createMutation.mutateAsync(formData);
    } catch (err: any) {
      console.error('Error creating organization:', err.message);
      throw err;
    }
  };

  return (
    <OrgContext.Provider
      value={{
        organizations,
        currentOrg,
        loading: isLoading,
        setCurrentOrg,
        fetchOrganizations,
        createOrganization,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};