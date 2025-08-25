import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [topSkills, setTopSkills] = useState<Array<any>>([]);
  const [marketTrends, setMarketTrends] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const [res, skills, trends] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getTopSkills().catch(() => []),
          analyticsService.getMarketTrends().catch(() => null),
        ]);
        setData(res);
        setTopSkills(skills || []);
        setMarketTrends(trends || null);
      } catch (e) {
        // fallback to empty
        setData(null);
        setTopSkills([]);
        setMarketTrends(null);
        console.error('Failed to load analytics summary', e);
      }
    })();
  }, []);

  const chartData = data
    ? [
        { name: 'Missions', value: data.totalMissions ?? 0 },
        { name: 'Active Contracts', value: data.activeContracts ?? data.activeProjects ?? 0 },
        { name: 'Completed', value: data.completedProjects ?? data.completedJobs ?? 0 },
        { name: 'Freelancers', value: data.totalFreelancers ?? data.totalUsers ?? 0 },
        { name: 'Earnings', value: data.totalEarnings ?? data.totalSpend ?? 0 },
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
                <div className="p-4 bg-muted rounded">Active Contracts<br/><strong className="text-2xl">{data.activeContracts ?? data.activeProjects ?? data.totalContracts ?? 0}</strong></div>
                <div className="p-4 bg-muted rounded">Users<br/><strong className="text-2xl">{data.totalUsers ?? data.totalFreelancers ?? 0}</strong></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded">Completed<br/><strong className="text-2xl">{data.completedProjects ?? data.completedJobs ?? 0}</strong></div>
                <div className="p-4 bg-muted rounded">Avg Rating<br/><strong className="text-2xl">{(data.averageRating ?? data.avgRating ?? 0).toFixed ? (data.averageRating ?? data.avgRating ?? 0).toFixed(1) : (data.averageRating ?? data.avgRating ?? 0)}</strong></div>
                <div className="p-4 bg-muted rounded">Earnings<br/><strong className="text-2xl">{data.totalEarnings ? `$${Number(data.totalEarnings).toLocaleString()}` : (data.totalSpend ? `$${Number(data.totalSpend).toLocaleString()}` : '—')}</strong></div>
              </div>

              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => (typeof value === 'number' ? value : value)} />
                    <Legend />
                    <Bar dataKey="value" name="Value" fill="#4f46e5" animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Skills and Market Trends panels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded">
                  <h3 className="font-semibold mb-2">Top Skills</h3>
                  {topSkills && topSkills.length > 0 ? (
                    <ul className="space-y-2">
                      {topSkills.slice(0, 10).map((s: any, i: number) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span>{s.skill}</span>
                          <span className="text-muted-foreground">{s.count ?? s.demand ?? '-'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">No skill data available.</div>
                  )}
                </div>

                <div className="p-4 bg-muted rounded">
                  <h3 className="font-semibold mb-2">Market Trends</h3>
                  {marketTrends ? (
                    <div className="space-y-3 text-sm">
                      {marketTrends.topSkills && marketTrends.topSkills.length > 0 && (
                        <div>
                          <div className="font-medium">Top Skills (trend)</div>
                          <ul className="mt-2 space-y-1">
                            {marketTrends.topSkills.slice(0, 6).map((t: any, idx: number) => (
                              <li key={idx} className="flex justify-between">
                                <span>{t.skill}</span>
                                <span className="text-muted-foreground">avg ${t.avgRate ?? 0}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {marketTrends.popularSectors && marketTrends.popularSectors.length > 0 && (
                        <div>
                          <div className="font-medium">Popular Sectors</div>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {marketTrends.popularSectors.slice(0, 6).map((p: any, idx: number) => (
                              <li key={idx}>{p.sector} — {p.jobCount} jobs</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No market trend data available.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
