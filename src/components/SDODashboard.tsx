import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle, XCircle, Users, BarChart3, Settings, User } from 'lucide-react';
import { useRoleBasedData, useRoleManagement } from '@/hooks/useCertificateData';
import { format } from 'date-fns';
import { useState } from 'react';
import { SDOStatistics } from './SDOStatistics';
import { OfficerProfile } from './OfficerProfile';

export const SDODashboard = () => {
  const { roleApplications, applicationsLoading, updateApplicationStatus } = useRoleBasedData();
  const { users, usersLoading, assignRole } = useRoleManagement();
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Filter applications awaiting SDO approval
  const sdoApplications = roleApplications?.filter(
    app => app.status === 'awaiting_sdo'
  ) || [];

  const handleFinalApproval = async (applicationId: string) => {
    await updateApplicationStatus.mutateAsync({
      applicationId,
      status: 'approved'
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

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert('Please select both user and role');
      return;
    }
    
    await assignRole.mutateAsync({
      userId: selectedUser,
      role: selectedRole
    });
    
    setSelectedUser('');
    setSelectedRole('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting_sdo':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
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
            <Shield className="h-6 w-6 mr-2" />
            SDO Dashboard - Final Approval Authority
          </CardTitle>
          <CardDescription>
            Final approval authority for all certificate applications and system administration
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="management">User Management</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{sdoApplications.length}</p>
                    <p className="text-sm text-gray-600">Awaiting Approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{roleApplications?.filter(app => app.status === 'approved').length || 0}</p>
                    <p className="text-sm text-gray-600">Approved</p>
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
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{roleApplications?.length || 0}</p>
                    <p className="text-sm text-gray-600">Total Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Section */}
          {sdoApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
                <p className="text-gray-600">No applications awaiting SDO approval at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Applications Awaiting Final Approval</h3>
              {sdoApplications.map((application) => (
                <Card key={application.id} className="border-l-4 border-l-orange-500">
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
                    {/* ... keep existing code (application details and actions) */}
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
                      <span className="font-medium text-gray-600">Purpose:</span>
                      <p className="mt-1">{application.purpose}</p>
                    </div>

                    {application.staff_reviewed_at && (
                      <div className="text-sm bg-purple-50 p-3 rounded">
                        <span className="font-medium text-purple-800">Staff Officer Review:</span>
                        <p className="text-purple-700 mt-1">
                          Reviewed on {format(new Date(application.staff_reviewed_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        onClick={() => handleFinalApproval(application.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updateApplicationStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Final Approval
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics">
          <SDOStatistics />
        </TabsContent>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Role Management
              </CardTitle>
              <CardDescription>
                Assign roles to users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Select User</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Select Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verification_officer_1">Verification Officer Level 1</SelectItem>
                      <SelectItem value="verification_officer_2">Verification Officer Level 2</SelectItem>
                      <SelectItem value="verification_officer_3">Verification Officer Level 3</SelectItem>
                      <SelectItem value="clerk">Clerk</SelectItem>
                      <SelectItem value="staff_officer">Staff Officer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sdo">SDO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAssignRole}
                  disabled={!selectedUser || !selectedRole || assignRole.isPending}
                >
                  Assign Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <OfficerProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};
