
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendNotificationParams {
  applicationId: string;
  status: string;
  userEmail: string;
  userName: string;
  certificateType: string;
}

export const useNotifications = () => {
  const sendNotification = useMutation({
    mutationFn: async (params: SendNotificationParams) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params
      });
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
    }
  });

  return {
    sendNotification
  };
};
