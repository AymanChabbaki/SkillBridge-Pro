import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { paymentService } from '../../services/paymentService';
import { milestoneService } from '../../services/milestoneService';
import { Payment, PaginatedResponse } from '../../services/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { useToast } from '../../hooks/use-toast';

const PaymentsPage = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [milestoneId, setMilestoneId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
    const [milestones, setMilestones] = useState<any[]>([]);
    const [milestonesError, setMilestonesError] = useState<string | null>(null);
  const [contractFilter, setContractFilter] = useState<string>('');
    const { user } = useSelector((state: RootState) => state.auth);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPaymentHistory(contractFilter || undefined);
      setPayments(res.items || []);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to load payments' });
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async () => {
    setMilestonesError(null);
    try {
      if (!user) {
        setMilestones([]);
        setMilestonesError('Sign in to load milestones');
        return;
      }
      const res = await milestoneService.getMilestones({ contractId: contractFilter || undefined, limit: 100 });
      // res is expected to be a paginated response { items, total, page, limit, totalPages }
      const items = res.items || res.milestones || res;
      // Keep only unpaid or non-PAID milestones
      const unpaid = (items || []).filter((m: any) => m.status !== 'PAID');
      setMilestones(unpaid);
      if (unpaid.length > 0 && !milestoneId) setMilestoneId(unpaid[0].id);
    } catch (e: any) {
      console.warn('Failed to load milestones', e);
      setMilestones([]);
      setMilestonesError(e?.message || 'Failed to load milestones');
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to load milestones' });
    }
  };

  useEffect(() => {
  loadPayments();
  loadMilestones();
  }, [contractFilter]);

  const handlePay = async () => {
    if (!milestoneId) return toast({ variant: 'destructive', title: 'Missing', description: 'Provide milestone id' });
    setLoading(true);
    try {
      const payload: any = {};
      if (amount) payload.amount = amount;
      const res = await paymentService.processPayment(milestoneId, payload);
      toast({ title: 'Payment created', description: `Transaction ${res.transactionId}` });
      // reload history
      await loadPayments();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Make a payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm mb-1">Milestone</label>
              {milestonesError ? (
                <div className="text-sm text-muted-foreground">{milestonesError}</div>
              ) : milestones.length === 0 ? (
                <div className="text-sm text-muted-foreground">No unpaid milestones found.</div>
              ) : (
                <select value={milestoneId} onChange={e => setMilestoneId(e.target.value)} className="w-full border rounded px-2 py-1">
                  {milestones.map(m => (
                    <option key={m.id} value={m.id}>{m.title} — {m.amount} € — {m.status}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Amount (override)</label>
              <Input type="number" value={amount as any} onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')} placeholder="amount" />
            </div>
            <div className="flex items-end">
              <Button onClick={handlePay} disabled={loading || !milestoneId || !user}>{loading ? 'Processing...' : 'Pay'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Input placeholder="Filter by contract id" value={contractFilter} onChange={e => setContractFilter(e.target.value)} />
            <Button onClick={() => loadPayments()}>Refresh</Button>
          </div>

          {loading && <div>Loading...</div>}

          {!loading && payments.length === 0 && <div className="text-muted-foreground">No payments found.</div>}

          {!loading && payments.length > 0 && (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>TX</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(p => (
                        <TableRow key={p.id}>
                          <TableCell>{p.milestoneId}</TableCell>
                          <TableCell>{p.amount}</TableCell>
                          <TableCell>{p.paymentMethod}</TableCell>
                          <TableCell>{p.status}</TableCell>
                          <TableCell>{(p.paidAt ?? p.createdAt) ? new Date((p.paidAt ?? p.createdAt) as string).toLocaleString() : '-'}</TableCell>
                          <TableCell>{p.transactionId}</TableCell>
                        </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
};

export default PaymentsPage;
