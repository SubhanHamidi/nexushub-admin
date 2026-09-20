-- 1. Create Enum for Organization Types
CREATE TYPE org_type AS ENUM ('school', 'nonprofit', 'business');

-- 2. Create Organizations Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type org_type NOT NULL,
    school_district TEXT,
    tax_id TEXT,
    company_registration_number TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Organization Members & Invitations Table
CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'invited',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, email)
);

-- 4. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Organizations (Admins only see/manage their own orgs)
CREATE POLICY "Admins can manage their own organizations" 
ON public.organizations FOR ALL 
USING (auth.uid() = created_by);

-- 6. RLS Policies for Organization Members (Org Admins can manage their members)
CREATE POLICY "Org admins can manage members" 
ON public.organization_members FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.organizations 
        WHERE organizations.id = organization_members.organization_id 
        AND organizations.created_by = auth.uid()
    )
);