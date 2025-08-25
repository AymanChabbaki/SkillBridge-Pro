import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { feedbackService } from '../../services/feedbackService';
import { Feedback } from '../../services/types';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';

const FeedbackList: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Feedback[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await feedbackService.getMyFeedback(p, 50);
      const list: Feedback[] = res.items || [];
      setItems(list);
      setPage(res.page || p);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Failed', description: e?.message || 'Could not load feedback' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  return (
    <div className="p-6">
      <Card className="animate-enter">
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No feedback yet.</div>
          ) : (
            <ul className="space-y-3">
        {items.map(i => (
                <li key={i.id} className="p-3 border rounded-md hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <div>
          <div className="text-sm font-semibold">{i.fromUser?.name || 'Anonymous'}</div>
                      <div className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm font-medium">{i.rating} ★</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{i.comment}</div>
                  {i.skills && (
                    <div className="mt-2 text-xs text-muted-foreground">Skills: {Object.entries(i.skills).map(([k,v]) => `${k}: ${v}`).join(', ')}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div />
          <div className="space-x-2">
            <Button onClick={() => { setPage(p => Math.max(1, p-1)); load(page-1); }} disabled={page === 1}>Prev</Button>
            <Button onClick={() => { setPage(p => p+1); load(page+1); }}>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FeedbackList;