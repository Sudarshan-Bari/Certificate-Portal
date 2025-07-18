
-- Update the user_role enum to include all required roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'clerk';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff_officer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sdo';

-- Add additional fields to certificate_applications for workflow tracking
ALTER TABLE public.certificate_applications 
ADD COLUMN IF NOT EXISTS clerk_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS clerk_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS staff_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS staff_reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS sdo_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sdo_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS workflow_stage TEXT DEFAULT 'submitted',
ADD COLUMN IF NOT EXISTS additional_info_requested TEXT;

-- Update the application status enum to include more workflow states
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'document_verification';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'staff_review';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'awaiting_sdo';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'additional_info_needed';

-- Update RLS policies for new roles
-- Clerks can view and update applications in document verification stage
CREATE POLICY "Clerks can view applications for verification"
ON public.certificate_applications FOR SELECT
USING (
  public.has_role(auth.uid(), 'clerk') AND 
  (status = 'pending' OR status = 'document_verification')
);

CREATE POLICY "Clerks can update applications during verification"
ON public.certificate_applications FOR UPDATE
USING (
  public.has_role(auth.uid(), 'clerk') AND 
  (status = 'pending' OR status = 'document_verification')
);

-- Staff officers can view and update applications in staff review stage
CREATE POLICY "Staff officers can view applications for review"
ON public.certificate_applications FOR SELECT
USING (
  public.has_role(auth.uid(), 'staff_officer') AND 
  (status = 'document_verification' OR status = 'staff_review')
);

CREATE POLICY "Staff officers can update applications during review"
ON public.certificate_applications FOR UPDATE
USING (
  public.has_role(auth.uid(), 'staff_officer') AND 
  (status = 'document_verification' OR status = 'staff_review')
);

-- SDOs can view all applications and have final approval authority
CREATE POLICY "SDOs can view all applications"
ON public.certificate_applications FOR SELECT
USING (public.has_role(auth.uid(), 'sdo'));

CREATE POLICY "SDOs can update any application"
ON public.certificate_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'sdo'));

-- Update the progress trigger to handle new workflow stages
CREATE OR REPLACE FUNCTION update_application_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE NEW.status
    WHEN 'pending' THEN
      NEW.current_stage := 'Submitted - Awaiting Document Verification';
      NEW.progress := 20;
      NEW.workflow_stage := 'submitted';
    WHEN 'document_verification' THEN
      NEW.current_stage := 'Document Verification in Progress';
      NEW.progress := 40;
      NEW.workflow_stage := 'clerk_verification';
    WHEN 'staff_review' THEN
      NEW.current_stage := 'Staff Officer Review';
      NEW.progress := 60;
      NEW.workflow_stage := 'staff_review';
    WHEN 'awaiting_sdo' THEN
      NEW.current_stage := 'Awaiting SDO Approval';
      NEW.progress := 80;
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

-- Create a table for role management by SDOs
CREATE TABLE IF NOT EXISTS public.role_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) NOT NULL,
  role user_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on role_assignments
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;

-- Only SDOs can manage role assignments
CREATE POLICY "SDOs can manage role assignments"
ON public.role_assignments FOR ALL
USING (public.has_role(auth.uid(), 'sdo'));
