
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, Mail, MapPin, Save, Edit, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DocumentsViewer } from './DocumentsViewer';

export const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: ''
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch user's applications to show documents
  const { data: userApplications } = useQuery({
    queryKey: ['userApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('id, application_id, certificate_type, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + error.message);
    }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || ''
      });
    }
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="documents">My Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <CardTitle>User Profile</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              <CardDescription>
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{profile?.full_name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{profile?.phone_number || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your address"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{profile?.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={updateProfile.isPending}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Your current roles and permissions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userRoles?.map((roleData, index) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {roleData.role.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {!userRoles?.length && (
                  <span className="text-sm text-gray-500">No roles assigned</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-6 w-6 mr-2" />
                My Documents
              </CardTitle>
              <CardDescription>
                Documents uploaded for your certificate applications
              </CardDescription>
            </CardHeader>
          </Card>

          {userApplications && userApplications.length > 0 ? (
            <div className="space-y-6">
              {userApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.application_id}</CardTitle>
                        <CardDescription>
                          {application.certificate_type.toUpperCase()} Certificate
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {application.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DocumentsViewer applicationId={application.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Found</h3>
                <p className="text-gray-600">You haven't submitted any applications yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
