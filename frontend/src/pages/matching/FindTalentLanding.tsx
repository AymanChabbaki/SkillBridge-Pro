import { useEffect, useState } from 'react';
import { missionService } from '../../services/missionService';
import { Mission } from '../../services/types';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';

const FindTalentLanding = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await missionService.getMissions({ limit: 50 });
        setMissions(res.items || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find Talent</h1>
      {missions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">No missions found. Create a mission first.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.map((m) => (
            <Card key={m.id} className="hover:shadow">
              <CardHeader>
                <CardTitle className="text-sm line-clamp-1">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">{m.sector || ''}</div>
                <Link to={`/matching/mission/${m.id}/find`}>
                  <Button size="sm">Find Talent</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindTalentLanding;
