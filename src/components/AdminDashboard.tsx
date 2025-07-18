
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { useRoleBasedData } from '@/hooks/useCertificateData';
import { format } from 'date-fns';

export const AdminDashboard = () => {
  const { roleApplications: allApplications, applicationsLoading, updateApplicationStatus } = useRoleBasedData();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'document_verification':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'staff_review':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'awaiting_sdo':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'document_verification':
        return 'status-under-review';
      case 'staff_review':
        return 'status-under-review';
      case 'awaiting_sdo':
        return 'status-under-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const formatCertificateType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const handleStatusUpdate = async (applicationId: string, status: any) => {
    try {
      await updateApplicationStatus.mutateAsync({
        applicationId,
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined
      });
      setSelectedApplication(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (applicationsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    total: allApplications?.length || 0,
    pending: allApplications?.filter(app => app.status === 'pending').length || 0,
    inProgress: allApplications?.filter(app => ['document_verification', 'staff_review', 'awaiting_sdo'].includes(app.status)).length || 0,
    approved: allApplications?.filter(app => app.status === 'approved').length || 0,
    rejected: allApplications?.filter(app => app.status === 'rejected').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="certificate-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card className="certificate-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card className="certificate-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card className="certificate-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card className="certificate-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="certificate-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            All Applications
          </CardTitle>
          <CardDescription>
            Manage and review certificate applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!allApplications || allApplications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <h3 className="font-semibold">{application.application_id}</h3>
                        <p className="text-sm text-gray-600">
                          {formatCertificateType(application.certificate_type)} Certificate
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{application.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span>{application.phone_number}</span>
                    </div>
                  </div>

                  <div className="mb-4 text-sm">
                    <span className="font-medium text-gray-600">Purpose: </span>
                    <span>{application.purpose}</span>
                  </div>

                  {application.status === 'rejected' && application.rejection_reason && (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Rejection Reason:</strong> {application.rejection_reason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Status Update Controls */}
                  <div className="flex items-center space-x-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Label>Update Status:</Label>
                      <Select 
                        onValueChange={(value) => {
                          if (value === 'rejected') {
                            setSelectedApplication(application.id);
                          } else {
                            handleStatusUpdate(application.id, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="document_verification">Document Verification</SelectItem>
                          <SelectItem value="staff_review">Staff Review</SelectItem>
                          <SelectItem value="awaiting_sdo">Awaiting SDO</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Rejection Reason Input */}
                  {selectedApplication === application.id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                      <Textarea
                        id="rejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        className="mt-2"
                        rows={3}
                      />
                      <div className="flex space-x-2 mt-3">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          disabled={!rejectionReason.trim() || updateApplicationStatus.isPending}
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(null);
                            setRejectionReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
