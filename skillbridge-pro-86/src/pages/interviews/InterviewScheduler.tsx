import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const InterviewScheduler = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interview Scheduler</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Interview scheduling will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewScheduler;