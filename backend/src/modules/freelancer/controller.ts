import { Request, Response, NextFunction } from 'express';
import { freelancerService } from './service';
import { updateFreelancerProfileSchema, getFreelancersQuerySchema } from './dto';
import { successResponse } from '../../utils/response';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';
import { AppError } from '../../utils/errors';

export class FreelancerController {
  async getFreelancers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getFreelancersQuerySchema.parse(req.query);
      const result = await freelancerService.getFreelancers(query);
      
      successResponse(res, result.freelancers, 'Freelancers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFreelancerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
  // Allow callers to explicitly request increment via query param ?increment=true
  const incrementQuery = String(req.query.increment || '').toLowerCase();
  const incrementRequested = incrementQuery === 'true' || incrementQuery === '1';
  const incrementViews = incrementRequested || !req.user || req.user.role !== 'FREELANCE';
  const result = await freelancerService.getFreelancerById(id, incrementViews);
      
      successResponse(res, result, 'Freelancer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await freelancerService.getMyFreelancerProfile(req.user!.id);
      
      successResponse(res, result, 'Freelancer profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateFreelancerProfileSchema.parse(req.body);
      const result = await freelancerService.createOrUpdateFreelancerProfile(req.user!.id, validatedData);
      
      successResponse(res, result, 'Freelancer profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await freelancerService.deleteFreelancerProfile(req.user!.id);
      
      successResponse(res, result, 'Freelancer profile deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // Multer setup for CVs: use memory storage then write to disk inside handler to include freelancerId
  private cvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: (() => {
      // env.MAX_FILE_SIZE may be like '5MB' - parse digits
      const raw = String(env.MAX_FILE_SIZE || '5MB').toUpperCase();
      const match = raw.match(/(\d+)/);
      const mb = match ? Number(match[1]) : 5;
      return mb * 1024 * 1024;
    })() },
    fileFilter: (_req, file, cb) => {
      const allowed = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowed.includes(ext)) return cb(new AppError('Only PDF/DOC/DOCX files are allowed', 400) as any);
      cb(null, true);
    }
  });

  // Handler to be used with router: upload CV for current freelancer
  uploadMyCv = [
    // multer middleware
    (this.cvUpload.single('cv') as any),
    async (req: any, res: Response, next: NextFunction) => {
      try {
        const user = req.user;
        if (!user) throw new AppError('Unauthorized', 401);
        const file = req.file;
        if (!file) throw new AppError('No file uploaded', 400);

        const freelancerId = String(user.id);
        const destDir = path.join(env.UPLOAD_DIR, 'cv', freelancerId);
        fs.mkdirSync(destDir, { recursive: true });

        const timestamp = Date.now();
        const safeName = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
        const destPath = path.join(destDir, safeName);
        fs.writeFileSync(destPath, file.buffer);

        const relative = path.join('cv', freelancerId, safeName).replace(/\\/g, '/');
        // persist path in DB
        try {
          await freelancerService.setCvPath(user.id, relative);
        } catch (e) {
          // if DB persist fails, still return success for file write but log
          console.warn('Failed to persist CV path in DB', e);
        }
        return successResponse(res, { message: 'CV uploaded', path: relative });
      } catch (err) {
        next(err);
      }
    }
  ];

  // Handler to download CV for a freelancer by id - picks latest file
  async downloadCvById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dir = path.join(env.UPLOAD_DIR, 'cv', String(id));
      if (!fs.existsSync(dir)) throw new AppError('CV not found', 404);
      const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.'));
      if (!files || files.length === 0) throw new AppError('CV not found', 404);
      files.sort();
      const file = files[files.length - 1];
      const fullPath = path.join(dir, file);
      if (!fs.existsSync(fullPath)) throw new AppError('CV not found', 404);

      res.setHeader('Content-Disposition', `attachment; filename="${file.replace(/^[0-9]+-/, '')}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      const stream = fs.createReadStream(fullPath);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

export const freelancerController = new FreelancerController();
