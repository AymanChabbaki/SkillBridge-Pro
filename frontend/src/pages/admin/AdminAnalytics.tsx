import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 15420,
    totalRevenue: 2450000,
    activeProjects: 1247,
    platformGrowth: 23.5,
    userGrowth: [
      { month: 'Jan', users: 1200, revenue: 180000 },
      { month: 'Feb', users: 1450, revenue: 210000 },
      { month: 'Mar', users: 1680, revenue: 245000 },
      { month: 'Apr', users: 1920, revenue: 280000 },
      { month: 'May', users: 2100, revenue: 315000 },
      { month: 'Jun', users: 2350, revenue: 350000 },
    ],
    skillDemand: [
      { skill: 'React', demand: 450, avgRate: 65 },
      { skill: 'Node.js', demand: 380, avgRate: 70 },
      { skill: 'Python', demand: 360, avgRate: 75 },
      { skill: 'TypeScript', demand: 340, avgRate: 68 },
      { skill: 'AWS', demand: 280, avgRate: 80 },
    ],
    userDistribution: [
      { name: 'Freelancers', value: 12500, color: '#8b5cf6' },
      { name: 'Companies', value: 2800, color: '#06b6d4' },
      { name: 'Admins', value: 120, color: '#f59e0b' },
    ]
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <Badge variant="outline" className="text-sm">
          📊 Real-time Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analyticsData.totalRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +18.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeProjects.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +8.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.platformGrowth}%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              +2.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="skills">Skill Demand</TabsTrigger>
          <TabsTrigger value="users">User Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--secondary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Top Skills in Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.skillDemand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="demand" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analyticsData.userDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;