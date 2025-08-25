import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, Search, Users, Filter } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { get, patch } from '../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'ADMIN' | 'FREELANCE' | 'COMPANY';
  isActive: boolean;
  createdAt: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await get<User[] | { users: User[]; pagination?: any }>('/users');
        // API returns array directly in successResponse; some endpoints wrap — handle both
        const usersList: User[] = Array.isArray(data) ? (data as User[]) : (data.users || []);
        setUsers(usersList);
      } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, newStatus: boolean) => {
    try {
      const res = await patch<any>(`/users/${userId}/status`, { isActive: newStatus });
      // optimistic update from response
      setUsers(users.map(user => (user.id === userId ? { ...user, isActive: res.isActive ?? newStatus } : user)));
      toast({
        title: "Success",
        description: `User ${newStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status"
      });
    }
  };

  const openDetails = async (id: string) => {
    try {
      setDetailsOpen(true);
      const data = await get<User>(`/users/${id}`);
      setSelectedUser(data);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to load user details' });
      setDetailsOpen(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <Badge variant="secondary">{users.length} Total Users</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.name} avatar`}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant={
                      user.role === 'ADMIN' ? 'destructive' : 
                      user.role === 'COMPANY' ? 'default' : 'secondary'
                    }
                  >
                    {user.role}
                  </Badge>
                  
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant={user.isActive ? 'destructive' : 'default'}
                    onClick={() => handleToggleStatus(user.id, !user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openDetails(user.id)}>
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No users found matching your criteria</p>
          </CardContent>
        </Card>
      )}
      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={(o) => { if (!o) setSelectedUser(null); setDetailsOpen(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
                {selectedUser ? (
              <div>
                {selectedUser.avatar && (
                  <img src={selectedUser.avatar} alt={`${selectedUser.name} avatar`} className="h-20 w-20 rounded-full object-cover mb-3" />
                )}
                <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p>Role: {selectedUser.role}</p>
                <p>Status: {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                {/* company/freelancer profiles rendered by backend in user object if present */}
                {selectedUser.role === 'COMPANY' && (selectedUser as any).companyProfile && (
                  <div className="mt-2">
                    <h4 className="font-medium">Company</h4>
                    <p>{(selectedUser as any).companyProfile.name}</p>
                    <p>{(selectedUser as any).companyProfile.industry}</p>
                  </div>
                )}

                {selectedUser.role === 'FREELANCE' && (selectedUser as any).freelancerProfile && (
                  <div className="mt-2">
                    <h4 className="font-medium">Freelancer</h4>
                    <p>{(selectedUser as any).freelancerProfile.title}</p>
                    <p>Rating: {(selectedUser as any).freelancerProfile.rating ?? '—'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;