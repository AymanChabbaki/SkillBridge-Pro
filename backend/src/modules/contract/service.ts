import { ContractRepository } from './repository';
import { CreateContractDto, UpdateContractDto, SignContractDto } from './dto';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';

export class ContractService {
  constructor(private contractRepository: ContractRepository) {}

  async createContract(data: CreateContractDto, userId: string, role: string) {
    // Verify mission exists and user has permission
    const mission = await this.contractRepository.prisma.mission.findUnique({
      where: { id: data.missionId },
      include: {
        company: true,
        applications: {
          where: {
            freelancer: {
              id: data.freelancerId
            },
            status: 'ACCEPTED'
          }
        }
      }
    });

    if (!mission) {
      throw new NotFoundError('Mission not found');
    }

    // Check permissions
    const isCompanyOwner = mission.company.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to create contract for this mission');
    }

    // Verify accepted application exists
    if (mission.applications.length === 0) {
      throw new ValidationError('No accepted application found for this freelancer and mission');
    }

    // Check if contract already exists for this mission
    const existingContract = await this.contractRepository.findByMissionId(data.missionId);
    if (existingContract) {
      throw new ValidationError('Contract already exists for this mission');
    }

    // Verify freelancer exists
    const freelancer = await this.contractRepository.prisma.freelancerProfile.findUnique({
      where: { id: data.freelancerId },
      include: { user: true }
    });

    if (!freelancer) {
      throw new NotFoundError('Freelancer not found');
    }

    return this.contractRepository.create(data);
  }

  async getContract(id: string, userId: string, role: string) {
    const contract = await this.contractRepository.findById(id);
    
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    // Check permissions
    const isCompanyOwner = contract.mission.company.user.id === userId;
    const isFreelancer = contract.freelancer.user.id === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isFreelancer && !isAdmin) {
      throw new ForbiddenError('Not authorized to view this contract');
    }

    return contract;
  }

  async updateContract(id: string, data: UpdateContractDto, userId: string, role: string) {
    const contract = await this.contractRepository.findById(id);
    
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    // Check permissions
    const isCompanyOwner = contract.mission.company.user.id === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to update this contract');
    }

    // Prevent updates to signed contracts unless admin
    if (contract.signedAt && !isAdmin) {
      throw new ValidationError('Cannot update signed contract');
    }

    return this.contractRepository.update(id, data);
  }

  async signContract(id: string, signatureData: SignContractDto, userId: string, role: string) {
    const contract = await this.contractRepository.findById(id);
    
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    // Check permissions - freelancer must sign their own contract
    if (role === 'FREELANCE' && contract.freelancer.user.id !== userId) {
      throw new ForbiddenError('Not authorized to sign this contract');
    }

    if (contract.signedAt) {
      throw new ValidationError('Contract is already signed');
    }

    // Update contract status and sign
    return this.contractRepository.update(id, {
      status: 'ACTIVE',
      signedAt: new Date().toISOString()
    });
  }

  async getContracts(userId: string, role: string, filters: any) {
    return this.contractRepository.findMany({
      userId,
      role,
      ...filters
    });
  }

  async getActiveContracts(userId: string, role: string) {
    return this.contractRepository.findActiveContracts(userId, role);
  }

  async deleteContract(id: string, userId: string, role: string) {
    const contract = await this.contractRepository.findById(id);
    
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    // Check permissions - only admin or company owner can delete
    const isCompanyOwner = contract.mission.company.user.id === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCompanyOwner && !isAdmin) {
      throw new ForbiddenError('Not authorized to delete this contract');
    }

    // Prevent deletion of active contracts
    if (contract.status === 'ACTIVE') {
      throw new ValidationError('Cannot delete active contract');
    }

    return this.contractRepository.delete(id);
  }
}
