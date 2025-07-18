
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CertificateApplication } from './CertificateApplication';
import { ApplicationTracker } from './ApplicationTracker';
import { CertificateViewer } from './CertificateViewer';
import { Profile } from './Profile';

export const CitizenPortal = () => {
  return (
    <Tabs defaultValue="apply" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="apply">Apply for Certificate</TabsTrigger>
        <TabsTrigger value="track">Track Applications</TabsTrigger>
        <TabsTrigger value="certificates">My Certificates</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>
      <TabsContent value="apply" className="mt-6">
        <CertificateApplication />
      </TabsContent>
      <TabsContent value="track" className="mt-6">
        <ApplicationTracker />
      </TabsContent>
      <TabsContent value="certificates" className="mt-6">
        <CertificateViewer />
      </TabsContent>
      <TabsContent value="profile" className="mt-6">
        <Profile />
      </TabsContent>
    </Tabs>
  );
};
