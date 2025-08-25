import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { feedbackService } from '../../services/feedbackService';
import { useToast } from '../../hooks/use-toast';

const FeedbackForm: React.FC = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toUserId, setToUserId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [technical, setTechnical] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [timeliness, setTimeliness] = useState<number>(5);

  const submit = async () => {
    if (!toUserId) return toast({ variant: 'destructive', title: 'Missing recipient', description: 'Please provide a recipient user id' });
    if (message.trim().length === 0) return toast({ variant: 'destructive', title: 'Empty', description: 'Please add a comment' });
    setLoading(true);
    try {
      await feedbackService.createFeedback({
        toUserId,
        missionId: '',
        contractId: '',
        rating,
        comment: message,
        skills: { technical, communication, timeliness },
        isPublic: true,
      });
      setSubmitted(true);
      toast({ title: 'Thank you', description: 'Feedback submitted' });
      setMessage('');
      setToUserId('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e?.message || 'Failed to send feedback' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="animate-enter">
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-green-600">Thanks for your feedback.</div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">To User ID</label>
                <Input value={toUserId} onChange={e => setToUserId(e.target.value)} placeholder="recipient user id" />
              </div>
              <div>
                <label className="block text-sm mb-1">Rating</label>
                <Input type="number" min={1} max={5} value={rating} onChange={e => setRating(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Comment</label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm mb-1">Technical</label>
                  <Input type="number" min={1} max={5} value={technical} onChange={e => setTechnical(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Communication</label>
                  <Input type="number" min={1} max={5} value={communication} onChange={e => setCommunication(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Timeliness</label>
                  <Input type="number" min={1} max={5} value={timeliness} onChange={e => setTimeliness(Number(e.target.value))} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!submitted && (
            <Button onClick={submit} disabled={loading || message.trim().length === 0}>{loading ? 'Sending...' : 'Send Feedback'}</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FeedbackForm;
