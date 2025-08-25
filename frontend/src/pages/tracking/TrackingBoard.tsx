import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../../components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { trackingService } from '../../services/trackingService';
import { profileService } from '../../services/profileService';
import { TrackingEntry, PaginatedResponse, FreelancerProfile } from '../../services/types';
import { useToast } from '../../hooks/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

const TrackingBoard = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginatedResponse<TrackingEntry> | null>(null);
  const [freelancerMap, setFreelancerMap] = useState<Record<string, FreelancerProfile | null>>({});
  const [approving, setApproving] = useState<Record<string, boolean>>({});

  const { user } = useSelector((state: RootState) => state.auth);

  const [logging, setLogging] = useState(false);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [logHours, setLogHours] = useState<number>(4);
  const [logDescription, setLogDescription] = useState<string>('');
  const [logDeliverable, setLogDeliverable] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!contractId) {
        // If no contractId in the route, fall back to fetching entries for the logged-in user
        try {
          const respMe = await trackingService.getTrackingEntries('for-me', page, limit as any);
          const itemsMe = Array.isArray((respMe as any)) ? (respMe as any) : respMe.items || [];
          setEntries(itemsMe);
          if (!(Array.isArray(respMe as any))) setPagination(respMe as PaginatedResponse<TrackingEntry>);
        } catch (err) {
          console.error('Failed to load /tracking/for-me', err);
        } finally {
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      try {
  const resp = await trackingService.getTrackingEntries(contractId, page, limit);
  let items = Array.isArray((resp as any)) ? (resp as any) : resp.items || [];
        setEntries(items);
        if (!(Array.isArray(resp as any))) setPagination(resp as PaginatedResponse<TrackingEntry>);
        const s = await trackingService.getProjectSummary(contractId);
        setSummary(s);
        // Fetch freelancer profiles for the listed entries
        // If the contract-specific fetch returned no items, try /tracking/for-me fallback
        if (items.length === 0) {
          try {
            const respMe = await trackingService.getTrackingEntries('for-me', page, limit as any);
            items = Array.isArray((respMe as any)) ? (respMe as any) : respMe.items || [];
            setEntries(items);
            if (!(Array.isArray(respMe as any))) setPagination(respMe as PaginatedResponse<TrackingEntry>);
          } catch (err) {
            console.error('Failed to load /tracking/for-me fallback', err);
          }
        }

        const freelancerIds = Array.from(new Set(items.map((it: any) => it.freelancerId).filter(Boolean)));
        if (freelancerIds.length > 0) {
          const profs = await Promise.all(freelancerIds.map((id: string) => profileService.getFreelancerById(id).catch(() => null)));
          const map: Record<string, FreelancerProfile | null> = {};
          freelancerIds.forEach((id: string, idx: number) => map[id] = profs[idx]);
          setFreelancerMap(map);
        }
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed loading tracking data' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [contractId, page]);

  const handleLogTime = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!contractId) {
      toast({ variant: 'destructive', title: 'No contract selected', description: 'Select a contract to log time.' });
      return;
    }

    setLogging(true);
    try {
      const payload = {
        date: logDate,
        hours: logHours,
        description: logDescription,
        deliverable: logDeliverable || undefined,
      };

      const created = await trackingService.logTime(contractId, payload as any);
      // Prepend created entry and refresh summary
      setEntries(prev => [created, ...prev]);
      const s = await trackingService.getProjectSummary(contractId);
      setSummary(s);
      setLogDescription('');
      setLogDeliverable('');
      toast({ title: 'Logged', description: 'Time entry created' });
    } catch (err: any) {
      console.error('Failed to log time', err);
      toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Failed to log time' });
    } finally {
      setLogging(false);
    }
  };

  const handleApprove = async (entryId: string) => {
    // optimistic update: mark approved locally, call API, revert on failure
    setApproving(prev => ({ ...prev, [entryId]: true }));
    const prevEntries = entries;
    setEntries(prevEntries => prevEntries.map(e => e.id === entryId ? { ...e, approved: true } : e));
    try {
      const updated = await trackingService.approveEntry(entryId);
      setEntries(prev => prev.map(e => e.id === entryId ? updated : e));
      toast({ title: 'Approved', description: 'Tracking entry approved' });
    } catch (e) {
      // revert
      setEntries(prevEntries);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve entry' });
    } finally {
      setApproving(prev => {
        const copy = { ...prev } as Record<string, boolean>;
        delete copy[entryId];
        return copy;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tracking Board</h1>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="font-medium">{summary.totalHours ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved Hours</p>
              <p className="font-medium">{summary.approvedHours ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Hours</p>
              <p className="font-medium">{summary.pendingHours ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="font-medium">${summary.totalEarnings ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log time form for freelancers when viewing a contract */}
      {contractId && user?.role === 'FREELANCE' && (
        <Card>
          <CardHeader>
            <CardTitle>Log Time</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogTime} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Hours</label>
                <input type="number" min={0.25} step={0.25} value={logHours} onChange={e => setLogHours(Number(e.target.value))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Description</label>
                <input value={logDescription} onChange={e => setLogDescription(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Work done / notes" />
              </div>
              <div className="flex gap-2">
                <input value={logDeliverable} onChange={e => setLogDeliverable(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Deliverable (optional)" />
                <Button type="submit" disabled={logging}>{logging ? 'Logging...' : 'Log'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-muted-foreground">No tracking entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.freelancerId ? (
                        <div className="flex items-center gap-2">
                          <img src={(entry as any).freelancerAvatar || freelancerMap[entry.freelancerId]?.user?.avatar || '/avatar-placeholder.png'} alt="avatar" className="h-6 w-6 rounded-full" />
                            <span>{(entry as any).freelancerName || freelancerMap[entry.freelancerId]?.user?.name || entry.freelancerId}</span>
                        </div>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.approved ? 'Approved' : 'Pending'}</TableCell>
                    <TableCell>
                      {!entry.approved && user?.role === 'COMPANY' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" disabled={!!approving[entry.id]}>Approve</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve time entry</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to approve this tracking entry? This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApprove(entry.id)}>Approve</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} — {pagination.total} entries
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm text-muted-foreground">Page size:</label>
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <Button size="sm" disabled={pagination.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <Button size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}>Next</Button>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Jump to:</label>
              <input type="number" min={1} max={pagination.totalPages} defaultValue={pagination.page} onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = Number((e.target as HTMLInputElement).value || 1);
                  setPage(Math.min(Math.max(1, val), pagination.totalPages));
                }
              }} className="w-16 border rounded px-2 py-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingBoard;