
-- Add missing verification tracking columns to certificate_applications table
ALTER TABLE public.certificate_applications 
ADD COLUMN IF NOT EXISTS verification_1_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_1_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_2_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_2_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_3_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_3_by UUID REFERENCES auth.users(id);

-- Update the progress trigger function to handle the new verification stages
CREATE OR REPLACE FUNCTION public.update_application_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE NEW.status
    WHEN 'pending' THEN
      NEW.current_stage := 'Submitted - Awaiting Level 1 Verification';
      NEW.progress := 15;
    WHEN 'document_verification' THEN
      NEW.current_stage := 'Document Verification';
      NEW.progress := 25;
    WHEN 'verification_level_1' THEN
      NEW.current_stage := 'Level 1 Verification in Progress';
      NEW.progress := 30;
    WHEN 'verification_level_2' THEN
      NEW.current_stage := 'Level 2 Verification in Progress';
      NEW.progress := 50;
    WHEN 'verification_level_3' THEN
      NEW.current_stage := 'Level 3 Verification in Progress';
      NEW.progress := 70;
    WHEN 'staff_review' THEN
      NEW.current_stage := 'Staff Officer Review';
      NEW.progress := 85;
    WHEN 'awaiting_sdo' THEN
      NEW.current_stage := 'Awaiting SDO Approval';
      NEW.progress := 95;
    WHEN 'approved' THEN
      NEW.current_stage := 'Certificate Issued';
      NEW.progress := 100;
      NEW.approved_at := NOW();
    WHEN 'rejected' THEN
      NEW.current_stage := 'Application Rejected';
      NEW.progress := 0;
      NEW.rejected_at := NOW();
    WHEN 'additional_info_needed' THEN
      NEW.current_stage := 'Additional Information Required';
      NEW.progress := NEW.progress; -- Keep current progress
  END CASE;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;
