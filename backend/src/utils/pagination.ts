export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getPagination = (options: PaginationOptions = {}): PaginationResult => {
  const { page = 1, limit = 20, maxLimit = 100 } = options;
  
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), maxLimit);
  
  return {
    skip: (validPage - 1) * validLimit,
    take: validLimit,
    page: validPage,
    limit: validLimit,
  };
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
