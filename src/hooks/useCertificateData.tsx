
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export const useCertificateData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching applications for user:', user.id);
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
      console.log('Applications fetched:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  const submitApplication = useMutation({
    mutationFn: async (applicationData: {
      certificate_type: 'caste' | 'income' | 'domicile' | 'residence';
      full_name: string;
      father_name: string;
      date_of_birth: string;
      address: string;
      phone_number: string;
      email: string;
      purpose: string;
      additional_info?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: applicationId } = await supabase.rpc('generate_application_id');
      
      const { data, error } = await supabase
        .from('certificate_applications')
        .insert([
          {
            ...applicationData,
            user_id: user.id,
            application_id: applicationId,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', user?.id] });
    },
  });

  return {
    applications,
    isLoading,
    submitApplication,
  };
};

// Helper function to generate certificate number
const generateCertificateNumber = (certificateType: string) => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100; // 3-digit random number
  return `CERT${year}${randomNum}`;
};

// Helper function to create digital signature
const createDigitalSignature = (certificateData: any) => {
  const dataString = JSON.stringify(certificateData);
  // Simple hash-like signature (in production, use proper cryptographic signing)
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `SIG${Math.abs(hash).toString(16).toUpperCase()}`;
};

export const useRoleBasedData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { sendNotification } = useNotifications();

  const { data: roleApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['roleApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching role-based applications for user:', user.id);
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching role applications:', error);
        throw error;
      }
      console.log('Role applications fetched:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  const updateApplicationStatus = useMutation({
    mutationFn: async ({
      applicationId,
      status,
      rejectionReason,
      additionalInfo,
    }: {
      applicationId: string;
      status: string;
      rejectionReason?: string;
      additionalInfo?: string;
    }) => {
      console.log('Updating application status:', { applicationId, status, rejectionReason, additionalInfo });
      
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
        updates.rejected_at = new Date().toISOString();
      }
      if (additionalInfo) {
        updates.additional_info = additionalInfo;
      }
      
      // Set timestamp fields based on status and user role
      if (status === 'document_verification') {
        updates.clerk_verified_at = new Date().toISOString();
      } else if (status === 'staff_review') {
        updates.staff_reviewed_at = new Date().toISOString();
      } else if (status === 'verification_level_1') {
        updates.verification_1_at = new Date().toISOString();
        updates.verification_1_by = user?.id;
      } else if (status === 'verification_level_2') {
        updates.verification_2_at = new Date().toISOString();
        updates.verification_2_by = user?.id;
      } else if (status === 'verification_level_3') {
        updates.verification_3_at = new Date().toISOString();
        updates.verification_3_by = user?.id;
      } else if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('certificate_applications')
        .update(updates)
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }
      
      console.log('Application updated successfully:', data);
      
      // If status is approved, create certificate record
      if (status === 'approved' && data) {
        console.log('Creating certificate for approved application:', data.application_id);
        
        const certificateNumber = generateCertificateNumber(data.certificate_type);
        const certificateData = {
          application_id: data.application_id,
          applicant_name: data.full_name,
          father_name: data.father_name,
          date_of_birth: data.date_of_birth,
          address: data.address,
          purpose: data.purpose,
          certificate_type: data.certificate_type
        };
        
        const digitalSignature = createDigitalSignature(certificateData);
        
        const { data: certificate, error: certError } = await supabase
          .from('certificates')
          .insert([
            {
              application_id: data.id,
              certificate_number: certificateNumber,
              certificate_type: data.certificate_type,
              issued_to: data.full_name,
              issued_date: new Date().toISOString(),
              valid_until: null, // Set based on certificate type if needed
              certificate_data: certificateData,
              digital_signature: digitalSignature
            }
          ])
          .select()
          .single();
        
        if (certError) {
          console.error('Error creating certificate:', certError);
          // Don't fail the main operation if certificate creation fails
        } else {
          console.log('Certificate created successfully:', certificate);
        }
      }
      
      // Send notification automatically
      if (data) {
        try {
          await sendNotification.mutateAsync({
            applicationId: data.application_id,
            status: data.status,
            userEmail: data.email,
            userName: data.full_name,
            certificateType: data.certificate_type
          });
          console.log('Notification sent successfully');
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
          // Don't fail the main operation if notification fails
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roleApplications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['user-certificates'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  return {
    roleApplications,
    applicationsLoading,
    updateApplicationStatus,
  };
};

export const useRoleManagement = () => {
  const queryClient = useQueryClient();

  // Fetch all users from profiles table
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Assign role mutation
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([
          { user_id: userId, role: role as any }
        ]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
    }
  });

  return {
    users,
    usersLoading,
    assignRole
  };
};
