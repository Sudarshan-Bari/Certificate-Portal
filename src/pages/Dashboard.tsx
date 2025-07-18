import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, Clock, Users, TrendingUp, Bell, Search, Filter, LogOut, Award, Settings } from 'lucide-react';
import { CitizenPortal } from '@/components/CitizenPortal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ClerkDashboard } from '@/components/ClerkDashboard';
import { StaffOfficerDashboard } from '@/components/StaffOfficerDashboard';
import { SDODashboard } from '@/components/SDODashboard';
import { VerificationOfficer1Dashboard } from '@/components/VerificationOfficer1Dashboard';
import { VerificationOfficer2Dashboard } from '@/components/VerificationOfficer2Dashboard';
import { VerificationOfficer3Dashboard } from '@/components/VerificationOfficer3Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('citizen');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<string[]>(['citizen']);

  // Fetch user roles
  const { data: roleData } = useQuery({
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

  // Fetch stats for dashboard
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data: applications, error } = await supabase
        .from('certificate_applications')
        .select('status, created_at');
      
      if (error) throw error;

      const total = applications?.length || 0;
      const pending = applications?.filter(app => app.status === 'pending').length || 0;
      const approved = applications?.filter(app => 
        app.status === 'approved' && 
        new Date(app.created_at).toDateString() === new Date().toDateString()
      ).length || 0;

      return {
        total: total.toString(),
        pending: pending.toString(),
        approved: approved.toString(),
        avgTime: '2.3 days'
      };
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (roleData && roleData.length > 0) {
      const roles = roleData.map(r => r.role);
      const officerRoles = roles.filter(role => role !== 'citizen');
      
      // If user has officer roles, don't include citizen access
      if (officerRoles.length > 0) {
        setUserRoles(officerRoles);
        
        // Set default active view based on highest priority role
        if (roles.includes('sdo' as any)) {
          setActiveView('sdo');
        } else if (roles.includes('admin' as any)) {
          setActiveView('admin');
        } else if (roles.includes('staff_officer' as any)) {
          setActiveView('staff_officer');
        } else if (roles.includes('verification_officer_3' as any)) {
          setActiveView('verification_officer_3');
        } else if (roles.includes('verification_officer_2' as any)) {
          setActiveView('verification_officer_2');
        } else if (roles.includes('verification_officer_1' as any)) {
          setActiveView('verification_officer_1');
        } else if (roles.includes('clerk' as any)) {
          setActiveView('clerk');
        }
      } else {
        // Only citizen role
        setUserRoles(['citizen']);
        setActiveView('citizen');
      }
    } else {
      setUserRoles(['citizen']);
      setActiveView('citizen');
    }
  }, [user, navigate, roleData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const dashboardStats = [
    {
      title: 'Total Applications',
      value: stats?.total || '0',
      change: '+12%',
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Pending Review',
      value: stats?.pending || '0',
      change: '-8%',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Approved Today',
      value: stats?.approved || '0',
      change: '+24%',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Processing Time',
      value: stats?.avgTime || '2.3 days',
      change: '-15%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const renderRoleButtons = () => {
    const buttons = [];
    
    if (userRoles.length === 1 && userRoles.includes('citizen')) {
      buttons.push(
        <Button 
          key="citizen"
          variant={activeView === 'citizen' ? 'default' : 'outline'}
          onClick={() => setActiveView('citizen')}
          className={`transition-all duration-200 ${
            activeView === 'citizen' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          <Award className="h-4 w-4 mr-2" />
          Citizen Portal
        </Button>
      );
    }

    if (userRoles.includes('verification_officer_1')) {
      buttons.push(
        <Button 
          key="verification_officer_1"
          variant={activeView === 'verification_officer_1' ? 'default' : 'outline'}
          onClick={() => setActiveView('verification_officer_1')}
          className={`transition-all duration-200 ${
            activeView === 'verification_officer_1' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          Level 1 Verification
        </Button>
      );
    }

    if (userRoles.includes('verification_officer_2')) {
      buttons.push(
        <Button 
          key="verification_officer_2"
          variant={activeView === 'verification_officer_2' ? 'default' : 'outline'}
          onClick={() => setActiveView('verification_officer_2')}
          className={`transition-all duration-200 ${
            activeView === 'verification_officer_2' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          Level 2 Verification
        </Button>
      );
    }

    if (userRoles.includes('verification_officer_3')) {
      buttons.push(
        <Button 
          key="verification_officer_3"
          variant={activeView === 'verification_officer_3' ? 'default' : 'outline'}
          onClick={() => setActiveView('verification_officer_3')}
          className={`transition-all duration-200 ${
            activeView === 'verification_officer_3' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          Level 3 Verification
        </Button>
      );
    }

    if (userRoles.includes('clerk')) {
      buttons.push(
        <Button 
          key="clerk"
          variant={activeView === 'clerk' ? 'default' : 'outline'}
          onClick={() => setActiveView('clerk')}
          className={`transition-all duration-200 ${
            activeView === 'clerk' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          Clerk Dashboard
        </Button>
      );
    }

    if (userRoles.includes('staff_officer')) {
      buttons.push(
        <Button 
          key="staff_officer"
          variant={activeView === 'staff_officer' ? 'default' : 'outline'}
          onClick={() => setActiveView('staff_officer')}
          className={`transition-all duration-200 ${
            activeView === 'staff_officer' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          Staff Officer
        </Button>
      );
    }

    if (userRoles.includes('admin')) {
      buttons.push(
        <Button 
          key="admin"
          variant={activeView === 'admin' ? 'default' : 'outline'}
          onClick={() => setActiveView('admin')}
          className={`transition-all duration-200 ${
            activeView === 'admin' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin Dashboard
        </Button>
      );
    }

    if (userRoles.includes('sdo')) {
      buttons.push(
        <Button 
          key="sdo"
          variant={activeView === 'sdo' ? 'default' : 'outline'}
          onClick={() => setActiveView('sdo')}
          className={`transition-all duration-200 ${
            activeView === 'sdo' 
              ? 'bg-white text-primary shadow-md hover:bg-white/90' 
              : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'
          }`}
        >
          SDO Dashboard
        </Button>
      );
    }

    return buttons;
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'citizen':
        return <CitizenPortal />;
      case 'verification_officer_1':
        return <VerificationOfficer1Dashboard />;
      case 'verification_officer_2':
        return <VerificationOfficer2Dashboard />;
      case 'verification_officer_3':
        return <VerificationOfficer3Dashboard />;
      case 'clerk':
        return <ClerkDashboard />;
      case 'staff_officer':
        return <StaffOfficerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'sdo':
        return <SDODashboard />;
      default:
        return userRoles.includes('citizen') ? <CitizenPortal /> : <div>Access Denied</div>;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="gradient-bg shadow-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Revenue Department</h1>
                <p className="text-blue-100 mt-1 font-medium">Digital Certificate Issuance System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 flex-wrap">
                {renderRoleButtons()}
              </div>
              <div className="h-8 w-px bg-white/20 mx-2"></div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 relative transition-colors duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Stats Overview */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <Badge 
                      variant="secondary" 
                      className={`${stat.color} bg-white/80 font-semibold`}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content with enhanced styling */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-1">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
