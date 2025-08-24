import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { Application } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const MissionApplications = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!missionId) return;
      
      try {
        const data = await applicationService.getMissionApplications(missionId) as any;
        // support both legacy array and new paginated response
        const items = Array.isArray(data) ? data : (data.items || []);
        setApplications(items);
        if (!Array.isArray(data)) setPagination({ total: data.total, page: data.page, limit: data.limit });
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [missionId]);

  const handleStatusUpdate = async (applicationId: string, status: string, notes?: string) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status, notes);
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, status: status as any, notes } 
            : app
        )
      );
      toast({
        title: "Success",
        description: "Application status updated"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update application status"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mission Applications</h1>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No applications received yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <span>{application.freelancer?.title || 'Freelancer Application'}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <Badge variant="outline">
                      {application.freelancer?.seniority || 'Not specified'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                  <p className="text-sm">{application.coverLetter}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Availability Plan</p>
                  <p className="text-sm">{application.availabilityPlan}</p>
                </div>

                {application.freelancer?.skills && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {application.freelancer.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {application.status === 'PENDING' && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(application.id, 'SHORTLISTED')}
                    >
                      Shortlist
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {application.status === 'SHORTLISTED' && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(application.id, 'ACCEPTED')}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusUpdate(application.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MissionApplications;