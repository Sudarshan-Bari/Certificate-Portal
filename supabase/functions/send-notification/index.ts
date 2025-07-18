
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  applicationId: string;
  status: string;
  userEmail: string;
  userName: string;
  certificateType: string;
}

const getStatusMessage = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        subject: 'Application Received',
        message: 'Your certificate application has been received and is being reviewed.'
      };
    case 'document_verification':
      return {
        subject: 'Document Verification in Progress',
        message: 'Your documents are being verified by our team.'
      };
    case 'staff_review':
      return {
        subject: 'Application Under Staff Review',
        message: 'Your application is currently under staff review.'
      };
    case 'awaiting_sdo':
      return {
        subject: 'Awaiting SDO Approval',
        message: 'Your application is awaiting final approval from the SDO.'
      };
    case 'approved':
      return {
        subject: 'Certificate Approved!',
        message: 'Congratulations! Your certificate has been approved and is ready for download.'
      };
    case 'rejected':
      return {
        subject: 'Application Rejected',
        message: 'Unfortunately, your certificate application has been rejected. Please check the details in your dashboard.'
      };
    case 'additional_info_needed':
      return {
        subject: 'Additional Information Required',
        message: 'We need additional information to process your application. Please check your dashboard for details.'
      };
    default:
      return {
        subject: 'Application Status Update',
        message: 'Your application status has been updated.'
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicationId, status, userEmail, userName, certificateType }: NotificationRequest = await req.json();
    
    const statusInfo = getStatusMessage(status);
    
    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Revenue Department <noreply@revenue.gov.in>",
      to: [userEmail],
      subject: `${statusInfo.subject} - ${certificateType.toUpperCase()} Certificate`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1>Revenue Department</h1>
            <p>Digital Certificate Issuance System</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc;">
            <h2>Dear ${userName},</h2>
            
            <p>${statusInfo.message}</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Application Details:</h3>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Certificate Type:</strong> ${certificateType.toUpperCase()}</p>
              <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
            </div>
            
            <p>You can track your application progress by logging into your dashboard.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL')}/dashboard" 
                 style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Dashboard
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p style="color: #64748b; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
              <br>
              Revenue Department, Government Digital Services
            </p>
          </div>
        </div>
      `,
    });

    // Store notification in database
    await supabase
      .from('notifications')
      .insert({
        user_id: (await supabase.from('certificate_applications').select('user_id').eq('application_id', applicationId).single()).data?.user_id,
        title: statusInfo.subject,
        message: statusInfo.message,
        type: 'application_update',
        related_application_id: applicationId
      });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
