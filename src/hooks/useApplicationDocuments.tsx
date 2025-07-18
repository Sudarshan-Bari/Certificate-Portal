
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useApplicationDocuments = (applicationId: string) => {
  return useQuery({
    queryKey: ['applicationDocuments', applicationId],
    queryFn: async () => {
      console.log('Fetching documents for application:', applicationId);
      
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('Documents fetched:', data);
      return data || [];
    },
    enabled: !!applicationId,
  });
};

export const useDocumentUrl = (filePath: string) => {
  return useQuery({
    queryKey: ['documentUrl', filePath],
    queryFn: async () => {
      if (!filePath) return null;
      
      const { data } = supabase.storage
        .from('certificate-documents')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    },
    enabled: !!filePath,
  });
};
