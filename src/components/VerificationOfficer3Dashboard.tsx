import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useRoleBasedData } from '@/hooks/useCertificateData';
import { DocumentsViewer } from './DocumentsViewer';
import { OfficerProfile } from './OfficerProfile';
import { format } from 'date-fns';

export const VerificationOfficer3Dashboard = () => {
  const { roleApplications, applicationsLoading, updateApplicationStatus } = useRoleBasedData();

  // Filter applications for level 3 verification
  const level3Applications = roleApplications?.filter(
    app => app.status === 'verification_level_2' || app.status === 'verification_level_3'
  ) || [];

  // ... keep existing code (handler functions)
  const handleStartVerification = async (applicationId: string) => {
    await updateApplicationStatus.mutateAsync({
      applicationId,
      status: 'verification_level_3'
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
      case 'verification_level_2':
        return 'bg-yellow-100 text-yellow-800';
      case 'verification_level_3':
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
            Level 3 Verification Officer Dashboard
          </CardTitle>
          <CardDescription>
            Final verification and quality assurance before staff review
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* ... keep existing code (stats and applications) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{level3Applications.filter(app => app.status === 'verification_level_2').length}</p>
                    <p className="text-sm text-gray-600">From Level 2</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{level3Applications.filter(app => app.status === 'verification_level_3').length}</p>
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
                    <p className="text-2xl font-bold">{level3Applications.length}</p>
                    <p className="text-sm text-gray-600">Total Assigned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {level3Applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
                <p className="text-gray-600">No applications assigned for Level 3 verification at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {level3Applications.map((application) => (
                <Card key={application.id} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.application_id}</CardTitle>
                        <CardDescription>
                          {application.certificate_type.toUpperCase()} Certificate - {application.full_name}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        LEVEL 3 {application.status.replace('verification_level_', 'L').replace('_', ' ').toUpperCase()}
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
                      <span className="font-medium text-gray-600">Purpose:</span>
                      <p className="mt-1">{application.purpose}</p>
                    </div>

                    <DocumentsViewer applicationId={application.id} />

                    <div className="flex space-x-2 pt-4 border-t">
                      {application.status === 'verification_level_2' && (
                        <Button
                          onClick={() => handleStartVerification(application.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={updateApplicationStatus.isPending}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Start Level 3 Verification
                        </Button>
                      )}
                      
                      {application.status === 'verification_level_3' && (
                        <>
                          <Button
                            onClick={() => handleForwardToStaff(application.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updateApplicationStatus.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Forward to Staff Review
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
        </TabsContent>

        <TabsContent value="profile">
          <OfficerProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};
