
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateCertificatePDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const CertificateViewer = () => {
  const { user } = useAuth();
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null);

  // Fetch user's approved applications (which are their certificates)
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['user-certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get approved applications which are essentially issued certificates
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleDownloadCertificate = async (application: any) => {
    try {
      const pdf = generateCertificatePDF({
        certificateNumber: application.application_id,
        fullName: application.full_name,
        fatherName: application.father_name,
        dateOfBirth: application.date_of_birth,
        address: application.address,
        certificateType: application.certificate_type,
        issuedDate: application.approved_at ? format(new Date(application.approved_at), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'),
        digitalSignature: 'Digitally Signed by Revenue Department'
      });
      
      pdf.save(`${application.certificate_type}_certificate_${application.application_id}.pdf`);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleViewCertificate = (certificateId: string) => {
    setViewingCertificate(certificateId);
    // You can implement a modal or detailed view here
    toast.info('Certificate view feature will be implemented');
  };

  const formatCertificateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-6 w-6 mr-2" />
            My Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-6 w-6 mr-2" />
            My Certificates
          </CardTitle>
          <CardDescription>Your issued certificates will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No certificates issued yet.</p>
            <p className="text-sm text-gray-400">
              Once your applications are approved, you'll be able to download your certificates here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-6 w-6 mr-2" />
          My Certificates
        </CardTitle>
        <CardDescription>Download and view your issued certificates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">{formatCertificateType(cert.certificate_type)} Certificate</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Issued
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><span className="font-medium">Certificate No:</span> {cert.application_id}</p>
                    <p><span className="font-medium">Issued to:</span> {cert.full_name}</p>
                    <p><span className="font-medium">Issued on:</span> {cert.approved_at ? format(new Date(cert.approved_at), 'MMM dd, yyyy') : 'N/A'}</p>
                    <p><span className="font-medium">Type:</span> {formatCertificateType(cert.certificate_type)}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><span className="font-medium">Purpose:</span> {cert.purpose}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCertificate(cert.id)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownloadCertificate(cert)}
                    className="bg-green-600 hover:bg-green-700 w-full"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
