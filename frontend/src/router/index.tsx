import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth, RequireRole } from './guards';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';

// Main pages
import Index from '../pages/Index';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard pages
import DashboardFreelance from '../pages/dashboard/DashboardFreelance';
import DashboardCompany from '../pages/dashboard/DashboardCompany';
import DashboardAdmin from '../pages/dashboard/DashboardAdmin';

// Profile pages
import FreelanceProfile from '../pages/profile/FreelanceProfile';
import CompanyProfile from '../pages/profile/CompanyProfile';
import PortfolioList from '../pages/profile/PortfolioList';
import PortfolioForm from '../pages/profile/PortfolioForm';
import PublicFreelancerProfile from '../pages/profile/PublicFreelancerProfile';

// Mission pages
import MissionList from '../pages/missions/MissionList';
import MissionForm from '../pages/missions/MissionForm';
import MissionDetail from '../pages/missions/MissionDetail';

// Application pages
import MyApplications from '../pages/applications/MyApplications';
import MissionApplications from '../pages/applications/MissionApplications';

// Matching pages
import MatchForFreelance from '../pages/matching/MatchForFreelance';
import MatchForMission from '../pages/matching/MatchForMission';
import FindTalent from '../pages/matching/FindTalent';
import FindTalentLanding from '../pages/matching/FindTalentLanding';
import Shortlist from '../pages/matching/Shortlist';

// Assessment pages

// Interview pages
import InterviewsList from '../pages/interviews/InterviewsList';
import InterviewDetail from '../pages/interviews/InterviewDetail';

// Contract pages
import ContractList from '../pages/contracts/ContractList';
import ContractDetail from '../pages/contracts/ContractDetail';
import MilestoneForm from '../pages/contracts/MilestoneForm';

// Payment pages
import PaymentsPage from '../pages/payments/Payments';

// Tracking pages
import TrackingBoard from '../pages/tracking/TrackingBoard';

// Feedback pages
import FeedbackForm from '../pages/feedback/FeedbackForm';
import FeedbackList from '../pages/feedback/FeedbackList';

// Analytics pages
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';
import UserManagement from '../pages/admin/UserManagement';

// Note: Assessments and Disputes removed to match the cahier de charge (role pages kept minimal)

// Dashboard router component
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

const DashboardRouter = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return (
      <RequireAuth>
        <Navigate to="/auth/login" />
      </RequireAuth>
    );
  }

  // Redirect to role-specific dashboard
  if (user.role === 'FREELANCE') return <DashboardFreelance />;
  if (user.role === 'COMPANY') return <DashboardCompany />;
  return <DashboardAdmin />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <DashboardRouter />
          </RequireAuth>
        ),
      },
      // Profile routes
      {
        path: 'profile',
        children: [
          {
            index: true,
            element: (
              <RequireRole role={['FREELANCE']}>
                <FreelanceProfile />
              </RequireRole>
            ),
          },
          {
            path: 'company',
            element: (
              <RequireRole role={['COMPANY']}>
                <CompanyProfile />
              </RequireRole>
            ),
          },
          {
            path: 'portfolio',
            element: (
              <RequireRole role={['FREELANCE']}>
                <PortfolioList />
              </RequireRole>
            ),
          },
          {
            path: 'portfolio/new',
            element: (
              <RequireRole role={['FREELANCE']}>
                <PortfolioForm />
              </RequireRole>
            ),
          },
          {
            path: 'portfolio/:id',
            element: (
              <RequireRole role={['FREELANCE']}>
                <PortfolioForm />
              </RequireRole>
            ),
          },
          {
            path: 'freelancer/:id',
            element: <PublicFreelancerProfile />,
          },
        ],
      },
      // Mission routes
      {
        path: 'missions',
        children: [
          {
            index: true,
            element: <MissionList />,
          },
          {
            path: 'new',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <MissionForm />
              </RequireRole>
            ),
          },
          {
            path: ':id',
            element: <MissionDetail />,
          },
          {
            path: ':id/edit',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <MissionForm />
              </RequireRole>
            ),
          },
        ],
      },
      // Application routes
      {
        path: 'applications',
        children: [
          {
            index: true,
            element: (
              <RequireRole role={['FREELANCE']}>
                <MyApplications />
              </RequireRole>
            ),
          },
          {
            path: 'mission/:missionId',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <MissionApplications />
              </RequireRole>
            ),
          },
        ],
      },
      // Matching routes
      {
        path: 'matching',
        children: [
          {
            index: true,
            element: (
              <RequireRole role={['FREELANCE']}>
                <MatchForFreelance />
              </RequireRole>
            ),
          },
          {
            path: 'mission/:missionId',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <MatchForMission />
              </RequireRole>
            ),
          },
          {
            path: 'mission/:missionId/find',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <FindTalent />
              </RequireRole>
            ),
          },
          {
            path: 'find',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <FindTalentLanding />
              </RequireRole>
            ),
          },
          {
            path: 'shortlist',
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <Shortlist />
              </RequireRole>
            ),
          },
        ],
      },
      // Assessment routes
  // assessments removed per cahier
      // Interview routes
      {
        path: 'interviews',
        children: [
          {
            index: true,
            element: <InterviewsList />,
          },
          {
            path: ':id',
            element: <InterviewDetail />,
          },
        ],
      },
      // Contract routes
      {
        path: 'contracts',
        children: [
          {
            index: true,
            element: <ContractList />,
          },
          {
            path: ':id',
            element: <ContractDetail />,
          },
          {
            path: ':id/milestones/new',
            element: (
              <RequireRole role={['COMPANY', 'FREELANCE', 'ADMIN']}>
                <MilestoneForm />
              </RequireRole>
            ),
          },
        ],
      },
      // Payment routes
      {
        path: 'payments',
        children: [
          {
            index: true,
            element: <PaymentsPage />,
          },
        ],
      },
      // Analytics: primarily for COMPANY and ADMIN per cahier
      {
        path: 'analytics',
        children: [
          {
            index: true,
            element: (
              <RequireRole role={['COMPANY', 'ADMIN']}>
                <AnalyticsDashboard />
              </RequireRole>
            ),
          },
        ],
      },
      // Admin users management
      {
        path: 'users',
        element: (
          <RequireRole role={['ADMIN']}>
            <UserManagement />
          </RequireRole>
        ),
      },
      // Tracking routes: visible to FREELANCE (their times) and COMPANY (their contracts)
      {
        path: 'tracking',
        children: [
          {
            index: true,
            element: (
              <RequireRole role={['FREELANCE', 'COMPANY']}>
                <TrackingBoard />
              </RequireRole>
            ),
          },
        ],
      },
      // Feedback routes
      {
        path: 'feedback',
        children: [
          {
            index: true,
            element: <FeedbackList />,
          },
          {
            path: 'new',
            element: (
              <RequireRole role={['FREELANCE', 'COMPANY']}>
                <FeedbackForm />
              </RequireRole>
            ),
          },
        ],
      },
  // disputes removed per cahier
    ],
  },
]);