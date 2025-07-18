
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useRoleBasedData } from '@/hooks/useCertificateData';
import { format } from 'date-fns';

export const ClerkDashboard = () => {
  const { roleApplications, applicationsLoading, updateApplicationStatus } = useRoleBasedData();

  // Filter applications for clerk review (pending and document_verification)
  const clerkApplications = roleApplications?.filter(
    app => app.status === 'pending' || app.status === 'document_verification'
  ) || [];

  const handleVerifyDocuments = async (applicationId: string) => {
    await updateApplicationStatus.mutateAsync({
      applicationId,
      status: 'document_verification'
    });
  };

  const handleForwardToStaff = async (applicationId: string) => {
    await updateApplicationStatus.mutateAsync({
      applicationId,
      status: 'staff_review'
    });
  };

  const handleRequestInfo = async (applicationId: string) => {
    const additionalInfo = prompt('What additional information is needed?');
    if (additionalInfo) {
      await updateApplicationStatus.mutateAsync({
        applicationId,
        status: 'additional_info_needed',
        additionalInfo
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'document_verification':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (applicationsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Clerk Dashboard - Document Verification
          </CardTitle>
          <CardDescription>
            Review and verify documents for submitted applications
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{clerkApplications.filter(app => app.status === 'pending').length}</p>
                <p className="text-sm text-gray-600">Pending Verification</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{clerkApplications.filter(app => app.status === 'document_verification').length}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{clerkApplications.length}</p>
                <p className="text-sm text-gray-600">Total Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {clerkApplications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
            <p className="text-gray-600">No applications assigned for verification at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clerkApplications.map((application) => (
            <Card key={application.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{application.application_id}</CardTitle>
                    <CardDescription>
                      {application.certificate_type.toUpperCase()} Certificate - {application.full_name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Applicant:</span>
                    <p>{application.full_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Father's Name:</span>
                    <p>{application.father_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Date of Birth:</span>
                    <p>{application.date_of_birth}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Submitted:</span>
                    <p>{format(new Date(application.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-600">Address:</span>
                  <p className="mt-1">{application.address}</p>
                </div>

                <div className="text-sm">
                  <span className="font-medium text-gray-600">Purpose:</span>
                  <p className="mt-1">{application.purpose}</p>
                </div>

                {application.additional_info && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Additional Information:</span>
                    <p className="mt-1">{application.additional_info}</p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                  {application.status === 'pending' && (
                    <Button
                      onClick={() => handleVerifyDocuments(application.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateApplicationStatus.isPending}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Start Verification
                    </Button>
                  )}
                  
                  {application.status === 'document_verification' && (
                    <>
                      <Button
                        onClick={() => handleForwardToStaff(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updateApplicationStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Forward to Staff
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRequestInfo(application.id)}
                        disabled={updateApplicationStatus.isPending}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request Info
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
