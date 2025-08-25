import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../state/store';
import { logout } from '../state/slices/authSlice';
import { toggleSidebar } from '../state/slices/uiSlice';
import { Button } from '../components/ui/button';
import { 
  User, 
  LogOut, 
  Menu, 
  Home, 
  Briefcase, 
  FileText, 
  Users, 
  MessageSquare,
  BarChart3,
  Settings,
  DollarSign,
  Clock,
  Star,
  Shield
} from 'lucide-react';

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const menuItems = {
    FREELANCE: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: Briefcase, label: 'Missions', path: '/missions' },
      { icon: FileText, label: 'My Applications', path: '/applications' },
      { icon: FileText, label: 'Contracts', path: '/contracts' },
      { icon: Clock, label: 'Tracking', path: '/tracking' },
      { icon: DollarSign, label: 'Payments', path: '/payments' },
      { icon: Star, label: 'Feedback', path: '/feedback' },
    ],
    COMPANY: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: User, label: 'Company Profile', path: '/profile/company' },
      { icon: Briefcase, label: 'My Missions', path: '/missions' },
  // Company-level applications view is mission-scoped; remove global Applications link
      { icon: MessageSquare, label: 'Interviews', path: '/interviews' },
      { icon: FileText, label: 'Contracts', path: '/contracts' },
      { icon: DollarSign, label: 'Payments', path: '/payments' },
      { icon: Star, label: 'Feedback', path: '/feedback' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ],
    ADMIN: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ]
  };

  const currentMenuItems = user ? menuItems[user.role] : [];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-sidebar border-r border-sidebar-border`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-sidebar-foreground ${sidebarOpen ? 'block' : 'hidden'}`}>
              SkillBridge Pro
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleSidebar())}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="px-2">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 mb-1 rounded-md transition-colors
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-2 right-2">
          <div className={`flex items-center px-3 py-2 text-sidebar-foreground ${sidebarOpen ? 'flex' : 'hidden'}`}>
            <User className="h-4 w-4 mr-2" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${sidebarOpen ? 'px-3' : 'px-2'}`}
          >
            <LogOut className="h-4 w-4" />
            <span className={`ml-3 ${sidebarOpen ? 'block' : 'hidden'}`}>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;