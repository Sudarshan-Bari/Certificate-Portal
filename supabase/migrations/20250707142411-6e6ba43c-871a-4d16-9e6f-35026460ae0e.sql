
-- Drop the existing verification officer policies to recreate them properly
DROP POLICY IF EXISTS "Verification Officer 1 can view pending applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 1 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can view level 1 completed applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 2 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can view level 2 completed applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification Officer 3 can update applications" ON public.certificate_applications;
DROP POLICY IF EXISTS "Verification officers can manage their level applications" ON public.certificate_applications;

-- Create comprehensive verification officer policies that allow proper status transitions
CREATE POLICY "Verification Officer 1 can view and update applications"
ON public.certificate_applications 
FOR ALL
USING (
  public.has_role(auth.uid(), 'verification_officer_1') AND 
  status IN ('pending', 'verification_level_1')
)
WITH CHECK (
  public.has_role(auth.uid(), 'verification_officer_1') AND 
  status IN ('pending', 'verification_level_1', 'verification_level_2', 'additional_info_needed')
);

CREATE POLICY "Verification Officer 2 can view and update applications"
ON public.certificate_applications 
FOR ALL
USING (
  public.has_role(auth.uid(), 'verification_officer_2') AND 
  status IN ('verification_level_1', 'verification_level_2')
)
WITH CHECK (
  public.has_role(auth.uid(), 'verification_officer_2') AND 
  status IN ('verification_level_1', 'verification_level_2', 'verification_level_3', 'additional_info_needed')
);

CREATE POLICY "Verification Officer 3 can view and update applications"
ON public.certificate_applications 
FOR ALL
USING (
  public.has_role(auth.uid(), 'verification_officer_3') AND 
  status IN ('verification_level_2', 'verification_level_3')
)
WITH CHECK (
  public.has_role(auth.uid(), 'verification_officer_3') AND 
  status IN ('verification_level_2', 'verification_level_3', 'staff_review', 'additional_info_needed')
);
