
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentUpload {
  file: File;
  documentType: string;
  documentName: string;
}

export const useDocumentUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadDocument = async (applicationId: string, document: DocumentUpload) => {
    setUploading(true);
    
    try {
      console.log('Upload started:', { applicationId, documentType: document.documentType, fileName: document.file.name });
      
      const fileExt = document.file.name.split('.').pop();
      const fileName = `${applicationId}/${document.documentType}_${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificate-documents')
        .upload(fileName, document.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded to storage:', uploadData.path);
      
      // Save document info to database
      const { error: dbError } = await supabase
        .from('application_documents')
        .insert({
          application_id: applicationId,
          document_name: document.documentName,
          document_type: document.documentType,
          file_path: uploadData.path,
          file_size: document.file.size
        });
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }
      
      console.log('Document record saved to database');
      toast.success('Document uploaded successfully!');
      return uploadData.path;
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error.message || 'Failed to upload document';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadDocument,
    uploading
  };
};
