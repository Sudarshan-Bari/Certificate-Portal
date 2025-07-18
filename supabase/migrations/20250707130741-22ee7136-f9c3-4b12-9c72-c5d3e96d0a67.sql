
-- Add new application statuses to the enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'document_verification';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'verification_level_1';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'verification_level_2';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'verification_level_3';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'staff_review';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'awaiting_sdo';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'additional_info_needed';

-- Add missing columns to certificate_applications table
ALTER TABLE certificate_applications 
ADD COLUMN IF NOT EXISTS clerk_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS staff_reviewed_at timestamp with time zone;
