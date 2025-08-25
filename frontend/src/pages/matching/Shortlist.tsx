import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { shortlistService } from '../../services/shortlistService';
import { missionService } from '../../services/missionService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

const Shortlist = () => {
  const [items, setItems] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [missionObj, setMissionObj] = useState<any | null>(null);

  const load = async () => {
    try {
      const missionId = String(new URLSearchParams(window.location.search).get('missionId') || '');
      if (missionId) {
        try { setMissionObj(await missionService.getMissionById(missionId)); } catch (e) {}
      }

      if (missionObj?.company?.id) {
        const data = await shortlistService.list(missionObj.company.id, missionId);
        // normalize server response
        setItems((data || []).map((i: any) => ({ id: `${i.freelancer.id}`, candidate: { freelancer: i.freelancer, mission: i.mission }, createdAt: i.createdAt })));
      } else {
        const raw = localStorage.getItem('shortlist') || '[]';
        setItems(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load shortlist', e);
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    const missionId = String(new URLSearchParams(window.location.search).get('missionId') || '');
    if (missionObj?.company?.id) {
      try {
        await shortlistService.remove(missionObj.company.id, missionId, id);
        await load();
      } catch (e) {
        console.error('Failed to remove shortlist item', e);
      }
    } else {
      const next = items.filter(i => i.id !== id);
      setItems(next);
      localStorage.setItem('shortlist', JSON.stringify(next));
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const navigate = useNavigate();

  const openCandidate = (item: any) => {
    setSelected(item);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shortlist</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">No shortlisted candidates</CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4">
            <Button size="sm" onClick={load}>Refresh</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(i => (
              <Card key={i.id} className="hover:shadow">
                <CardHeader>
                  <CardTitle className="text-sm line-clamp-1">{i.candidate?.freelancer?.title || 'Candidate'}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Added {new Date(i.createdAt).toLocaleString()}</div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openCandidate(i)}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(i.id)}>Remove</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setSelected(null); setDialogOpen(o); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.candidate?.freelancer?.title || 'Candidate'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selected?.candidate?.freelancer?.bio || 'No bio available'}</p>
            <div className="flex flex-wrap gap-2">
              {(selected?.candidate?.freelancer?.skills || []).slice(0, 8).map((s: any, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-muted text-sm rounded">{s.name || s}</span>
              ))}
            </div>
            <div className="text-sm">Rate: ${selected?.candidate?.freelancer?.dailyRate || '—'}/day</div>
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <Button onClick={() => {
                // go to freelancer full profile — prefer freelancer profile id, fallback to user id
                const fid = selected?.candidate?.freelancer?.id || selected?.candidate?.freelancer?.user?.id || selected?.candidate?.freelancer?.userId || selected?.id;
                if (fid) {
                  setDialogOpen(false);
                  navigate(`/profile/freelancer/${fid}`);
                }
              }}>Open Profile</Button>
              <Button variant="outline" onClick={() => {
                // go to mission-find if available
                const missionIdFromCandidate = selected?.candidate?.mission?.id;
                const missionIdFromQuery = new URLSearchParams(window.location.search).get('missionId');
                const targetMissionId = missionIdFromCandidate || missionIdFromQuery;
                setDialogOpen(false);
                if (targetMissionId) navigate(`/matching/mission/${targetMissionId}/find`);
                else navigate('/matching/find');
              }}>Open in Find</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shortlist;
