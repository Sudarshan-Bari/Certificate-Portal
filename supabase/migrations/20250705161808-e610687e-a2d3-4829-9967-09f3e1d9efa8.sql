
-- Add new verification officer roles to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'verification_officer_1';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'verification_officer_2';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'verification_officer_3';

-- Add new application status values for the verification hierarchy
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'verification_level_1';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'verification_level_2';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'verification_level_3';

-- Add new columns to track verification at each level
ALTER TABLE public.certificate_applications 
ADD COLUMN IF NOT EXISTS verification_1_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_1_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_2_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_2_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_3_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_3_by UUID REFERENCES auth.users(id);

-- Update RLS policies for verification officers
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

-- Update the progress trigger to handle new verification stages
CREATE OR REPLACE FUNCTION update_application_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE NEW.status
    WHEN 'pending' THEN
      NEW.current_stage := 'Submitted - Awaiting Level 1 Verification';
      NEW.progress := 15;
      NEW.workflow_stage := 'submitted';
    WHEN 'verification_level_1' THEN
      NEW.current_stage := 'Level 1 Verification in Progress';
      NEW.progress := 30;
      NEW.workflow_stage := 'verification_1';
    WHEN 'verification_level_2' THEN
      NEW.current_stage := 'Level 2 Verification in Progress';
      NEW.progress := 50;
      NEW.workflow_stage := 'verification_2';
    WHEN 'verification_level_3' THEN
      NEW.current_stage := 'Level 3 Verification in Progress';
      NEW.progress := 70;
      NEW.workflow_stage := 'verification_3';
    WHEN 'staff_review' THEN
      NEW.current_stage := 'Staff Officer Review';
      NEW.progress := 85;
      NEW.workflow_stage := 'staff_review';
    WHEN 'awaiting_sdo' THEN
      NEW.current_stage := 'Awaiting SDO Approval';
      NEW.progress := 95;
      NEW.workflow_stage := 'sdo_approval';
    WHEN 'approved' THEN
      NEW.current_stage := 'Certificate Issued';
      NEW.progress := 100;
      NEW.workflow_stage := 'completed';
      NEW.approved_at := NOW();
    WHEN 'rejected' THEN
      NEW.current_stage := 'Application Rejected';
      NEW.progress := 0;
      NEW.workflow_stage := 'rejected';
      NEW.rejected_at := NOW();
    WHEN 'additional_info_needed' THEN
      NEW.current_stage := 'Additional Information Required';
      NEW.progress := NEW.progress; -- Keep current progress
      NEW.workflow_stage := 'info_needed';
  END CASE;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;
