import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AssessmentSubmit = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Submit Assessment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Assessment submission will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentSubmit;