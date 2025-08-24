import { get, post, put, del } from './api';
import {
  FreelancerProfile,
  CompanyProfile,
  PortfolioItem,
  CreatePortfolioRequest,
} from './types';

export const profileService = {
  // Freelancer profile
  async getFreelancerProfile(): Promise<FreelancerProfile> {
    return get<FreelancerProfile>('/freelancers/me');
  },

  async updateFreelancerProfile(data: Partial<FreelancerProfile>): Promise<FreelancerProfile> {
    return put<FreelancerProfile>('/freelancers/me', data);
  },

  async getFreelancerById(id: string): Promise<FreelancerProfile> {
    return get<FreelancerProfile>(`/freelancers/${id}`);
  },

  async searchFreelancers(filters: any): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(`${key}[]`, v));
      } else if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return get<any>(`/freelancers?${params.toString()}`);
  },

  // Company profile
  async getCompanyProfile(): Promise<CompanyProfile> {
    return get<CompanyProfile>('/companies/me');
  },

  async updateCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return put<CompanyProfile>('/companies/me', data);
  },

  async getCompanyById(id: string): Promise<CompanyProfile> {
    return get<CompanyProfile>(`/companies/${id}`);
  },

  // Portfolio methods
  async getPortfolio(): Promise<PortfolioItem[]> {
    return get<PortfolioItem[]>('/freelancers/me/portfolio');
  },

  async createPortfolioItem(data: CreatePortfolioRequest): Promise<PortfolioItem> {
    return post<PortfolioItem>('/freelancers/me/portfolio', data);
  },

  async updatePortfolioItem(id: string, data: Partial<CreatePortfolioRequest>): Promise<PortfolioItem> {
    return put<PortfolioItem>(`/freelancers/me/portfolio/${id}`, data);
  },

  async deletePortfolioItem(id: string): Promise<void> {
    return del<void>(`/freelancers/me/portfolio/${id}`);
  },
};