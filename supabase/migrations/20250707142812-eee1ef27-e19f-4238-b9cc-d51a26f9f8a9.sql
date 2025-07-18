
-- First, let's drop ALL existing verification officer policies to ensure clean slate
DROP POLICY IF EXISTS "Verification Officer 1 can view and update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can view and update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can view and update applications" ON public.certificate_applications;

-- Also drop any other conflicting policies that might exist
DROP POLICY IF EXISTS "Verification Officer 1 can view pending applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 1 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can view level 1 completed applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can view level 2 completed applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can update applications" ON public.certificate_applications;

-- Create new comprehensive policies with proper permissions
CREATE POLICY "Level 1 Verification Officer Access"
ON public.certificate_applications 
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'verification_officer_1') AND 
  status IN ('pending', 'verification_level_1')
)
WITH CHECK (
  public.has_role(auth.uid(), 'verification_officer_1') AND 
  status IN ('pending', 'verification_level_1', 'verification_level_2', 'additional_info_needed')
);

CREATE POLICY "Level 2 Verification Officer Access"
ON public.certificate_applications 
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'verification_officer_2') AND 
  status IN ('verification_level_1', 'verification_level_2')
)
WITH CHECK (
  public.has_role(auth.uid(), 'verification_officer_2') AND 
  status IN ('verification_level_1', 'verification_level_2', 'verification_level_3', 'additional_info_needed')
);

CREATE POLICY "Level 3 Verification Officer Access"
ON public.certificate_applications 
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'verification_officer_3') AND 
  status IN ('verification_level_2', 'verification_level_3')
)
WITH CHECK (
  public.has_role(auth.uid(), 'verification_officer_3') AND 
  status IN ('verification_level_2', 'verification_level_3', 'staff_review', 'additional_info_needed')
);
