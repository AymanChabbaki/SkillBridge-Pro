import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Props {
  open: boolean;
  onClose: () => void;
  onSchedule: (payload: { scheduledAt: string; duration: number; meetingLink?: string; coverLetter?: string; proposedRate?: number }) => void;
  defaultDate?: string;
}

const SchedulingModal = ({ open, onClose, onSchedule, defaultDate }: Props) => {
  const [date, setDate] = useState(defaultDate || '');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [meetingLink, setMeetingLink] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState<number | undefined>(undefined);

  const handleSubmit = () => {
    const iso = new Date(`${date}T${time}`).toISOString();
    onSchedule({ scheduledAt: iso, duration, meetingLink: meetingLink || undefined, coverLetter: coverLetter || undefined, proposedRate });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div>
            <Label>Meeting link (optional)</Label>
            <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
          </div>
          <div>
            <Label>Cover letter (optional)</Label>
            <Input value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
          </div>
          <div>
            <Label>Proposed rate (optional)</Label>
            <Input type="number" value={proposedRate ?? ''} onChange={(e) => setProposedRate(e.target.value ? Number(e.target.value) : undefined)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Send Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulingModal;
