import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, XCircle, ArrowUp, AlertCircle, User } from 'lucide-react';
import { useRoleBasedData } from '@/hooks/useCertificateData';
import { DocumentsViewer } from './DocumentsViewer';
import { OfficerProfile } from './OfficerProfile';
import { format } from 'date-fns';
import { useState } from 'react';

export const StaffOfficerDashboard = () => {
  const { roleApplications, applicationsLoading, updateApplicationStatus } = useRoleBasedData();
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  // Filter applications for staff officer review
  const staffApplications = roleApplications?.filter(
    app => app.status === 'verification_level_3' || app.status === 'staff_review'
  ) || [];

  const handleApprove = async (applicationId: string) => {
    await updateApplicationStatus.mutateAsync({
      applicationId,
      status: 'awaiting_sdo'
    });
  };

  const handleReject = async (applicationId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    await updateApplicationStatus.mutateAsync({
      applicationId,
      status: 'rejected',
      rejectionReason
    });
    
    setRejectionReason('');
    setSelectedApplication(null);
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
      case 'verification_level_3':
        return 'bg-blue-100 text-blue-800';
      case 'staff_review':
        return 'bg-purple-100 text-purple-800';
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
            <User className="h-6 w-6 mr-2" />
            Staff Officer Dashboard - Application Review
          </CardTitle>
          <CardDescription>
            Review verified applications and make approval decisions
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{staffApplications.filter(app => app.status === 'verification_level_3').length}</p>
                    <p className="text-sm text-gray-600">Ready for Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{staffApplications.filter(app => app.status === 'staff_review').length}</p>
                    <p className="text-sm text-gray-600">Under Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ArrowUp className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{roleApplications?.filter(app => app.status === 'awaiting_sdo').length || 0}</p>
                    <p className="text-sm text-gray-600">Sent to SDO</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{roleApplications?.filter(app => app.status === 'rejected').length || 0}</p>
                    <p className="text-sm text-gray-600">Rejected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {staffApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
                <p className="text-gray-600">No applications assigned for staff review at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {staffApplications.map((application) => (
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
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                        <span className="font-medium text-gray-600">Phone:</span>
                        <p>{application.phone_number}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p>{application.email}</p>
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

                    {application.clerk_verified_at && (
                      <div className="text-sm bg-blue-50 p-3 rounded">
                        <span className="font-medium text-blue-800">Clerk Verification:</span>
                        <p className="text-blue-700 mt-1">
                          Verified on {format(new Date(application.clerk_verified_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}

                    <DocumentsViewer applicationId={application.id} />

                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        onClick={() => handleApprove(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updateApplicationStatus.isPending}
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Send to SDO
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            onClick={() => setSelectedApplication(application.id)}
                            disabled={updateApplicationStatus.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Application</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Please provide a reason for rejecting this application:
                            </p>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Enter rejection reason..."
                              className="min-h-[100px]"
                            />
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => selectedApplication && handleReject(selectedApplication)}
                              >
                                Reject Application
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleRequestInfo(application.id)}
                        disabled={updateApplicationStatus.isPending}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request Info
                      </Button>
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
