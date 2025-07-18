
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, Clock, Users, TrendingUp, Bell, Search, Filter } from 'lucide-react';
import { CitizenPortal } from '@/components/CitizenPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ApplicationTracker } from '@/components/ApplicationTracker';
import { CertificateApplication } from '@/components/CertificateApplication';

const Index = () => {
  const [activeView, setActiveView] = useState('citizen');

  const stats = [
    {
      title: 'Total Applications',
      value: '2,847',
      change: '+12%',
      icon: FileCheck,
      color: 'text-blue-600'
    },
    {
      title: 'Pending Review',
      value: '156',
      change: '-8%',
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Approved Today',
      value: '89',
      change: '+24%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Processing Time',
      value: '2.3 days',
      change: '-15%',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Revenue Department</h1>
              <p className="text-blue-100 mt-1">Digital Certificate Issuance System</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant={activeView === 'citizen' ? 'secondary' : 'ghost'}
                onClick={() => setActiveView('citizen')}
                className="text-white hover:bg-white/20"
              >
                Citizen Portal
              </Button>
              <Button 
                variant={activeView === 'admin' ? 'secondary' : 'ghost'}
                onClick={() => setActiveView('admin')}
                className="text-white hover:bg-white/20"
              >
                Admin Dashboard
              </Button>
              <Bell className="h-6 w-6 cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="certificate-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <Badge variant="secondary" className="mt-2">
                      {stat.change}
                    </Badge>
                  </div>
                  <stat.icon className={`h-12 w-12 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        {activeView === 'citizen' ? <CitizenPortal /> : <AdminDashboard />}
      </div>
    </div>
  );
};

export default Index;
