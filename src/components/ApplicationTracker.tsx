
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Clock, CheckCircle, XCircle, Download, Eye, Calendar, User } from 'lucide-react';
import { useCertificateData } from '@/hooks/useCertificateData';
import { format } from 'date-fns';

export const ApplicationTracker = () => {
  const { applications, isLoading } = useCertificateData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'under_review':
      case 'document_verification':
      case 'verification_level_1':
      case 'verification_level_2':
      case 'verification_level_3':
      case 'staff_review':
      case 'awaiting_sdo':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'additional_info_needed':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'under_review':
      case 'document_verification':
      case 'verification_level_1':
      case 'verification_level_2':
      case 'verification_level_3':
      case 'staff_review':
      case 'awaiting_sdo':
        return 'status-under-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'additional_info_needed':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const formatCertificateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending':
        return 10;
      case 'document_verification':
        return 25;
      case 'verification_level_1':
        return 40;
      case 'verification_level_2':
        return 55;
      case 'verification_level_3':
        return 70;
      case 'staff_review':
        return 85;
      case 'awaiting_sdo':
        return 95;
      case 'approved':
        return 100;
      case 'rejected':
        return 0;
      case 'additional_info_needed':
        return 20;
      default:
        return 10;
    }
  };

  const getCurrentStage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Application Submitted';
      case 'document_verification':
        return 'Document Verification';
      case 'verification_level_1':
        return 'Level 1 Verification';
      case 'verification_level_2':
        return 'Level 2 Verification';
      case 'verification_level_3':
        return 'Level 3 Verification';
      case 'staff_review':
        return 'Staff Review';
      case 'awaiting_sdo':
        return 'Awaiting SDO Approval';
      case 'approved':
        return 'Certificate Approved';
      case 'rejected':
        return 'Application Rejected';
      case 'additional_info_needed':
        return 'Additional Information Required';
      default:
        return 'Processing';
    }
  };

  const handleDownloadCertificate = async (applicationId: string, applicationData: any) => {
    try {
      // Generate and download the certificate PDF
      const { generateCertificatePDF } = await import('@/utils/pdfGenerator');
      
      const pdf = generateCertificatePDF({
        certificateNumber: `CERT-${applicationData.application_id}`,
        fullName: applicationData.full_name,
        fatherName: applicationData.father_name,
        dateOfBirth: applicationData.date_of_birth,
        address: applicationData.address,
        certificateType: applicationData.certificate_type,
        issuedDate: applicationData.approved_at ? format(new Date(applicationData.approved_at), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'),
        digitalSignature: 'Digital Signature Applied'
      });
      
      pdf.save(`${applicationData.certificate_type}_certificate_${applicationData.application_id}.pdf`);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <Card className="certificate-card">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't submitted any certificate applications yet.
          </p>
          <Button variant="outline">
            Apply for Certificate
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="certificate-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Your Applications
          </CardTitle>
          <CardDescription>
            Track the status of all your certificate applications
          </CardDescription>
        </CardHeader>
      </Card>

      {applications.map((application) => (
        <Card key={application.id} className="certificate-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(application.status)}
                <div>
                  <CardTitle className="text-lg">{application.application_id}</CardTitle>
                  <CardDescription>
                    {formatCertificateType(application.certificate_type)} Certificate
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Application Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{getProgressValue(application.status)}%</span>
              </div>
              <Progress value={getProgressValue(application.status)} className="w-full" />
              <p className="text-sm text-gray-600">
                Current Stage: {getCurrentStage(application.status)}
              </p>
            </div>

            {/* Detailed Process Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Verification Timeline
              </h4>
              <div className="space-y-2 text-sm">
                {/* Application Submitted */}
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Application Submitted</span>
                  </div>
                  <span className="text-gray-600">
                    {format(new Date(application.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>

                {/* Level 1 Verification */}
                {application.verification_1_at && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Level 1 Verification Completed</span>
                    </div>
                    <span className="text-gray-600">
                      {format(new Date(application.verification_1_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {/* Level 2 Verification */}
                {application.verification_2_at && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Level 2 Verification Completed</span>
                    </div>
                    <span className="text-gray-600">
                      {format(new Date(application.verification_2_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {/* Level 3 Verification */}
                {application.verification_3_at && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Level 3 Verification Completed</span>
                    </div>
                    <span className="text-gray-600">
                      {format(new Date(application.verification_3_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {/* Staff Review */}
                {application.staff_reviewed_at && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Staff Review Completed</span>
                    </div>
                    <span className="text-gray-600">
                      {format(new Date(application.staff_reviewed_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {/* Final Approval */}
                {application.approved_at && (
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Certificate Approved & Issued</span>
                    </div>
                    <span className="text-gray-600">
                      {format(new Date(application.approved_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {/* Rejection */}
                {application.rejected_at && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Application Rejected</span>
                    </div>
                    <span className="text-gray-600">
                      {format(new Date(application.rejected_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                )}

                {/* Current Status (if not completed) */}
                {!application.approved_at && !application.rejected_at && (
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Currently at: {getCurrentStage(application.status)}</span>
                    </div>
                    <span className="text-gray-600">In Progress</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Applicant Name:</span>
                <p>{application.full_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p>{application.phone_number}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p>{application.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Application Date:</span>
                <p>{format(new Date(application.created_at), 'MMM dd, yyyy')}</p>
              </div>
            </div>

            {/* Purpose */}
            <div className="text-sm">
              <span className="font-medium text-gray-600">Purpose:</span>
              <p className="mt-1">{application.purpose}</p>
            </div>

            {/* Additional Info */}
            {application.additional_info && (
              <div className="text-sm">
                <span className="font-medium text-gray-600">Additional Information:</span>
                <p className="mt-1">{application.additional_info}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {application.status === 'rejected' && application.rejection_reason && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rejection Reason:</strong> {application.rejection_reason}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              {application.status === 'approved' && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleDownloadCertificate(application.id, application)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
