import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrgSchema, type CreateOrgFormData } from '../type/organization';
import { useOrg } from '../context/OrgContext';

interface CreateOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrgModal: React.FC<CreateOrgModalProps> = ({ isOpen, onClose }) => {
  const { createOrganization } = useOrg();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      type: 'business',
      name: '',
      slug: '',
      companyRegistrationNumber: '',
    },
  });

  const selectedType = watch('type');

  if (!isOpen) return null;

  const onSubmit = async (data: CreateOrgFormData) => {
    try {
      await createOrganization(data);
      reset();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create organization');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-white mb-1">Create New Organization</h2>
        <p className="text-xs text-slate-400 mb-6">Select organization type and set up your workspace.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Organization Type Select */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Organization Type</label>
            <select
              {...register('type')}
              onChange={(e) => {
                const newType = e.target.value as 'school' | 'nonprofit' | 'business';
                setValue('type', newType);
              }}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="business">Business</option>
              <option value="school">School</option>
              <option value="nonprofit">Nonprofit</option>
            </select>
          </div>

          {/* Org Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Organization Name</label>
            <input
              type="text"
              {...register('name')}
              onChange={(e) => {
                const val = e.target.value;
                setValue('name', val);
                setValue('slug', val.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              }}
              placeholder="e.g. Acme Corp / Stanford High"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
            {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>}
          </div>

          {/* Org Slug */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Slug Identifier</label>
            <input
              type="text"
              {...register('slug')}
              placeholder="acme-corp"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
            {errors.slug && <p className="text-[11px] text-red-400 mt-1">{errors.slug.message}</p>}
          </div>

          {/* CONDITIONAL FIELD 1: School District */}
          {selectedType === 'school' && (
            <div>
              <label className="block text-xs font-medium text-indigo-400 mb-1">School District</label>
              <input
                type="text"
                {...register('schoolDistrict')}
                placeholder="District 9, North Region"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-indigo-500/50 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
              {'schoolDistrict' in errors && errors.schoolDistrict && (
                <p className="text-[11px] text-red-400 mt-1">{(errors as any).schoolDistrict.message}</p>
              )}
            </div>
          )}

          {/* CONDITIONAL FIELD 2: Tax ID (EIN) */}
          {selectedType === 'nonprofit' && (
            <div>
              <label className="block text-xs font-medium text-indigo-400 mb-1">Tax ID / EIN Number</label>
              <input
                type="text"
                {...register('taxId')}
                placeholder="XX-XXXXXXX"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-indigo-500/50 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
              {'taxId' in errors && errors.taxId && (
                <p className="text-[11px] text-red-400 mt-1">{(errors as any).taxId.message}</p>
              )}
            </div>
          )}

          {/* CONDITIONAL FIELD 3: Business Registration Number */}
          {selectedType === 'business' && (
            <div>
              <label className="block text-xs font-medium text-indigo-400 mb-1">Company Registration Number</label>
              <input
                type="text"
                {...register('companyRegistrationNumber')}
                placeholder="REG-89210"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-indigo-500/50 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              />
              {'companyRegistrationNumber' in errors && errors.companyRegistrationNumber && (
                <p className="text-[11px] text-red-400 mt-1">{(errors as any).companyRegistrationNumber.message}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};