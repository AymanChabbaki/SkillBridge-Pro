import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { profileService } from '../../services/profileService';
import { FreelancerProfile } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, Edit, MapPin, DollarSign } from 'lucide-react';
import EditProfileModal from '../../components/profile/EditProfileModal';

const FreelanceProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getFreelancerProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <EditProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={profile}
        onSaved={(updated) => setProfile(updated)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={profile?.user?.avatar || `/api/avatars/${user?.id}`}
                  alt={user?.name || 'avatar'}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-muted-foreground">{profile?.title || 'No title set'}</p>
                  {profile?.cvPath && (
                    <div className="mt-1">
                      <Badge variant="secondary">CV uploaded</Badge>
                    </div>
                  )}
                </div>
              </div>
              {profile?.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.dailyRate && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${profile.dailyRate}/day</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CV preview/download for owner */}
          {profile?.cvPath && (
            <Card>
              <CardHeader>
                <CardTitle>CV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={async () => {
                    try {
                      const blob = await profileService.downloadCv(String(user?.id));
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${user?.name || 'cv'}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Failed to download CV', err);
                      alert('CV not available');
                    }
                  }}>Download CV</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.skills && Array.isArray(profile.skills) ? (
                  profile.skills.map((skill: any, index: number) => {
                    // skill can be string or object {name, level}
                    const label = typeof skill === 'string' ? skill : `${skill.name}${skill.level ? ' - ' + skill.level : ''}`;
                    return (
                      <Badge key={index} variant="secondary">
                        {label}
                      </Badge>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground">No skills added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio preview if present */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.portfolio && profile.portfolio.length > 0 ? (
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
                  <Badge variant={profile?.availability?.status === 'available' ? 'default' : 'secondary'}>
                    {profile?.availability?.status || 'Unknown'}
                  </Badge>
                  {profile?.availability?.startDate && (
                    <span className="text-sm text-muted-foreground">since {new Date(profile.availability.startDate).toLocaleDateString()}</span>
                  )}
                </div>
                {profile?.availability && (profile.availability as any).notes && (
                  <div className="text-sm">{(profile.availability as any).notes}</div>
                )}
                {profile?.availability && (profile.availability as any).daysPerWeek && (
                  <div className="text-sm">Days/week: {(profile.availability as any).daysPerWeek}</div>
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
                {profile?.languages?.map((language, index) => (
                  <div key={index} className="text-sm">{language}</div>
                )) || <p className="text-muted-foreground text-sm">No languages specified</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreelanceProfile;