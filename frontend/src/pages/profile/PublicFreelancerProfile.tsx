import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { FreelancerProfile } from '../../services/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, MapPin, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

const PublicFreelancerProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state: RootState) => state.auth);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!id) return;
        // Request increment since this is a public view
        const data = await profileService.getFreelancerByIdWithIncrement(id).catch(() => null) || await profileService.getFreelancerById(id);
        setProfile(data);
      } catch (e) {
        console.error('Failed to load freelancer profile', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">Freelancer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Download CV button for companies */}
      {profile && (
        <div className="flex justify-end">
          <CompanyCvDownload profile={profile} />
        </div>
      )}
      <h1 className="text-3xl font-bold">{profile.user?.name || profile.title || 'Freelancer'}</h1>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile.user?.avatar || `/api/avatars/${profile.user?.id}`}
                  alt={profile.user?.name || 'avatar'}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{profile.title || 'No title set'}</h3>
                  <p className="text-muted-foreground">{profile.seniority || ''}</p>
                </div>
              </div>
              {profile.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.dailyRate && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${profile.dailyRate}/day</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills && Array.isArray(profile.skills) ? (
                  profile.skills.map((skill: any, index: number) => {
                    const label = typeof skill === 'string' ? skill : `${skill.name}${skill.level ? ' - ' + skill.level : ''}`;
                    return (
                      <Badge key={index} variant="secondary">
                        {label}
                      </Badge>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No skills listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.portfolio && profile.portfolio.length > 0 ? (
                <div className="space-y-3">
                  {profile.portfolio.map((p) => (
                    <div key={p.id} className="border rounded p-3">
                      <h4 className="font-medium">{p.title}</h4>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No portfolio items</p>
              )}
            </CardContent>
          </Card>
        </div>

  <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{profile.availability?.status || 'Unknown'}</span>
                  {profile.availability?.startDate && (
                    <span className="text-sm text-muted-foreground">since {new Date(profile.availability.startDate).toLocaleDateString()}</span>
                  )}
                </div>
                {profile.availability && (profile.availability as any).notes && (
                  <div className="text-sm">{(profile.availability as any).notes}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.languages && profile.languages.length > 0 ? (
                  profile.languages.map((language: string, index: number) => (
                    <div key={index} className="text-sm">{language}</div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No languages specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CV card - visible to profile owner so they can view their CV */}
          {(auth.user && auth.user.id === profile.user?.id) && (
            <Card>
              <CardHeader>
                <CardTitle>CV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">You can preview or download your uploaded CV here.</p>
                  <div className="flex gap-2">
                    <Button onClick={async () => {
                      try {
                        const blob = await profileService.downloadCv(String(profile.user?.id));
                        const url = window.URL.createObjectURL(blob);
                        setPreviewUrl(url);
                      } catch (err) {
                        console.error('Failed to load CV for preview', err);
                        alert('No CV available to preview');
                      }
                    }}>View CV</Button>
                    <Button onClick={async () => {
                      try {
                        const blob = await profileService.downloadCv(String(profile.user?.id));
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${profile.user?.name || 'cv'}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('Failed to download CV', err);
                        alert('No CV available to download');
                      }
                    }}>Download CV</Button>
                    {previewUrl && (
                      <Button variant="ghost" onClick={() => { window.URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}>Close Preview</Button>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="mt-3">
                      <iframe title="CV preview" src={previewUrl} className="w-full h-80 border" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const CompanyCvDownload: React.FC<{ profile: FreelancerProfile }> = ({ profile }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const handleDownload = async () => {
    try {
      const blob = await profileService.downloadCv(String(profile.user?.id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.user?.name || 'cv'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CV', err);
      alert('CV not available');
    }
  };

  // only show to authenticated company users
  if (!auth.user || auth.user.role !== 'COMPANY') return null;

  return <Button onClick={handleDownload}>Download CV</Button>;
}

export default PublicFreelancerProfile;
