import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MissionModal from '../../components/missions/MissionModal';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { missionService } from '../../services/missionService';
import { Mission } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Loader2, Plus, Search, MapPin, Clock, DollarSign } from 'lucide-react';

const MissionList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const data = await missionService.getMissions({});
        setMissions(data.items);
      } catch (error) {
        console.error('Error fetching missions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  const filteredMissions = Array.isArray(missions) ? missions.filter(mission =>
    mission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mission.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Missions</h1>
        {user?.role === 'COMPANY' && (
          <>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Post Mission
            </Button>
            <MissionModal open={open} onOpenChange={setOpen} />
          </>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search missions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredMissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No missions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMissions.map((mission) => (
            <Card key={mission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{mission.title}</CardTitle>
                  <Badge variant={mission.urgency === 'high' ? 'destructive' : 'secondary'}>
                    {mission.urgency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {mission.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {mission.requiredSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mission.requiredSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mission.requiredSkills.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${mission.budgetMin} - ${mission.budgetMax}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{mission.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{mission.modality}</span>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/missions/${mission.id}`}>View Details</Link>
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

export default MissionList;