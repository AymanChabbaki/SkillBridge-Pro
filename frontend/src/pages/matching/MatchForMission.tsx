import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { matchingService } from '../../services/matchingService';
import { MatchResult } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2, Star, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { profileService } from '../../services/profileService';

const MatchForMission = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!missionId) return;
      
      try {
        const data = await matchingService.getMatchingFreelancers(missionId);
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [missionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recommended Freelancers</h1>
      
      {matches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No matching freelancers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <CardTitle className="line-clamp-1">
                      {match.freelancer?.title || 'Freelancer'}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">
                      {Math.round(match.matchScore)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {match.freelancer?.bio || 'No bio available'}
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {match.freelancer?.skills?.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Match reasons:</p>
                  <div className="flex flex-wrap gap-1">
                    {match.matchReasons.map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">
                    ${match.freelancer?.dailyRate || 'Rate not set'}/day
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                    {/** show download only to company users */}
                    {((useSelector as any)((state: RootState) => state.auth).user)?.role === 'COMPANY' && (
                      <Button size="sm" variant="secondary" onClick={async () => {
                        try {
                          const blob = await profileService.downloadCv(String(match.freelancer?.user?.id));
                          const url = window.URL.createObjectURL(blob as any);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${match.freelancer?.user?.name || 'cv'}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Download CV failed', err);
                          alert('CV not available');
                        }
                      }}>
                        Download CV
                      </Button>
                    )}
                    <Button size="sm">
                      Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchForMission;