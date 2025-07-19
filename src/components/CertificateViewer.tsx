
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generatePDFFromCertificate } from '@/utils/pdfGenerator';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const CertificateViewer = () => {
  const { user } = useAuth();
  const [viewingCertificate, setViewingCertificate] = useState<string | null>(null);

  // Fetch user's certificates from the certificates table
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['user-certificates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get certificates that belong to the user
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          certificate_applications!inner(
            user_id,
            full_name,
            father_name,
            date_of_birth,
            address,
            purpose
          )
        `)
        .eq('certificate_applications.user_id', user.id)
        .order('issued_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleDownloadCertificate = async (certificate: any) => {
    try {
      const pdf = generatePDFFromCertificate(certificate);
      pdf.save(`${certificate.certificate_type}_certificate_${certificate.certificate_number}.pdf`);
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
                    <p><span className="font-medium">Certificate No:</span> {cert.certificate_number}</p>
                    <p><span className="font-medium">Issued to:</span> {cert.issued_to}</p>
                    <p><span className="font-medium">Issued on:</span> {format(new Date(cert.issued_date), 'MMM dd, yyyy')}</p>
                    <p><span className="font-medium">Type:</span> {formatCertificateType(cert.certificate_type)}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p><span className="font-medium">Purpose:</span> {cert.certificate_applications?.purpose || 'N/A'}</p>
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