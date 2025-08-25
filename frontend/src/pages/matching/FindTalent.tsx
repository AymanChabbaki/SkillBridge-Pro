import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { useParams, useNavigate } from 'react-router-dom';
import { matchingService } from '../../services/matchingService';
import { missionService } from '../../services/missionService';
import { interviewService } from '../../services/interviewService';
import { MatchResult } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2, User, Star } from 'lucide-react';
import { formatISO } from 'date-fns';
import SchedulingModal from '../../components/matching/SchedulingModal';
import { useToast } from '../../components/ui/use-toast';
import { shortlistService } from '../../services/shortlistService';

const FindTalent = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [missionSkills, setMissionSkills] = useState<string[]>([]);
  const [missionObj, setMissionObj] = useState<any | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [shortlist, setShortlist] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('shortlist') || '[]'); } catch { return []; }
  });
  const [selectedCandidate, setSelectedCandidate] = useState<MatchResult | null>(null);
  const [removedIds, setRemovedIds] = useState<Record<string, true>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!missionId) return;
      try {
        const data = await matchingService.getMatchingFreelancers(missionId, 50);

        // fetch mission to know required skills
        try {
          const m = await missionService.getMissionById(missionId);
          setMissionObj(m);
          const req = (m.requiredSkills || []).map((s: string) => s.toLowerCase());
          setMissionSkills(req);

          // filter matches client-side to ensure skill overlap
          const filtered = (data || []).filter((match) => {
            const skills = (match.freelancer?.skills || []).map((sk: any) => (sk.name || '').toLowerCase());
            const overlap = skills.some((s: string) => req.includes(s) || req.some(r => s.includes(r) || r.includes(s)));
            return overlap;
          });

          setMatches(filtered);
        } catch (e) {
          // fallback to raw matches
          setMatches(data);
        }
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to load matches' });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [missionId]);

  const current = matches[index];

  const handleDislike = () => {
    if (index + 1 < matches.length) setIndex(i => i + 1);
  };

  const handleLike = async () => {
    if (!current || !missionId) return;
    // open scheduling modal to pick time/duration/cover letter
    setSelectedCandidate(current);
    setModalOpen(true);
  };

  const handleShortlist = (candidate: MatchResult) => {
  const id = candidate.freelancer!.id;
  const entry = { id, candidate, createdAt: new Date().toISOString() };

  // If company user, persist server-side, otherwise fallback to localStorage
  if ((user as any)?.role === 'COMPANY' && missionObj?.company?.id) {
  shortlistService.add({ companyId: missionObj.company.id, missionId: missionId!, freelancerId: id }).then(() => {
      toast({ title: 'Shortlisted', description: `${candidate.freelancer?.title || 'Candidate'} added to shortlist` });
    }).catch((err) => {
      console.error('Shortlist add failed', err);
      toast({ title: 'Error', description: 'Failed to add to shortlist' });
    });
  } else {
    const next = [entry, ...shortlist.filter(s => s.id !== entry.id)];
    setShortlist(next);
    localStorage.setItem('shortlist', JSON.stringify(next));
    toast({ title: 'Shortlisted', description: `${candidate.freelancer?.title || 'Candidate'} added to shortlist` });
  }

  // mark removed so it won't reappear and remove from deck
  setRemovedIds(prev => ({ ...prev, [id]: true }));
  setMatches(prev => prev.filter((m) => m.freelancer!.id !== id));
  setIndex(0);
  };

  const handleModalSchedule = async (payload: { scheduledAt: string; duration: number; meetingLink?: string; coverLetter?: string; proposedRate?: number }) => {
    if (!selectedCandidate || !missionId) return;
    setScheduling(true);
    try {
      const interview = await interviewService.inviteInterview({
        missionId,
        freelancerId: selectedCandidate.freelancer!.id,
        scheduledAt: payload.scheduledAt,
        duration: payload.duration,
        meetingLink: payload.meetingLink,
        coverLetter: payload.coverLetter,
        proposedRate: payload.proposedRate,
      });

      toast({ title: 'Interview sent', description: `Interview scheduled with ${selectedCandidate.freelancer?.title || 'freelancer'}` });
      const id = selectedCandidate.freelancer!.id;
      // remove candidate from deck and mark removed
      setMatches(prev => prev.filter((m) => m.freelancer!.id !== id));
      setRemovedIds(prev => ({ ...prev, [id]: true }));
      // remove from shortlist storage if present
      try {
        const stored = JSON.parse(localStorage.getItem('shortlist') || '[]');
        const filtered = stored.filter((s: any) => s.id !== id);
        localStorage.setItem('shortlist', JSON.stringify(filtered));
        setShortlist(filtered);
      } catch (e) {}
      setSelectedCandidate(null);
      setModalOpen(false);
      navigate(`/interviews/${interview.id}`);
    } catch (err: any) {
      console.error('Invite failed', err);
      toast({ title: 'Error', description: err?.message || 'Failed to invite freelancer' });
    } finally {
      setScheduling(false);
    }
  };

  if (loading) return (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>);

  if (!current) return (<div className="space-y-6"><h1 className="text-2xl font-bold">Find Talent</h1><Card><CardContent className="text-center py-12">No more candidates</CardContent></Card></div>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find Talent</h1>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle className="line-clamp-1">{current.freelancer?.title || 'Freelancer'}</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{Math.round(current.matchScore)}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm line-clamp-3">{current.freelancer?.bio || 'No bio available'}</p>

            <div className="space-y-2">
              <p className="text-sm font-medium">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {current.freelancer?.skills?.slice(0, 6).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">{skill.name}</Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-muted-foreground">${current.freelancer?.dailyRate || '—'}/day</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleDislike}>Skip</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleShortlist(current)}>Shortlist</Button>
                    <Button size="sm" onClick={handleLike} disabled={scheduling || modalOpen}>{scheduling ? 'Sending…' : 'Like & Invite'}</Button>
                  </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
      <SchedulingModal open={modalOpen} onClose={() => setModalOpen(false)} onSchedule={handleModalSchedule} />
};

export default FindTalent;
