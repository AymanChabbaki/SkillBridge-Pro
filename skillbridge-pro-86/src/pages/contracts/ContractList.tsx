import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { contractService } from '../../services/contractService';
import { Contract, Mission, FreelancerProfile, CompanyProfile } from '../../services/types';

// UI-level contract shape that may include relational fields when returned by the API
type ContractWithRelations = Contract & {
  mission?: Mission;
  freelancer?: FreelancerProfile;
  company?: CompanyProfile;
};

const ContractList = () => {
  const [contracts, setContracts] = useState<ContractWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await contractService.getContracts({ page: 1, limit: 50 });
        if (!mounted) return;
        setContracts(res.contracts || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load contracts');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contracts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Active Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading contracts...</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && contracts.length === 0 && (
            <p className="text-muted-foreground">No contracts found.</p>
          )}

          {!loading && contracts.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="p-2">#</th>
                    <th className="p-2">Mission</th>
                    <th className="p-2">Freelancer</th>
                    <th className="p-2">Company</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c, idx) => (
                    <tr key={c.id} className="border-b">
                      <td className="p-2 align-top">{idx + 1}</td>
                      <td className="p-2 align-top">{c.mission?.title}</td>
                      <td className="p-2 align-top">{c.freelancer?.user?.name}</td>
                      <td className="p-2 align-top">{c.mission?.company?.name ?? c.company?.name ?? '-'}</td>
                      <td className="p-2 align-top">{c.status}</td>
                      <td className="p-2 align-top">{c.startDate ? new Date(c.startDate).toLocaleDateString() : '-'}</td>
                      <td className="p-2 align-top">
                        <Link to={`/contracts/${c.id}`} className="text-primary hover:underline">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractList;