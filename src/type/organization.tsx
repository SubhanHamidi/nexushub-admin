import { z } from 'zod';

export const ORG_TYPES = ['school', 'nonprofit', 'business'] as const;
export type OrgType = (typeof ORG_TYPES)[number];

// Main Organization Model
export interface Organization {
  id: string;
  name: string;
  slug: string;
  type?: OrgType;
  school_district?: string | null;
  tax_id?: string | null;
  company_registration_number?: string | null;
  created_by?: string;
  created_at?: string;
}

// Zod Schema for Organization Creation Form Validation
export const createOrgSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('school'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    schoolDistrict: z.string().min(2, 'School District name is required'),
  }),
  z.object({
    type: z.literal('nonprofit'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    taxId: z.string().min(5, 'Tax ID / EIN is required (min 5 chars)'),
  }),
  z.object({
    type: z.literal('business'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    companyRegistrationNumber: z.string().min(4, 'Registration number is required'),
  }),
]);

export type CreateOrgFormData = z.infer<typeof createOrgSchema>;