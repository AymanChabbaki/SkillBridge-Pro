import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { profileService } from '../../services/profileService';
import { CompanyProfile } from '../../services/types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Loader2, Edit, MapPin, Globe, Building } from 'lucide-react';
import EditCompanyModal from '../../components/profile/EditCompanyModal';
import { analyticsService } from '../../services/analyticsService';
import { AnalyticsSummary } from '../../services/types';

const CompanyProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getCompanyProfile();
        setProfile(data);
        // fetch role-aware analytics summary (backend handles company role)
        try {
          const a = await analyticsService.getSummary();
          setAnalytics(a || ({} as AnalyticsSummary));
        } catch (e) {
          console.warn('Failed to load company analytics', e);
        }
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
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <EditCompanyModal open={modalOpen} onClose={() => setModalOpen(false)} profile={profile} onSaved={(p) => setProfile(p)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={((profile as any)?.user?.avatar) || `/api/avatars/${user?.id}`}
                  alt={profile?.name || user?.name}
                  className="h-20 w-20 rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{profile?.name || user?.name}</h3>
                  <p className="text-muted-foreground">{profile?.industry || 'Industry not specified'}</p>
                </div>
              </div>
              {profile?.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{profile.description}</p>
                </div>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile?.size && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{profile.size} employees</span>
                  </div>
                )}
              </div>
              {/* Additional details */}
              <div className="mt-3 text-sm text-muted-foreground space-y-1">
                <div>Contact: {user?.email}</div>
                {profile?.createdAt && <div>Joined: {new Date(profile.createdAt).toLocaleDateString()}</div>}
                {profile?.updatedAt && <div>Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile?.values && profile.values.length > 0 ? (
                  profile.values.map((value, index) => (
                    <Badge key={index} variant="secondary">{value}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No values defined yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                          <div className="text-2xl font-bold">{analytics?.activeMissions ?? analytics?.totalMissions ?? analytics?.activeProjects ?? 0}</div>
                          <div className="text-sm text-muted-foreground">Active Missions</div>
                </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{analytics?.totalSpend ?? analytics?.totalPayments ?? 0}</div>
                            <div className="text-sm text-muted-foreground">Total Spend</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{analytics?.avgTimeToHire ?? analytics?.avgTimeToHire ?? '-'}</div>
                            <div className="text-sm text-muted-foreground">Avg Time to Hire (days)</div>
                          </div>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;