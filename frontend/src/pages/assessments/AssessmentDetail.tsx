import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AssessmentDetail = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Assessment Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Assessment details will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDetail;