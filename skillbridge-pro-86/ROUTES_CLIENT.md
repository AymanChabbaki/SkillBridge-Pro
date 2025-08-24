# ROUTES_CLIENT.md - SkillBridge Pro Frontend

## Architecture Overview

Frontend structure aligns with ROUTES.md API endpoints using React 18 + Redux Toolkit + TypeScript.

## Route Mapping

### Authentication Routes
- `/auth/login` → `Login.tsx` → `authService.login()` → `POST /auth/login`
- `/auth/register` → `Register.tsx` → `authService.register()` → `POST /auth/register`

### Dashboard Routes (Role-based)
- `/dashboard` → Role-based dashboard → `analyticsService.getSummary()` → `GET /analytics/summary`
  - FREELANCE: `DashboardFreelance.tsx`
  - COMPANY: `DashboardCompany.tsx` 
  - ADMIN: `DashboardAdmin.tsx`

### Profile Management
- `/profile` → `FreelanceProfile.tsx` → `profileService.getFreelancerProfile()` → `GET /freelancers/me`
- `/profile/company` → `CompanyProfile.tsx` → `profileService.getCompanyProfile()` → `GET /companies/me`
- `/profile/portfolio` → `PortfolioList.tsx` → `portfolioService.getPortfolio()` → `GET /freelancers/me/portfolio`

### Mission Management
- `/missions` → `MissionList.tsx` → `missionService.getMissions()` → `GET /missions`
- `/missions/new` → `MissionForm.tsx` → `missionService.createMission()` → `POST /missions`
- `/missions/:id` → `MissionDetail.tsx` → `missionService.getMissionById()` → `GET /missions/:id`

### Application Management
- `/applications` → `MyApplications.tsx` → `applicationService.getMyApplications()` → `GET /applications/me`
- `/applications/mission/:id` → `MissionApplications.tsx` → `applicationService.getMissionApplications()` → `GET /applications/mission/:id`

### Matching System
- `/matching` → `MatchForFreelance.tsx` → `matchingService.getMatchingMissions()` → `GET /matching/missions`
- `/matching/mission/:id` → `MatchForMission.tsx` → `matchingService.getMatchingFreelancers()` → `GET /matching/freelancers`

### Assessment System
- `/assessments` → `AssessmentList.tsx` → `assessmentService.getAssessments()` → `GET /assessments`
- `/assessments/:id` → `AssessmentDetail.tsx` → `assessmentService.getAssessment()` → `GET /assessments/:id`
- `/assessments/:id/submit` → `AssessmentSubmit.tsx` → `assessmentService.submitAssessment()` → `POST /assessments/:id/submit`

### Interview Management
- `/interviews` → `InterviewScheduler.tsx` → `interviewService.getInterviews()` → `GET /interviews`
- `/interviews/:id` → `InterviewDetail.tsx` → `interviewService.getInterview()` → `GET /interviews/:id`

### Contract & Milestone Management
- `/contracts` → `ContractList.tsx` → `contractService.getContracts()` → `GET /contracts`
- `/contracts/:id` → `ContractDetail.tsx` → `contractService.getContract()` → `GET /contracts/:id`
- `/contracts/:id/milestones/new` → `MilestoneForm.tsx` → `contractService.createMilestone()` → `POST /contracts/:id/milestones`

### Payment System
- `/payments` → `Payments.tsx` → `paymentService.processPayment()` → `POST /payments/:milestoneId/pay`

### Time Tracking
- `/tracking` → `TrackingBoard.tsx` → `trackingService.getTrackingEntries()` → `GET /tracking/:contractId`

### Feedback System
- `/feedback` → `FeedbackList.tsx` → `feedbackService.getMyFeedback()` → `GET /feedback/me`
- `/feedback/new` → `FeedbackForm.tsx` → `feedbackService.createFeedback()` → `POST /feedback`

### Dispute Management
Dispute flows removed from the client per cahier de charge (not implemented in this deliverable).

## Authentication & Authorization

### Guards Implementation
- `RequireAuth`: Protects all app routes, redirects to `/auth/login` if not authenticated
- `RequireRole`: Role-based access control (ADMIN/FREELANCE/COMPANY)

### Token Management
- Automatic token refresh via axios interceptor
- Local storage for token persistence
- Redux state management for auth status

## Service Layer Architecture

All API calls centralized in service files:
- `authService.ts` - Authentication endpoints
- `profileService.ts` - User profile management
- `missionService.ts` - Mission CRUD operations
- `applicationService.ts` - Application management
- `matchingService.ts` - AI matching system
- `assessmentService.ts` - Technical assessments
- `interviewService.ts` - Interview scheduling
- `contractService.ts` - Contract management
- `paymentService.ts` - Payment processing (mock)
- `trackingService.ts` - Time tracking
- `feedbackService.ts` - Feedback system
- `analyticsService.ts` - Analytics dashboard

## State Management

Redux Toolkit slices:
- `authSlice` - Authentication state
- `uiSlice` - UI state (sidebar, theme, notifications)

## Error Handling

Normalized error responses from API:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  }
}
```

## Component Architecture

- Layouts: `AuthLayout`, `AppLayout` with role-aware navigation
- Guards: Route protection and role-based access
- Pages: Feature-specific components
- Services: API integration layer
- Types: TypeScript definitions from ROUTES.md