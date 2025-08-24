import { Router } from 'express';
import { assessmentController } from './controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { requireCompanyOrAdmin, requireFreelance } from '../../middleware/role.middleware';

export const assessmentRouter = Router();

/**
 * @swagger
 * /assessments:
 *   get:
 *     summary: Get assessments
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [QCM, CHALLENGE, TECHNICAL_TEST, PORTFOLIO_REVIEW]
 *       - in: query
 *         name: applicationId
 *         schema:
 *           type: string
 */
assessmentRouter.get('/', authenticateToken, assessmentController.getAssessments);

/**
 * @swagger
 * /assessments:
 *   post:
 *     summary: Create assessment (company/admin)
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - type
 *               - title
 *               - questions
 *               - maxScore
 *             properties:
 *               applicationId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [QCM, CHALLENGE, TECHNICAL_TEST, PORTFOLIO_REVIEW]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [text, multiple_choice, code, file_upload]
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctAnswer:
 *                       type: string
 *                     points:
 *                       type: number
 *               maxScore:
 *                 type: number
 *               timeLimit:
 *                 type: number
 */
assessmentRouter.post('/', authenticateToken, requireCompanyOrAdmin, assessmentController.createAssessment);

/**
 * @swagger
 * /assessments/{id}:
 *   get:
 *     summary: Get assessment by ID
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
assessmentRouter.get('/:id', authenticateToken, assessmentController.getAssessmentById);

/**
 * @swagger
 * /assessments/{id}/submit:
 *   post:
 *     summary: Submit assessment answers (freelancer)
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     fileUrl:
 *                       type: string
 */
assessmentRouter.post('/:id/submit', authenticateToken, requireFreelance, assessmentController.submitAssessment);

/**
 * @swagger
 * /assessments/{id}/score:
 *   patch:
 *     summary: Score assessment (company/admin)
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *               reviewNotes:
 *                 type: string
 */
assessmentRouter.patch('/:id/score', authenticateToken, requireCompanyOrAdmin, assessmentController.scoreAssessment);
