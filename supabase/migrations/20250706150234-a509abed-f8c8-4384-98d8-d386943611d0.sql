
-- First, let's check if the verification officer roles exist and add them if they don't
DO $$
BEGIN
    -- Add verification officer roles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'verification_officer_1') THEN
        ALTER TYPE user_role ADD VALUE 'verification_officer_1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'verification_officer_2') THEN
        ALTER TYPE user_role ADD VALUE 'verification_officer_2';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'verification_officer_3') THEN
        ALTER TYPE user_role ADD VALUE 'verification_officer_3';
    END IF;
END
$$;

-- Add verification status values if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'application_status' AND e.enumlabel = 'verification_level_1') THEN
        ALTER TYPE application_status ADD VALUE 'verification_level_1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'application_status' AND e.enumlabel = 'verification_level_2') THEN
        ALTER TYPE application_status ADD VALUE 'verification_level_2';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'application_status' AND e.enumlabel = 'verification_level_3') THEN
        ALTER TYPE application_status ADD VALUE 'verification_level_3';
    END IF;
END
$$;

-- Add verification tracking columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificate_applications' AND column_name = 'verification_1_at') THEN
        ALTER TABLE public.certificate_applications ADD COLUMN verification_1_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificate_applications' AND column_name = 'verification_1_by') THEN
        ALTER TABLE public.certificate_applications ADD COLUMN verification_1_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificate_applications' AND column_name = 'verification_2_at') THEN
        ALTER TABLE public.certificate_applications ADD COLUMN verification_2_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificate_applications' AND column_name = 'verification_2_by') THEN
        ALTER TABLE public.certificate_applications ADD COLUMN verification_2_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificate_applications' AND column_name = 'verification_3_at') THEN
        ALTER TABLE public.certificate_applications ADD COLUMN verification_3_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificate_applications' AND column_name = 'verification_3_by') THEN
        ALTER TABLE public.certificate_applications ADD COLUMN verification_3_by UUID REFERENCES auth.users(id);
    END IF;
END
$$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Verification Officer 1 can view pending applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 1 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can view level 1 completed applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can view level 2 completed applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can update applications" ON public.certificate_applications;

-- Create RLS policies for verification officers
CREATE POLICY "Verification Officer 1 can view pending applications"
ON public.certificate_applications FOR SELECT
USING (
  public.has_role(auth.uid(), 'verification_officer_1') AND 
  status IN ('pending', 'verification_level_1')
);

CREATE POLICY "Verification Officer 1 can update applications"
ON public.certificate_applications FOR UPDATE
USING (
  public.has_role(auth.uid(), 'verification_officer_1') AND 
  status IN ('pending', 'verification_level_1')
);

CREATE POLICY "Verification Officer 2 can view level 1 completed applications"
ON public.certificate_applications FOR SELECT
USING (
  public.has_role(auth.uid(), 'verification_officer_2') AND 
  status IN ('verification_level_1', 'verification_level_2')
);

CREATE POLICY "Verification Officer 2 can update applications"
ON public.certificate_applications FOR UPDATE
USING (
  public.has_role(auth.uid(), 'verification_officer_2') AND 
  status IN ('verification_level_1', 'verification_level_2')
);

CREATE POLICY "Verification Officer 3 can view level 2 completed applications"
ON public.certificate_applications FOR SELECT
USING (
  public.has_role(auth.uid(), 'verification_officer_3') AND 
  status IN ('verification_level_2', 'verification_level_3')
);

CREATE POLICY "Verification Officer 3 can update applications"
ON public.certificate_applications FOR UPDATE
USING (
  public.has_role(auth.uid(), 'verification_officer_3') AND 
  status IN ('verification_level_2', 'verification_level_3')
);
