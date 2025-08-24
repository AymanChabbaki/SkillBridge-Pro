import { companyRepository } from './repository';
import { AppError } from '../../utils/response';
import { getPagination, createPaginationMeta } from '../../utils/pagination';
import { UpdateCompanyProfileDto, GetCompaniesQueryDto } from './dto';

export class CompanyService {
  async getCompanies(query: GetCompaniesQueryDto) {
    const pagination = getPagination({
      page: query.page,
      limit: query.limit,
      maxLimit: 50,
    });

    const { companies, total } = await companyRepository.findMany({
      industry: query.industry,
      size: query.size,
      location: query.location,
      verified: query.verified,
      pagination,
    });

    const meta = createPaginationMeta(pagination.page, pagination.limit, total);

    return {
      companies,
      pagination: meta,
    };
  }

  async getCompanyById(id: string) {
    const company = await companyRepository.findById(id);
    
    if (!company) {
      throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }

    return company;
  }

  async getMyCompanyProfile(userId: string) {
    const company = await companyRepository.findByUserId(userId);
    
    if (!company) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    return company;
  }

  async createOrUpdateCompanyProfile(userId: string, data: UpdateCompanyProfileDto) {
    const existingProfile = await companyRepository.findByUserId(userId);
    
    if (existingProfile) {
      return companyRepository.update(userId, data);
    } else {
      return companyRepository.create(userId, data);
    }
  }

  async deleteCompanyProfile(userId: string) {
    const existingProfile = await companyRepository.findByUserId(userId);
    
    if (!existingProfile) {
      throw new AppError('Company profile not found', 404, 'COMPANY_PROFILE_NOT_FOUND');
    }

    await companyRepository.delete(userId);
    
    return { message: 'Company profile deleted successfully' };
  }
}

export const companyService = new CompanyService();
