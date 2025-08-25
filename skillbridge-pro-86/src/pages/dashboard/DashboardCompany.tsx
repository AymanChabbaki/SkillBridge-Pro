import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../state/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Briefcase, 
  Clock,
  Plus,
  ArrowRight,
  FileText
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import MissionModal from '../../components/missions/MissionModal';
import { missionService } from '../../services/missionService';
import { AnalyticsSummary, Mission } from '../../services/types';

const DashboardCompany = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentMissions, setRecentMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMissionModal, setOpenMissionModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, missionsData] = await Promise.all([
          analyticsService.getSummary(),
          missionService.getMissions({ limit: 5 })
        ]);

        setAnalytics(analyticsData || {});
        setRecentMissions(Array.isArray(missionsData.items) ? missionsData.items : []);
      } catch (error) {
        console.error('Failed to fetch company dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Manage your hiring and talent acquisition</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalMissions ?? analytics?.activeProjects ?? 0}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalApplications ?? 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.talentPoolSize ?? analytics?.totalFreelancers ?? 0}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgTimeToHire ?? '—'}</div>
            <p className="text-xs text-muted-foreground">Industry: {analytics?.platformGrowth ?? '—'} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Missions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Missions</CardTitle>
                <CardDescription>Your latest job postings</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/missions">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMissions.length > 0 ? (
              recentMissions.map((m) => (
                <div key={m.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{m.title}</h4>
                    <Badge variant="default">{m.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.requiredSkills?.slice(0,3).join(', ')}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">${m.budgetMin} - ${m.budgetMax}</span>
                    <Button variant="ghost" size="sm">
                      <Link to={`/missions/${m.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No missions available</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Applications awaiting your review</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/missions">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">{analytics?.recentApplications ? `${analytics.recentApplications} recent applications` : 'No recent applications'}</div>
            <div className="text-center py-4">
              <Button variant="outline" size="sm" onClick={() => setOpenMissionModal(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Post Mission
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your hiring process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center" onClick={() => setOpenMissionModal(true)}>
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Post Mission</span>
              </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/matching">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Find Talent</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/missions">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">Review Applications</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/contracts">
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="text-sm">Manage Contracts</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <MissionModal open={openMissionModal} onOpenChange={setOpenMissionModal} />
    </>
  );
};

export default DashboardCompany;