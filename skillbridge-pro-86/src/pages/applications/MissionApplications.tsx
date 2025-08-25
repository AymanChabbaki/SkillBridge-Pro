import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { interviewService } from '../../services/interviewService';
import { contractService } from '../../services/contractService';
import { Application } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import InterviewModal from '../../components/interviews/InterviewModal';
import ContractModal from '../../components/contracts/ContractModal';

const MissionApplications: React.FC = () => {
  const { missionId } = useParams<{ missionId: string }>();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleFor, setScheduleFor] = useState<{ applicationId: string; missionId: string } | null>(null);
  const [contractFor, setContractFor] = useState<{ applicationId: string; freelancerId: string; missionId: string } | null>(null);
  const [contractOpen, setContractOpen] = useState(false);
  const [rescheduleFor, setRescheduleFor] = useState<{ interviewId: string; applicationId: string; missionId: string; initialDate?: string } | null>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Targeted cleanup to remove leftover Radix dialog overlay/portal elements that block pointer events
  const cleanupDialogOverlays = () => {
    try {
      // Remove overlay nodes inside Radix portals
      document.querySelectorAll('.radix-portal').forEach((portal) => {
        try {
          (portal as HTMLElement).querySelectorAll('[data-state="open"]').forEach((el) => {
            const cls = (el as HTMLElement).className || '';
            if (typeof cls === 'string' && cls.includes('bg-black/80') && cls.includes('fixed') && cls.includes('inset-0')) {
              el.remove();
            }
          });
          // also remove any overlay-like direct children
          (portal as HTMLElement).childNodes.forEach((child) => {
            if (child instanceof HTMLElement) {
              const cn = child.className || '';
              if (typeof cn === 'string' && cn.includes('bg-black/80') && cn.includes('fixed') && cn.includes('inset-0')) {
                child.remove();
              }
            }
          });
        } catch (e) { /* ignore per-portal errors */ }
      });

      // Remove any full-screen fixed overlays that match the dialog overlay pattern
      document.querySelectorAll('div').forEach((el) => {
        try {
          const cls = (el as HTMLElement).className || '';
          if (typeof cls === 'string' && cls.includes('bg-black/80') && cls.includes('fixed') && cls.includes('inset-0')) {
            el.remove();
          }
        } catch (e) { /* ignore */ }
      });

      // Remove any element with data-state="open" that covers the viewport
      document.querySelectorAll('[data-state="open"]').forEach((el) => {
        try {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (Math.abs(r.width - window.innerWidth) < 2 && Math.abs(r.height - window.innerHeight) < 2) {
            el.remove();
          }
        } catch (e) { /* ignore */ }
      });
    } catch (e) { /* ignore DOM cleanup errors */ }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!missionId) return;
      try {
        const data = await applicationService.getMissionApplications(missionId) as any;
        const items = Array.isArray(data) ? data : (data.items || []);
        setApplications(items);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

  fetchApplications();

  // defensive: reset any modal state when mission changes / component mounts
  setScheduleFor(null);
  setRescheduleFor(null);
  setContractOpen(false);
  // targeted cleanup of leftover overlays
  cleanupDialogOverlays();
  }, [missionId]);

  const handleStatusUpdate = async (applicationId: string, status: string, notes?: string) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status, notes);
      setApplications(apps => apps.map(a => a.id === applicationId ? { ...a, status: status as any, notes } : a));
      toast({ title: 'Success', description: 'Application status updated' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update application status' });
    }
  };

  const handleAcceptAndCreateContract = async (applicationId: string, freelancerId: string) => {
  // open contract creation modal to collect details
  setContractFor({ applicationId, freelancerId, missionId: missionId || '' });
  setContractOpen(true);
  };

  const handleSchedule = (applicationId: string, missionId: string) => setScheduleFor({ applicationId, missionId });

  const handleCreateInterview = async (scheduledAtIso: string) => {
    if (!scheduleFor) return;
    setInterviewLoading(true);
    try {
      const interview = await interviewService.scheduleInterview({
        applicationId: scheduleFor.applicationId,
        missionId: scheduleFor.missionId,
        scheduledAt: new Date(scheduledAtIso).toISOString(),
        duration: 30,
        meetingLink: ''
      } as any);

      await applicationService.updateApplicationStatus(scheduleFor.applicationId, 'INTERVIEW_SCHEDULED', 'Interview scheduled');

      setApplications(apps => apps.map(a => a.id === scheduleFor.applicationId ? { ...a, status: 'INTERVIEW_SCHEDULED', notes: 'Interview scheduled', interviews: [...(a.interviews || []), interview] } : a));

      toast({ title: 'Interview scheduled', description: 'Interview created and application updated.' });
    } catch (err) {
      console.error('Interview creation failed', err);
      toast({ variant: 'destructive', title: 'Failed', description: 'Could not schedule interview' });
    } finally {
      setInterviewLoading(false);
      setScheduleFor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mission Applications</h1>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No applications received yet</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      <span>{application.freelancer?.title || 'Freelancer Application'}</span>
                      {application.freelancer?.isCertified && (
                        <Badge variant="default" className="text-xs">Certified</Badge>
                      )}
                    </CardTitle>
                    <Badge variant={application.status === 'ACCEPTED' ? 'default' : application.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Proposed Rate</p>
                      <p className="font-medium">${application.proposedRate}/day</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applied</p>
                      <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <Badge variant="outline">{application.freelancer?.seniority || 'Not specified'}</Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                    <p className="text-sm">{application.coverLetter}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Availability Plan</p>
                    <p className="text-sm">{application.availabilityPlan}</p>
                  </div>

                  {application.freelancer?.skills && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {application.freelancer.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{skill.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(application.id, 'SHORTLISTED'); }} type="button">Shortlist</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(application.id, 'REJECTED'); }} type="button">Reject</Button>
                    </div>
                  )}

                  {application.status === 'SHORTLISTED' && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(application.id, 'ACCEPTED'); }} type="button">Accept</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(application.id, 'REJECTED'); }} type="button">Reject</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSchedule(application.id, missionId || ''); }} type="button">Schedule Interview</Button>
                    </div>
                  )}

                  {application.interviews && application.interviews.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Recent Interviews</p>
                      <div className="space-y-1 text-sm">
                        {application.interviews.slice(0,3).map((iv, idx) => (
                          <div key={iv.id} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{iv.completed ? 'Interview (completed)' : 'Interview (scheduled)'}</div>
                              <div className="text-muted-foreground">{new Date(iv.scheduledAt).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                      {!iv.completed && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setRescheduleFor({ interviewId: iv.id, applicationId: application.id, missionId: missionId || '', initialDate: iv.scheduledAt }); }} type="button">Reschedule</Button>}
                              {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Join</a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.status === 'INTERVIEW_COMPLETED' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAcceptAndCreateContract(application.id, application.freelancer?.id || ''); }} type="button">Accept</Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(application.id, 'REJECTED', 'Rejected after interview'); }} type="button">Reject</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <InterviewModal
            open={!!scheduleFor || !!rescheduleFor}
            onOpenChange={(o) => { if (!o) { setScheduleFor(null); setRescheduleFor(null); } }}
            applicationId={scheduleFor?.applicationId || rescheduleFor?.applicationId || ''}
            missionId={scheduleFor?.missionId || rescheduleFor?.missionId || ''}
            initialDate={rescheduleFor?.initialDate}
            onScheduled={async (iso) => {
              // if rescheduling, call update on interview
              if (rescheduleFor) {
                try {
                  setInterviewLoading(true);
                  await interviewService.updateInterview(rescheduleFor.interviewId, { scheduledAt: iso } as any);
                  // update local applications state
                  setApplications(apps => apps.map(a => a.id === rescheduleFor.applicationId ? { ...a, interviews: (a.interviews || []).map(iv => iv.id === rescheduleFor.interviewId ? { ...iv, scheduledAt: iso } : iv) } : a));
                  toast({ title: 'Rescheduled', description: 'Interview rescheduled.' });
                } catch (e) {
                  console.error('Reschedule failed', e);
                  toast({ variant: 'destructive', title: 'Error', description: 'Could not reschedule interview' });
                } finally {
                  setInterviewLoading(false);
                  setRescheduleFor(null);
                }
                return;
              }
              // normal schedule flow
              await handleCreateInterview(iso);
            }}
          />

          <ContractModal
            open={contractOpen}
            onOpenChange={(o) => { setContractOpen(o); if (!o) setContractFor(null); }}
            missionId={contractFor?.missionId || ''}
            freelancerId={contractFor?.freelancerId || ''}
            onCreate={async (data) => {
              if (!contractFor) return;
              try {
                setInterviewLoading(true);
                // Accept application first
                await applicationService.updateApplicationStatus(contractFor.applicationId, 'ACCEPTED');
                setApplications(apps => apps.map(a => a.id === contractFor.applicationId ? { ...a, status: 'ACCEPTED' } : a));
                // create contract with provided data
                // normalize deliverables field if it was sent as JSON string
                // @ts-ignore
                if (typeof (data.terms as any).deliverables === 'string') {
                  try { (data.terms as any).deliverables = JSON.parse((data.terms as any).deliverables); } catch (e) { /* leave as-is */ }
                }
                await contractService.createContract({ ...data, missionId: contractFor.missionId, freelancerId: contractFor.freelancerId });
                toast({ title: 'Accepted', description: 'Application accepted and contract created.' });
              } catch (err) {
                console.error('Accept/Create contract failed', err);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not accept application or create contract.' });
              } finally {
                setInterviewLoading(false);
                setContractOpen(false);
                setContractFor(null);
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default MissionApplications;