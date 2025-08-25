import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { contractService } from '../../services/contractService';
import { Contract, Mission, FreelancerProfile, CompanyProfile } from '../../services/types';

type ContractWithRelations = Contract & {
  mission?: Mission;
  freelancer?: FreelancerProfile;
  company?: CompanyProfile;
};

const ContractDetail = () => {
  const { id } = useParams();
  const [contract, setContract] = useState<ContractWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await contractService.getContract(id);
        if (!mounted) return;
        setContract(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load contract');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contract Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading contract...</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && contract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Mission</h3>
                  <p className="font-semibold">{contract.mission?.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Freelancer</h3>
                  <p className="font-semibold">{contract.freelancer?.user?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Company</h3>
                  <p className="font-semibold">{contract.mission?.company?.name ?? contract.company?.name ?? '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="font-semibold">{contract.status}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Terms</h3>
                <p>{contract.terms?.scope}</p>
                {contract.terms?.deliverables && (
                  <ul className="list-disc ml-5 mt-2">
                    {contract.terms.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Milestones</h3>
                {contract.milestones.length === 0 && <p className="text-muted-foreground">No milestones yet.</p>}
                {contract.milestones.length > 0 && (
                  <div className="space-y-2">
                    {contract.milestones.map((m) => (
                      <Card key={m.id}>
                        <CardContent>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{m.title}</p>
                              <p className="text-sm text-muted-foreground">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '-'}</p>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium">{m.status}</p>
                              <p className="text-muted-foreground">€{m.amount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link to="/contracts" className="text-sm text-muted-foreground hover:underline">Back to contracts</Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractDetail;