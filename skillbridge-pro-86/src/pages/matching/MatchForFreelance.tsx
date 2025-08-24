import { useState, useEffect } from 'react';
import { matchingService } from '../../services/matchingService';
import { MatchResult } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const MatchForFreelance = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchingService.getMatchingMissions('');
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
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
      <h1 className="text-3xl font-bold">Recommended Missions</h1>
      
      {matches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No matching missions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">
                    {match.mission?.title}
                  </CardTitle>
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
                  {match.mission?.description}
                </p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Why this matches:</p>
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
                    ${match.mission?.budgetMin} - ${match.mission?.budgetMax}/day
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/missions/${match.mission?.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchForFreelance;