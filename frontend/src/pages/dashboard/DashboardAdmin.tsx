import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { get } from '../../services/api';

type AnalyticsSummary = {
  totalUsers: number;
  activeMissions: number;
  platformRevenue: number;
  openDisputes: number;
  freelancersCount: number;
  companiesCount: number;
  successRate?: number;
  avgRating?: number;
  totalVolume?: number;
  avgMatchTime?: string;
};

const DashboardAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const raw = await get<any>('/analytics/summary');
        if (!mounted) return;
        // Map backend admin summary to UI-friendly shape
        const mapped: AnalyticsSummary = {
          totalUsers: raw.totalUsers ?? raw.total_users ?? 0,
          activeMissions: raw.activeMissions ?? raw.totalMissions ?? 0,
          platformRevenue: raw.platformRevenue ?? raw.platformRevenue ?? (raw.platformRevenue || 0),
          openDisputes: raw.activeDisputes ?? raw.openDisputes ?? 0,
          freelancersCount: raw.freelancersCount ?? raw.totalFreelancers ?? 0,
          companiesCount: raw.companiesCount ?? raw.totalCompanies ?? 0,
          successRate: raw.successRate ? Math.round(raw.successRate * 100) / 100 : raw.successRate ?? 0,
          avgRating: raw.avgRating ?? 0,
          totalVolume: raw.totalPayments ?? raw.totalVolume ?? 0,
          avgMatchTime: raw.avgTimeToHire ? `${raw.avgTimeToHire}d` : raw.avgMatchTime ?? '—'
        };

        setSummary(mapped);
      } catch (err: any) {
        setError(err?.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management tools</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : (summary ? summary.totalUsers : '—')}</div>
            <p className="text-xs text-muted-foreground">{loading ? 'Loading...' : '+12% from last month'}</p>
          </CardContent>
        </Card>
        
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : (summary ? summary.activeMissions : '—')}</div>
            <p className="text-xs text-muted-foreground">{loading ? 'Loading...' : '+8% from last week'}</p>
          </CardContent>
        </Card>
        
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : (summary ? `$${Number(summary.platformRevenue).toLocaleString()}` : '—')}</div>
            <p className="text-xs text-muted-foreground">{loading ? 'Loading...' : '+20% from last month'}</p>
          </CardContent>
        </Card>
        
          <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : (summary ? summary.openDisputes : '—')}</div>
            <p className="text-xs text-muted-foreground">{loading ? 'Loading...' : 'Require attention'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading recent activity...</div>
            ) : (
              // Simple mapping of recent activity could be provided by the analytics endpoint; fallback static entries if not available
              <>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New freelancer registered</p>
                    <p className="text-xs text-muted-foreground">Recent user joined the platform</p>
                  </div>
                  <span className="text-xs text-muted-foreground">just now</span>
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Mission completed</p>
                <p className="text-xs text-muted-foreground">E-commerce platform project finished</p>
              </div>
              <span className="text-xs text-muted-foreground">15m ago</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payment processed</p>
                <p className="text-xs text-muted-foreground">$5,000 milestone payment completed</p>
              </div>
              <span className="text-xs text-muted-foreground">1h ago</span>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health and monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Response Time</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${loading ? 'bg-yellow-500' : 'bg-green-500'} rounded-full`}></div>
                <span className="text-sm text-muted-foreground">{loading ? '—' : '145ms'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Performance</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Optimal</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Payment Gateway</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Degraded</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>Key metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{loading ? '—' : summary?.freelancersCount ?? '—'}</div>
              <p className="text-xs text-muted-foreground">Freelancers</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{loading ? '—' : summary?.companiesCount ?? '—'}</div>
              <p className="text-xs text-muted-foreground">Companies</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{loading ? '—' : `${summary?.successRate ?? '—'}%`}</div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{loading ? '—' : summary?.avgRating ?? '—'}</div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{loading ? '—' : (summary?.totalVolume ? `$${Number(summary.totalVolume).toLocaleString()}` : '—')}</div>
              <p className="text-xs text-muted-foreground">Total Volume</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{loading ? '—' : summary?.avgMatchTime ?? '—'}</div>
              <p className="text-xs text-muted-foreground">Avg Match Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAdmin;