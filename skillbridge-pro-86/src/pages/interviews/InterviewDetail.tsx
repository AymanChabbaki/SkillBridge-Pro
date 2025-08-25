import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { interviewService } from '../../services/interviewService';
import { useToast } from '../../hooks/use-toast';
import { Interview } from '../../services/types';

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    interviewService.getInterview(id)
      .then((res) => {
        setInterview(res);
        setNotes(res.notes || '');
        setRating(res.rating);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const saveNotes = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const updated = await interviewService.updateInterviewNotes(id, notes, rating);
      setInterview(updated);
      toast({ title: 'Saved', description: 'Notes saved' });
    } catch (e) {
      console.error('Save notes failed', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save notes' });
    } finally {
      setLoading(false);
    }
  };

  const complete = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Save notes first (best-effort)
      if (notes) {
        try { await interviewService.updateInterviewNotes(id, notes, rating); } catch (e) { /* continue */ }
      }

      const updated = await interviewService.completeInterview(id, rating ?? 0, notes);
      setInterview(updated);
      toast({ title: 'Interview completed', description: 'Interview marked as completed' });

      // Redirect to mission applications to allow accept/reject flow
      const missionId = (updated as any).application?.mission?.id || (interview as any)?.application?.mission?.id;
      if (missionId) {
        navigate(`/applications/mission/${missionId}`);
      }
    } catch (e) {
      console.error('Complete interview failed', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to complete interview' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !interview) return <p>Loading…</p>;

  if (!interview) return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interview Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Interview not found.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interview Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>Interview — {interview.id.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>When:</strong> {new Date(interview.scheduledAt).toLocaleString()}</p>
          <p><strong>Application:</strong> {interview.applicationId}</p>
          <p><strong>Meeting link:</strong> {interview.meetingLink || '—'}</p>
          <p><strong>Duration:</strong> {interview.duration} minutes</p>
          <div className="mt-4">
            <label className="block text-sm mb-1">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="mt-4">
            <label className="block text-sm mb-1">Rating (1-5)</label>
            <Input type="number" min={1} max={5} value={rating ?? ''} onChange={(e) => setRating(Number(e.target.value))} />
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
            <Button onClick={saveNotes} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            <Button onClick={complete} disabled={loading || interview.completed}>{loading ? '...' : (interview.completed ? 'Completed' : 'Mark Complete')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewDetail;