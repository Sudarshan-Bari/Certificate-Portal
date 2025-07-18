
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export const SDOStatistics = () => {
  // Fetch overall statistics
  const { data: overallStats, isLoading: statsLoading } = useQuery({
    queryKey: ['sdoStatistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('status, certificate_type, created_at, approved_at');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        pending: data.filter(app => app.status === 'pending').length,
        inProgress: data.filter(app => ['verification_level_1', 'verification_level_2', 'verification_level_3', 'staff_review'].includes(app.status)).length,
        awaitingSDO: data.filter(app => app.status === 'awaiting_sdo').length,
        approved: data.filter(app => app.status === 'approved').length,
        rejected: data.filter(app => app.status === 'rejected').length,
        additionalInfoNeeded: data.filter(app => app.status === 'additional_info_needed').length,
        certificateTypes: {
          caste: data.filter(app => app.certificate_type === 'caste').length,
          income: data.filter(app => app.certificate_type === 'income').length,
          domicile: data.filter(app => app.certificate_type === 'domicile').length,
          residence: data.filter(app => app.certificate_type === 'residence').length,
        },
        thisMonth: data.filter(app => {
          const createdAt = new Date(app.created_at);
          const now = new Date();
          return createdAt >= startOfMonth(now) && createdAt <= endOfMonth(now);
        }).length,
        last30Days: data.filter(app => {
          const createdAt = new Date(app.created_at);
          return createdAt >= subDays(new Date(), 30);
        }).length,
        avgProcessingTime: data
          .filter(app => app.approved_at && app.created_at)
          .reduce((acc, app, _, arr) => {
            const processingTime = new Date(app.approved_at).getTime() - new Date(app.created_at).getTime();
            const days = processingTime / (1000 * 60 * 60 * 24);
            return acc + days / arr.length;
          }, 0)
      };
      
      return stats;
    }
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['userStatistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role');
      
      if (error) throw error;
      
      const roleCount = data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return roleCount;
    }
  });

  // Fetch monthly trends
  const { data: monthlyTrends } = useQuery({
    queryKey: ['monthlyTrends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificate_applications')
        .select('created_at, approved_at, status')
        .gte('created_at', subDays(new Date(), 180).toISOString());
      
      if (error) throw error;
      
      // Group by month
      const trends = data.reduce((acc, app) => {
        const month = format(new Date(app.created_at), 'MMM yyyy');
        if (!acc[month]) {
          acc[month] = { submitted: 0, approved: 0 };
        }
        acc[month].submitted += 1;
        if (app.status === 'approved') {
          acc[month].approved += 1;
        }
        return acc;
      }, {} as Record<string, { submitted: number; approved: number }>);
      
      return trends;
    }
  });

  if (statsLoading) {
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
            <BarChart3 className="h-6 w-6 mr-2" />
            System Statistics Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive overview of certificate application system performance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{overallStats?.total || 0}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{overallStats?.approved || 0}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{overallStats?.inProgress || 0}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{overallStats?.thisMonth || 0}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pending Level 1</span>
              </div>
              <span className="font-semibold">{overallStats?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <span className="font-semibold">{overallStats?.inProgress || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Awaiting SDO</span>
              </div>
              <span className="font-semibold">{overallStats?.awaitingSDO || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Additional Info Needed</span>
              </div>
              <span className="font-semibold">{overallStats?.additionalInfoNeeded || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">Rejected</span>
              </div>
              <span className="font-semibold">{overallStats?.rejected || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Types Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Caste Certificate</span>
              <span className="font-semibold">{overallStats?.certificateTypes.caste || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Income Certificate</span>
              <span className="font-semibold">{overallStats?.certificateTypes.income || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Domicile Certificate</span>
              <span className="font-semibold">{overallStats?.certificateTypes.domicile || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Residence Certificate</span>
              <span className="font-semibold">{overallStats?.certificateTypes.residence || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Average Processing Time</p>
                <p className="text-2xl font-bold">
                  {overallStats?.avgProcessingTime ? 
                    `${Math.round(overallStats.avgProcessingTime)} days` : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold">
                  {overallStats?.total ? 
                    `${Math.round((overallStats.approved / overallStats.total) * 100)}%` : 
                    '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userStats && Object.entries(userStats).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm capitalize">{role.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Last 30 Days</p>
                <p className="text-2xl font-bold">{overallStats?.last30Days || 0}</p>
                <p className="text-xs text-gray-500">Applications Submitted</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Current Month</p>
                <p className="text-xl font-bold">{overallStats?.thisMonth || 0}</p>
                <p className="text-xs text-gray-500">New Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      {monthlyTrends && Object.keys(monthlyTrends).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(monthlyTrends).slice(-6).map(([month, data]) => (
                <div key={month} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{month}</span>
                  <div className="flex space-x-6 text-sm">
                    <span>Submitted: <strong>{data.submitted}</strong></span>
                    <span>Approved: <strong>{data.approved}</strong></span>
                    <span className="text-green-600">
                      Rate: <strong>{data.submitted ? Math.round((data.approved / data.submitted) * 100) : 0}%</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
