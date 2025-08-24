"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
describe('Authentication', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'FREELANCER',
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.password).toBeUndefined();
        });
        it('should return validation error for invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'FREELANCER',
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            expect(response.body).toHaveProperty('success', false);
        });
        it('should return error for duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'FREELANCER',
            };
            await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/register')
                .send(userData);
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
            await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    password: hashedPassword,
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'FREELANCER',
                    emailVerified: true,
                },
            });
        });
        it('should login user with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(loginData.email);
        });
        it('should return error for invalid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body).toHaveProperty('success', false);
        });
        it('should return error for non-existent user', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });
    describe('GET /api/auth/me', () => {
        let authToken;
        beforeEach(async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'FREELANCER',
            };
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/auth/register')
                .send(userData);
            authToken = response.body.data.token;
        });
        it('should return current user profile', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('email', 'test@example.com');
        });
        it('should return error without authentication token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/auth/me')
                .expect(401);
            expect(response.body).toHaveProperty('success', false);
        });
        it('should return error with invalid token', async () => {
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });
});
//# sourceMappingURL=auth.test.js.map