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
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  FileText
} from 'lucide-react';

const DashboardCompany = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Dashboard</h1>
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
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Industry: 14 days</p>
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
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">Senior React Developer</h4>
                <Badge variant="default">Published</Badge>
              </div>
              <p className="text-xs text-muted-foreground">23 applications received</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">$400-600/day</span>
                <Button variant="ghost" size="sm">Review</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">UX/UI Designer</h4>
                <Badge variant="secondary">Draft</Badge>
              </div>
              <p className="text-xs text-muted-foreground">3 month project</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">$350-500/day</span>
                <Button variant="ghost" size="sm">Publish</Button>
              </div>
            </div>
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
                <Link to="/applications">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">John Doe</h4>
                <Badge variant="outline">New</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Applied for Senior React Developer</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">5 years exp, €450/day</span>
                <Button variant="ghost" size="sm">Review</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">Sarah Smith</h4>
                <Badge variant="outline">New</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Applied for UX/UI Designer</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">8 years exp, €400/day</span>
                <Button variant="ghost" size="sm">Review</Button>
              </div>
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
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/missions/new">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Post Mission</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/matching">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">Find Talent</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center">
              <Link to="/applications">
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
  );
};

export default DashboardCompany;