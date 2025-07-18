
-- First, let's fix the storage policies to allow proper document uploads
-- Drop existing restrictive storage policies
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

-- Create more permissive storage policies that work with the application structure
CREATE POLICY "Users can upload documents to certificate-documents bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificate-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view documents in certificate-documents bucket"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificate-documents' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Officers and staff can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificate-documents' AND
  (
    public.has_role(auth.uid(), 'verification_officer_1') OR
    public.has_role(auth.uid(), 'verification_officer_2') OR
    public.has_role(auth.uid(), 'verification_officer_3') OR
    public.has_role(auth.uid(), 'staff_officer') OR
    public.has_role(auth.uid(), 'sdo') OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'clerk')
  )
);

-- Fix application_documents table policies to allow officers to view documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.application_documents;
DROP POLICY IF EXISTS "Users can upload documents for their applications" ON public.application_documents;

-- Create new policies for application_documents
CREATE POLICY "Users can view their own documents"
ON public.application_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.certificate_applications 
    WHERE id = application_documents.application_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents for their applications"
ON public.application_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.certificate_applications 
    WHERE id = application_documents.application_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Officers can view all documents"
ON public.application_documents FOR SELECT
USING (
  public.has_role(auth.uid(), 'verification_officer_1') OR
  public.has_role(auth.uid(), 'verification_officer_2') OR
  public.has_role(auth.uid(), 'verification_officer_3') OR
  public.has_role(auth.uid(), 'staff_officer') OR
  public.has_role(auth.uid(), 'sdo') OR
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'clerk')
);

-- Ensure the certificate-documents bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificate-documents', 'certificate-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;
