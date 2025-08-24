import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsService.getSummary();
        setData(res);
      } catch (e) {
        // fallback to empty
        setData(null);
        console.error('Failed to load analytics summary', e);
      }
    })();
  }, []);

  const chartData = data
    ? [
        { name: 'Missions', value: data.totalMissions ?? data.totalMissions ?? 0 },
        { name: 'Contracts', value: data.totalContracts ?? 0 },
        { name: 'Freelancers', value: data.totalFreelancers ?? data.totalUsers ?? 0 },
      ]
    : [];

  return (
    <div className="p-6">
      <Card className="animate-enter">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
      {!data && <div>Loading...</div>}
      {data && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded">Missions<br/><strong className="text-2xl">{data.totalMissions ?? 0}</strong></div>
        <div className="p-4 bg-muted rounded">Contracts<br/><strong className="text-2xl">{data.totalContracts ?? 0}</strong></div>
        <div className="p-4 bg-muted rounded">Users<br/><strong className="text-2xl">{data.totalUsers ?? 0}</strong></div>
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4f46e5" animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
