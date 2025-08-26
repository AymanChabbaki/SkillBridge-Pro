// TypeScript types based on ROUTES.md API specifications

export type UserRole = 'ADMIN' | 'FREELANCE' | 'COMPANY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Freelancer types
export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Availability {
  status: 'available' | 'busy' | 'unavailable';
  startDate?: string;
}

export interface FreelancerProfile {
  id: string;
  userId: string;
  title?: string;
  bio?: string;
  skills: Skill[];
  seniority?: 'junior' | 'mid' | 'senior' | 'lead';
  dailyRate?: number;
  availability: Availability;
  location?: string;
  remote: boolean;
  languages: string[];
  // user shorthand for display purposes
  user?: { id: string; name: string; avatar?: string; email?: string };
  // optional path to uploaded CV (relative path returned by API)
  cvPath?: string | null;
  // runtime-only flag populated by backend when a freelancer has passing assessments
  isCertified?: boolean;
  portfolio: PortfolioItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  links: Array<{type: 'live' | 'github' | 'demo', url: string}>;
  impact?: string;
  duration?: string;
  teamSize?: number;
  createdAt: string;
}

export interface CreatePortfolioRequest {
  title: string;
  description: string;
  technologies: string[];
  links: Array<{type: 'live' | 'github' | 'demo', url: string}>;
  impact?: string;
  duration?: string;
  teamSize?: number;
}

// Company types
export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  industry?: string;
  size?: string;
  description?: string;
  website?: string;
  location?: string;
  values: string[];
  createdAt: string;
  updatedAt: string;
}

// Mission types
export interface Mission {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  optionalSkills: string[];
  budgetMin: number;
  budgetMax: number;
  duration: string;
  modality: 'remote' | 'onsite' | 'hybrid';
  sector: string;
  urgency: 'low' | 'medium' | 'high';
  experience: 'junior' | 'mid' | 'senior' | 'lead';
  startDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  company?: CompanyProfile;
}

export interface CreateMissionRequest {
  title: string;
  description: string;
  requiredSkills: string[];
  optionalSkills: string[];
  budgetMin: number;
  budgetMax: number;
  duration: string;
  modality: 'remote' | 'onsite' | 'hybrid';
  sector: string;
  urgency: 'low' | 'medium' | 'high';
  experience: 'junior' | 'mid' | 'senior' | 'lead';
  startDate: string;
}

export interface MissionFilters {
  q?: string;
  skills?: string[];
  sector?: string;
  seniority?: string;
  budgetMin?: number;
  budgetMax?: number;
  duration?: string;
  modality?: string;
  urgency?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// Application types
export interface Application {
  id: string;
  freelancerId: string;
  missionId: string;
  coverLetter: string;
  proposedRate: number;
  availabilityPlan: string;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEW_COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  freelancer?: FreelancerProfile;
  mission?: Mission;
  // optional interviews returned when fetching application-related interviews
  interviews?: Interview[];
}

export interface CreateApplicationRequest {
  missionId: string;
  coverLetter: string;
  proposedRate: number;
  availabilityPlan: string;
}

// Matching types
export interface MatchResult {
  mission?: Mission;
  freelancer?: FreelancerProfile;
  matchScore: number;
  matchReasons: string[];
}

// Assessment types
export interface Question {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'code';
  options?: string[];
}

export interface Assessment {
  id: string;
  applicationId: string;
  type: 'QCM' | 'CHALLENGE' | 'TECHNICAL_TEST';
  title: string;
  description: string;
  questions: Question[];
  maxScore: number;
  timeLimit: number;
  score?: number;
  reviewNotes?: string;
  submittedAt?: string;
  createdAt: string;
}

export interface CreateAssessmentRequest {
  applicationId: string;
  type: 'QCM' | 'CHALLENGE' | 'TECHNICAL_TEST';
  title: string;
  description: string;
  questions: Question[];
  maxScore: number;
  timeLimit: number;
}

export interface SubmitAssessmentRequest {
  answers: Array<{questionId: string, answer: string}>;
}

// Interview types
export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string;
  notes?: string;
  rating?: number;
  completed: boolean;
  createdAt: string;
}

export interface ScheduleInterviewRequest {
  applicationId: string;
  scheduledAt: string;
  duration: number;
  meetingLink: string;
}

// Contract types
export interface Contract {
  id: string;
  missionId: string;
  freelancerId: string;
  companyId: string;
  // Optional relational fields populated by API when includes are requested
  mission?: Mission;
  freelancer?: FreelancerProfile;
  company?: CompanyProfile;
  terms: {
    scope: string;
    deliverables: string[];
  };
  hourlyRate: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PENDING_SIGNATURES' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  freelancerSigned: boolean;
  companySigned: boolean;
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'PAID';
  deliverable?: string;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface CreateContractRequest {
  missionId: string;
  freelancerId: string;
  // DB requires clientId (company) when creating a contract
  clientId: string;
  templateId?: string;
  terms: {
    scope: string;
    deliverables: string[];
  };
  // Pricing options: either hourlyRate or fixedPrice (service-side enforces at least one)
  hourlyRate?: number;
  fixedPrice?: number;
  startDate: string;
  endDate: string;
}

export interface CreateMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

// Payment types
export interface Payment {
  id: string;
  milestoneId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

// Tracking types
export interface TrackingEntry {
  id: string;
  contractId: string;
  freelancerId: string;
  date: string;
  hours: number;
  description: string;
  deliverable?: string;
  attachments: string[];
  approved: boolean;
  approvedAt?: string;
  createdAt: string;
}

export interface CreateTrackingRequest {
  date: string;
  hours: number;
  description: string;
  deliverable?: string;
  attachments?: string[];
}

export interface ProjectSummary {
  contractId: string;
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  totalEarnings: number;
  completionRate: number;
  lastUpdate: string;
}

// Feedback types
export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  missionId: string;
  contractId: string;
  rating: number;
  comment: string;
  skills: {
    technical: number;
    communication: number;
    timeliness: number;
  };
  isPublic: boolean;
  createdAt: string;
  fromUser?: User;
}

export interface CreateFeedbackRequest {
  toUserId: string;
  missionId: string;
  contractId: string;
  rating: number;
  comment: string;
  skills: {
    technical: number;
    communication: number;
    timeliness: number;
  };
  isPublic: boolean;
}

// Dispute types
export interface Dispute {
  id: string;
  contractId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolverId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateDisputeRequest {
  contractId: string;
  reason: string;
  description: string;
}

// Analytics types
export interface AnalyticsSummary {
  // Common
  totalEarnings?: number;
  activeProjects?: number;
  completedProjects?: number;
  avgRating?: number;
  // Backend / alternate names
  activeContracts?: number;
  completedJobs?: number;
  // Missions (company-side)
  activeMissions?: number;
  totalMissions?: number;
  conversionRate?: number;
  averageRating?: number;
  totalApplications?: number;
  recentApplications?: number;
  projectedEarnings?: number;
  
  // Freelancer specific
  profileViews?: number;
  applicationsSent?: number;
  winRate?: number;
  skillDemand?: Array<{skill: string, demand: number}>;
  activeFreelancers?: number;
  freelancersCount?: number;
  
  // Company specific
  totalHires?: number;
  avgTimeToHire?: number;
  talentPoolSize?: number;
  // number of freelancers on the platform or in the company's talent pool
  totalFreelancers?: number;
  satisfactionRate?: number;
  totalSpend?: number;
  companiesCount?: number;
  totalVolume?: number;
  
  // Admin specific
  totalUsers?: number;
  totalRevenue?: number;
  platformGrowth?: number;
  topSkills?: Array<{skill: string, count: number}>;
  platformRevenue?: number;
  totalPayments?: number;
}

export interface MarketTrends {
  topSkills: Array<{skill: string, avgRate: number, demand: number}>;
  rateRanges: Array<{skill: string, min: number, max: number, avg: number}>;
  popularSectors: Array<{sector: string, jobCount: number}>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and filters
export interface FreelancerFilters {
  skills?: string[];
  seniority?: string;
  minRate?: number;
  maxRate?: number;
  location?: string;
  remote?: boolean;
  page?: number;
  limit?: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}