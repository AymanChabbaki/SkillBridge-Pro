import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getMyApplications({});
        setApplications(data.items);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Applications</h1>

      {Array.isArray(applications) && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1 flex items-center gap-2">
                    <span>{application.mission?.title || 'Mission Title'}</span>
                    {application.freelancer?.isCertified && (
                      <Badge variant="default" className="text-xs">
                        Certified
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge 
                    variant={
                      application.status === 'ACCEPTED' ? 'default' : 
                      application.status === 'REJECTED' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Proposed Rate</p>
                    <p className="font-medium">${application.proposedRate}/day</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied</p>
                    <p className="font-medium">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                  <p className="text-sm line-clamp-3">{application.coverLetter}</p>
                </div>

                {application.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{application.notes}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/missions/${application.missionId}`}>
                      <ExternalLink className="h-3 w-3 mr-2" />
                      View Mission
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No applications yet</p>
            <Button asChild>
              <Link to="/missions">
                Browse Missions
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyApplications;