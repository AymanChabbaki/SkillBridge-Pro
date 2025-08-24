import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../state/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Briefcase, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Clock,
  Star,
  Plus,
  ArrowRight
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { missionService } from '../../services/missionService';
import { applicationService } from '../../services/applicationService';
import { AnalyticsSummary, Mission, Application } from '../../services/types';

const DashboardFreelance = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentMissions, setRecentMissions] = useState<Mission[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, missionsData, applicationsData] = await Promise.all([
          analyticsService.getSummary(),
          missionService.getMissions({ limit: 5 }),
          applicationService.getMyApplications({ limit: 5 })
        ]);

        setAnalytics(analyticsData || {});
        setRecentMissions(Array.isArray(missionsData.items) ? missionsData.items : []);
        setRecentApplications(Array.isArray(applicationsData.items) ? applicationsData.items : []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your freelance career</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
      <div className="text-2xl font-bold">${analytics?.totalEarnings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
    <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
      <div className="text-2xl font-bold">{analytics?.activeContracts ?? analytics?.activeProjects ?? 0}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        
    <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
      <div className="text-2xl font-bold">{analytics?.conversionRate ?? analytics?.winRate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">Application success</p>
          </CardContent>
        </Card>
        
    <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
      <div className="text-2xl font-bold">{analytics?.averageRating ?? analytics?.avgRating ?? 0}/5</div>
            <p className="text-xs text-muted-foreground">Client satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Missions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Latest Missions</CardTitle>
                <CardDescription>New opportunities for you</CardDescription>
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
              recentMissions.map((mission) => (
                <div key={mission.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{mission.title}</h4>
                    <Badge variant="secondary">{mission.urgency}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {mission.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      ${mission.budgetMin} - ${mission.budgetMax}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/missions/${mission.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No missions available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your proposals</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/applications">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{application.mission?.title}</h4>
                    <Badge 
                      variant={
                        application.status === 'ACCEPTED' ? 'default' :
                        application.status === 'REJECTED' ? 'destructive' :
                        application.status === 'SHORTLISTED' ? 'secondary' : 'outline'
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Proposed: ${application.proposedRate}/day
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No applications yet</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/missions">
                    <Plus className="mr-1 h-4 w-4" />
                    Browse Missions
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you succeed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/profile">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">Update Profile</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/missions">
                <Briefcase className="h-6 w-6 mb-2" />
                <span className="text-sm">Browse Missions</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/matching">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-sm">View Matches</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/tracking">
                <Clock className="h-6 w-6 mb-2" />
                <span className="text-sm">Track Time</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardFreelance;