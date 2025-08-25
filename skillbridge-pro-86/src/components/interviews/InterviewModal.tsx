import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import DatePicker from 'react-datepicker';
import { zonedTimeToUtc } from 'date-fns-tz';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  missionId: string;
  onScheduled?: (scheduledAt: string) => void;
  // when rescheduling, initialDate will be populated (ISO string)
  initialDate?: string;
  // optional interview id when rescheduling
  interviewId?: string;
}

const InterviewModal: React.FC<Props> = ({ open, onOpenChange, applicationId, missionId, onScheduled, initialDate }) => {
  const [date, setDate] = useState<Date | null>(initialDate ? new Date(initialDate) : null);
  const [timezone, setTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [mode, setMode] = useState('online');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // when the modal opens with a different initial date, update local state
  React.useEffect(() => {
    if (initialDate) {
      setDate(new Date(initialDate));
    }
    if (!initialDate && !open) {
      // clear when closing
      setDate(null);
      setNotes('');
    }
  }, [initialDate, open]);

  const handleSubmit = async () => {
    if (!date) return;
    setLoading(true);
    try {
      // Convert selected date in timezone to UTC ISO string for backend
      const utcDate = zonedTimeToUtc(date, timezone);
      const iso = utcDate.toISOString();
      onScheduled && onScheduled(iso);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>Pick a date and time for the interview.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm mb-1">Date & Time</label>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d as Date)}
              showTimeSelect
              timeIntervals={15}
              dateFormat="Pp"
              className="w-full border rounded px-2 py-1"
            />
            <div className="mt-2">
              <label className="block text-sm mb-1">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full border rounded px-2 py-1">
                <option value={Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="online">Online</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full border rounded px-2 py-1" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !date}>{loading ? 'Scheduling...' : 'Schedule'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewModal;
