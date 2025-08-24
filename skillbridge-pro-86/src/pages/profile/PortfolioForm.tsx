import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileService } from '../../services/profileService';
import { CreatePortfolioRequest, PortfolioItem } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.string().min(1, 'At least one technology is required'),
  liveUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  demoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  impact: z.string().optional(),
  duration: z.string().optional(),
  teamSize: z.number().optional()
});

type PortfolioForm = z.infer<typeof portfolioSchema>;

const PortfolioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PortfolioForm>({
    resolver: zodResolver(portfolioSchema),
  });

  useEffect(() => {
    if (id) {
      const fetchPortfolioItem = async () => {
        try {
          const portfolio = await profileService.getPortfolio();
          const item = portfolio.find((p: PortfolioItem) => p.id === id);
          if (item) {
            setValue('title', item.title);
            setValue('description', item.description);
            setValue('technologies', item.technologies.join(', '));
            
            // Set individual link URLs
            const liveLink = item.links.find(l => l.type === 'live');
            const githubLink = item.links.find(l => l.type === 'github');
            const demoLink = item.links.find(l => l.type === 'demo');
            
            if (liveLink) setValue('liveUrl', liveLink.url);
            if (githubLink) setValue('githubUrl', githubLink.url);
            if (demoLink) setValue('demoUrl', demoLink.url);
            
            setValue('impact', item.impact || '');
            setValue('duration', item.duration || '');
            setValue('teamSize', item.teamSize || undefined);
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load portfolio item"
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchPortfolioItem();
    }
  }, [id, setValue, toast]);

  const onSubmit = async (data: PortfolioForm) => {
    setLoading(true);
    try {
      const links = [];
      if (data.liveUrl) links.push({ type: 'live' as const, url: data.liveUrl });
      if (data.githubUrl) links.push({ type: 'github' as const, url: data.githubUrl });
      if (data.demoUrl) links.push({ type: 'demo' as const, url: data.demoUrl });

      const portfolioData: CreatePortfolioRequest = {
        title: data.title,
        description: data.description,
        technologies: data.technologies.split(',').map(t => t.trim()).filter(t => t),
        links,
        impact: data.impact,
        duration: data.duration,
        teamSize: data.teamSize
      };

      if (id) {
        await profileService.updatePortfolioItem(id, portfolioData);
        toast({
          title: "Success",
          description: "Portfolio item updated successfully"
        });
      } else {
        await profileService.createPortfolioItem(portfolioData);
        toast({
          title: "Success",
          description: "Portfolio item created successfully"
        });
      }
      navigate('/profile/portfolio');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save portfolio item"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        {id ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter project title"
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
                placeholder="Describe your project..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies Used</Label>
              <Input
                id="technologies"
                placeholder="React, TypeScript, Node.js (comma separated)"
                {...register('technologies')}
              />
              <p className="text-xs text-muted-foreground">Separate multiple technologies with commas</p>
              {errors.technologies && (
                <p className="text-sm text-destructive">{errors.technologies.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Project Links</Label>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liveUrl">Live URL</Label>
                  <Input
                    id="liveUrl"
                    placeholder="https://your-project.com"
                    {...register('liveUrl')}
                  />
                  {errors.liveUrl && (
                    <p className="text-sm text-destructive">{errors.liveUrl.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/username/repo"
                    {...register('githubUrl')}
                  />
                  {errors.githubUrl && (
                    <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="demoUrl">Demo URL</Label>
                  <Input
                    id="demoUrl"
                    placeholder="https://demo-link.com"
                    {...register('demoUrl')}
                  />
                  {errors.demoUrl && (
                    <p className="text-sm text-destructive">{errors.demoUrl.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 3 months"
                  {...register('duration')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  placeholder="1"
                  {...register('teamSize', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact/Results</Label>
              <Textarea
                id="impact"
                placeholder="What impact did this project have?"
                rows={3}
                {...register('impact')}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  id ? 'Update Project' : 'Add Project'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile/portfolio')}
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

export default PortfolioForm;