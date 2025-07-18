
-- Create enum for certificate types
CREATE TYPE certificate_type AS ENUM ('caste', 'income', 'domicile', 'residence');

-- Create enum for application status
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'officer');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create certificate_applications table
CREATE TABLE public.certificate_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id TEXT UNIQUE NOT NULL,
  certificate_type certificate_type NOT NULL,
  full_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  additional_info TEXT,
  status application_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  current_stage TEXT DEFAULT 'Initial Review',
  progress INTEGER DEFAULT 25,
  estimated_completion DATE,
  assigned_officer UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certificates table for issued certificates
CREATE TABLE public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.certificate_applications(id) ON DELETE CASCADE NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  certificate_type certificate_type NOT NULL,
  issued_to TEXT NOT NULL,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  digital_signature TEXT,
  certificate_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_documents table for file uploads
CREATE TABLE public.application_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.certificate_applications(id) ON DELETE CASCADE NOT NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  related_application_id UUID REFERENCES public.certificate_applications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for certificate_applications
CREATE POLICY "Users can view their own applications"
  ON public.certificate_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON public.certificate_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and officers can view all applications"
  ON public.certificate_applications FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

CREATE POLICY "Admins and officers can update applications"
  ON public.certificate_applications FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.certificate_applications 
      WHERE id = certificates.application_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and officers can manage certificates"
  ON public.certificates FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'officer')
  );

-- RLS Policies for application_documents
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

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Function to generate application ID
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  year_part TEXT;
  counter INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_id FROM 9) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.certificate_applications
  WHERE application_id LIKE 'CERT' || year_part || '%';
  
  new_id := 'CERT' || year_part || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update application progress
CREATE OR REPLACE FUNCTION update_application_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  CASE NEW.status
    WHEN 'pending' THEN
      NEW.current_stage := 'Initial Review';
      NEW.progress := 25;
    WHEN 'under_review' THEN
      NEW.current_stage := 'Document Verification';
      NEW.progress := 60;
      NEW.reviewed_at := NOW();
    WHEN 'approved' THEN
      NEW.current_stage := 'Certificate Issued';
      NEW.progress := 100;
      NEW.approved_at := NOW();
    WHEN 'rejected' THEN
      NEW.current_stage := 'Application Rejected';
      NEW.progress := 0;
      NEW.rejected_at := NOW();
  END CASE;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger to update progress on status change
CREATE TRIGGER application_progress_trigger
  BEFORE UPDATE ON public.certificate_applications
  FOR EACH ROW EXECUTE FUNCTION update_application_progress();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificate-documents', 'certificate-documents', false);

-- Storage policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'certificate-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificate-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'certificate-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'officer')
  )
);
