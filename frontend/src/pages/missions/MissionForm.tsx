import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { missionService } from '../../services/missionService';
import { CreateMissionRequest, Mission } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const missionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requiredSkills: z.string().min(1, 'At least one required skill is needed'),
  optionalSkills: z.string(),
  budgetMin: z.number().min(1, 'Minimum budget must be greater than 0'),
  budgetMax: z.number().min(1, 'Maximum budget must be greater than 0'),
  duration: z.string().min(1, 'Duration is required'),
  modality: z.enum(['remote', 'onsite', 'hybrid']),
  sector: z.string().min(1, 'Sector is required'),
  urgency: z.enum(['low', 'medium', 'high']),
  experience: z.enum(['junior', 'mid', 'senior', 'lead']),
  startDate: z.string().min(1, 'Start date is required'),
});

type MissionForm = z.infer<typeof missionSchema>;

interface MissionFormProps {
  missionId?: string;
  onSaved?: (mission: Mission) => void;
  onClose?: () => void;
}

const MissionForm = ({ missionId, onSaved, onClose }: MissionFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { id: routeId } = useParams<{ id: string }>();
  const id = missionId || routeId;
  const isEdit = Boolean(id);
  const [fetching, setFetching] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<MissionForm>({
    resolver: zodResolver(missionSchema),
  });

  const onSubmit = async (data: MissionForm) => {
    setLoading(true);
    try {
      const processedData: CreateMissionRequest = {
        title: data.title,
        description: data.description,
        sector: data.sector,
        duration: data.duration,
        modality: data.modality!,
        urgency: data.urgency!,
        experience: data.experience!,
        startDate: data.startDate,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        requiredSkills: data.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        optionalSkills: data.optionalSkills ? data.optionalSkills.split(',').map(s => s.trim()).filter(s => s) : []
      };

      if (isEdit && id) {
        const updated = await missionService.updateMission(id, processedData);
        toast({ title: 'Success', description: 'Mission updated successfully' });
        if (onSaved) onSaved(updated);
        if (onClose) onClose();
        // navigate only when used as a standalone page
        if (!missionId) navigate(`/missions/${id}`);
      } else {
        const created = await missionService.createMission(processedData);
        toast({ title: 'Success', description: 'Mission created successfully' });
        if (onSaved) onSaved(created);
        if (onClose) onClose();
        if (!missionId) navigate('/missions');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: isEdit ? 'Failed to update mission' : 'Failed to create mission'
      });
    } finally {
      setLoading(false);
    }
  };

  // If we're in edit mode, fetch mission data and populate the form
  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      setFetching(true);
      try {
        const mission = await missionService.getMissionById(id);
        if (mission) {
          // populate fields
          setValue('title', mission.title);
          setValue('description', mission.description || '');
          setValue('sector', mission.sector || '');
          setValue('duration', mission.duration || '');
          setValue('modality', mission.modality as any);
          setValue('urgency', mission.urgency as any);
          setValue('experience', mission.experience as any);
          setValue('startDate', mission.startDate ? mission.startDate.split('T')[0] : '');
          setValue('budgetMin', mission.budgetMin);
          setValue('budgetMax', mission.budgetMax);
          setValue('requiredSkills', (mission.requiredSkills || []).join(', '));
          setValue('optionalSkills', (mission.optionalSkills || []).join(', '));
        }
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load mission for editing' });
        navigate('/missions');
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{isEdit ? 'Edit Mission' : 'Post New Mission'}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Mission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fetching && (
              <div className="text-center py-6 text-muted-foreground">Loading mission...</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Mission Title</Label>
              <Input
                id="title"
                placeholder="e.g. Senior React Developer"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the mission, requirements, and expectations..."
                rows={6}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  placeholder="e.g. Fintech, E-commerce"
                  {...register('sector')}
                />
                {errors.sector && (
                  <p className="text-sm text-destructive">{errors.sector.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 3-6 months"
                  {...register('duration')}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Modality</Label>
                <Controller
                  control={control}
                  name="modality"
                  render={({ field: { value, onChange } }) => (
                    <Select onValueChange={(v) => onChange(v)} defaultValue={value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Controller
                  control={control}
                  name="experience"
                  render={({ field: { value, onChange } }) => (
                    <Select onValueChange={(v) => onChange(v)} defaultValue={value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Controller
                  control={control}
                  name="urgency"
                  render={({ field: { value, onChange } }) => (
                    <Select onValueChange={(v) => onChange(v)} defaultValue={value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Min Budget ($/day)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="300"
                  {...register('budgetMin', { valueAsNumber: true })}
                />
                {errors.budgetMin && (
                  <p className="text-sm text-destructive">{errors.budgetMin.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Max Budget ($/day)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="600"
                  {...register('budgetMax', { valueAsNumber: true })}
                />
                {errors.budgetMax && (
                  <p className="text-sm text-destructive">{errors.budgetMax.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills</Label>
              <Input
                id="requiredSkills"
                placeholder="React, TypeScript, Node.js (comma separated)"
                {...register('requiredSkills')}
              />
              <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
              {errors.requiredSkills && (
                <p className="text-sm text-destructive">{errors.requiredSkills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="optionalSkills">Optional Skills (Nice to have)</Label>
              <Input
                id="optionalSkills"
                placeholder="AWS, Docker, GraphQL (comma separated)"
                {...register('optionalSkills')}
              />
              <p className="text-xs text-muted-foreground">Separate multiple skills with commas</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || fetching}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Mission' : 'Create Mission'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/missions')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionForm;