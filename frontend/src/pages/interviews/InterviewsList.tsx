import { useEffect, useState } from 'react';
import { interviewService } from '../../services/interviewService';
import { applicationService } from '../../services/applicationService';
import { Interview, Application } from '../../services/types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';

const InterviewsList = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [applicationsById, setApplicationsById] = useState<Record<string, Application | null>>({});
  const [appLoading, setAppLoading] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    interviewService.getUpcoming()
      .then(setInterviews)
      .finally(() => setLoading(false));
  }, []);

  const renderCandidate = (i: Interview) => {
    const app = applicationsById[i.applicationId];
    const loadingApp = appLoading[i.applicationId];

    if (loadingApp) return <div className="text-sm text-muted-foreground">Loading candidate…</div>;

    if (!app) return <div className="text-sm text-muted-foreground">Candidate unknown</div>;

    const freelancer = app.freelancer;
    if (!freelancer) return <div className="text-sm text-muted-foreground">Candidate unknown</div>;

    return (
      <div className="flex items-center gap-3">
        <Avatar>
          {freelancer.user?.avatar ? <AvatarImage src={freelancer.user.avatar} alt={freelancer.user.name} /> : <AvatarFallback>{(freelancer.user?.name || 'U').slice(0,1)}</AvatarFallback>}
        </Avatar>
        <div>
          <div className="font-medium">{freelancer.user?.name || freelancer.user?.email || freelancer.user?.id}</div>
          <div className="text-sm text-muted-foreground">{freelancer.title || freelancer.seniority}</div>
        </div>
      </div>
    );
  };

  // fetch related application for each interview (cached)
  useEffect(() => {
    interviews.forEach((it) => {
      const appId = it.applicationId;
      if (applicationsById[appId] !== undefined) return; // already fetched or null

      setAppLoading(s => ({ ...s, [appId]: true }));
      applicationService.getApplicationById(appId)
        .then((app) => {
          setApplicationsById(s => ({ ...s, [appId]: app }));
        })
        .catch(() => {
          setApplicationsById(s => ({ ...s, [appId]: null }));
        })
        .finally(() => setAppLoading(s => ({ ...s, [appId]: false })));
    });
  }, [interviews]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upcoming Interviews</h1>

      {loading && <p>Loading…</p>}

      {!loading && interviews.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No upcoming interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You have no scheduled interviews.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviews.map(i => (
          <Card key={i.id}>
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-base">{(i as any).mission?.title || `Interview — ${i.id.slice(0, 6)}`}</CardTitle>
                <div className="text-sm text-muted-foreground">{new Date(i.scheduledAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={i.completed ? 'default' : 'secondary'}>{i.completed ? 'Completed' : 'Scheduled'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {renderCandidate(i)}
                  <p className="mt-3 text-sm"><strong>Application:</strong> {i.applicationId}</p>
                  <p className="text-sm"><strong>Duration:</strong> {i.duration} min</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {i.meetingLink && <a href={i.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Join</a>}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => navigate(`/interviews/${i.id}`)}>View</Button>
                    {i.meetingLink && <Button size="sm" variant="outline" asChild><a href={i.meetingLink} target="_blank" rel="noreferrer">Open</a></Button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InterviewsList;
