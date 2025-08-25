import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { missionService } from '../../services/missionService';
import { applicationService } from '../../services/applicationService';
import { Mission } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Loader2, MapPin, Clock, DollarSign, Calendar, Building } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import MissionModal from '../../components/missions/MissionModal';

const MissionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState<number | ''>('');
  const [availabilityPlan, setAvailabilityPlan] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      if (!id) return;
      
      try {
        const data = await missionService.getMissionById(id);
        setMission(data);
      } catch (error) {
        console.error('Error fetching mission:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Mission Not Found</h2>
        <Button asChild>
          <Link to="/missions">Back to Missions</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{mission.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{mission.company?.name || 'Company'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Posted {new Date(mission.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Badge variant={mission.urgency === 'high' ? 'destructive' : 'secondary'}>
            {mission.urgency} priority
          </Badge>
          <Badge variant="outline">{mission.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mission Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{mission.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mission.requiredSkills.map((skill, index) => {
                  return (
                    <Badge key={index} variant="default">
                      {skill}
                    </Badge>
                  );
                })}
                </div>
            </CardContent>
          </Card>

          {mission.optionalSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nice to Have Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mission.optionalSkills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">${mission.budgetMin} - ${mission.budgetMax}/day</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{mission.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="capitalize">{mission.modality}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Starts {new Date(mission.startDate).toLocaleDateString()}</span>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Experience Level</p>
                <Badge variant="secondary" className="capitalize">
                  {mission.experience}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sector</p>
                <p className="font-medium">{mission.sector}</p>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'FREELANCE' && mission.status === 'PUBLISHED' && (
            <Card>
              <CardContent className="pt-6">
                    <Button className="w-full" size="lg" onClick={() => setShowApply(true)}>
                      Apply for this Mission
                    </Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'COMPANY' && (
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setOpenEdit(true)}>
                  Edit Mission
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to={`/applications/mission/${mission.id}`}>View Applications</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    <MissionModal open={openEdit} onOpenChange={setOpenEdit} missionId={mission.id} />

      {/* Apply Modal (simple inline modal) */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">{`Apply for "${mission.title}"`}</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Explain why you're a good fit (min 50 chars)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proposed Rate (per day)</label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. 400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Availability Plan</label>
                <textarea
                  value={availabilityPlan}
                  onChange={(e) => setAvailabilityPlan(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  placeholder="When can you start and how many hours per week?"
                />
              </div>

              {applyError && <p className="text-sm text-destructive">{applyError}</p>}

              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 rounded border" onClick={() => { setShowApply(false); setApplyError(null); }} disabled={applyLoading}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-primary text-white"
                  onClick={async () => {
                    setApplyError(null);
                    if (!mission) return;
                    if (coverLetter.trim().length < 50) {
                      setApplyError('Cover letter must be at least 50 characters');
                      return;
                    }
                    if (proposedRate === '' || Number(proposedRate) <= 0) {
                      setApplyError('Proposed rate must be a positive number');
                      return;
                    }

                    setApplyLoading(true);
                    try {
                      await applicationService.createApplication({
                        missionId: mission.id,
                        coverLetter: coverLetter.trim(),
                        proposedRate: Number(proposedRate),
                        availabilityPlan: availabilityPlan.trim() || 'Available',
                      });

                        setShowApply(false);
                        setCoverLetter('');
                        setProposedRate('');
                        setAvailabilityPlan('');
                        // show success toast and navigate
                        toast({ title: 'Application submitted', description: 'Your application was sent successfully.' });
                        navigate('/applications');
                    } catch (err: any) {
                      console.error('Apply error', err);
                      const msg = err?.message || 'Failed to submit application';
                      setApplyError(msg);
                      toast({ variant: 'destructive', title: 'Application failed', description: msg });
                    } finally {
                      setApplyLoading(false);
                    }
                  }}
                  disabled={applyLoading}
                >
                  {applyLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MissionDetail;