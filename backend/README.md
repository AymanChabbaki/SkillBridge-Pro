# Freelance Platform

A comprehensive freelance marketplace platform built with Node.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **User Management**: Registration, authentication, and profile management for freelancers and clients
- **Mission Management**: Create, browse, and manage freelance projects
- **Application System**: Freelancers can apply to missions with proposals
- **Interview Scheduling**: Built-in interview scheduling system
- **Contract Management**: Create and manage contracts between clients and freelancers
- **Milestone Tracking**: Break down projects into trackable milestones
- **Payment Processing**: Integrated Stripe payment system with escrow functionality
- **Feedback System**: Rating and review system for completed projects
- **Dispute Resolution**: Handle disputes between clients and freelancers
- **Portfolio Management**: Showcase work and skills
- **Company Profiles**: Company information for business clients
- **Assessment System**: Skills assessment for freelancers
- **Real-time Tracking**: Track user activities and system events
- **Analytics**: Comprehensive analytics and reporting

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Payment Processing**: Stripe
- **Validation**: Zod schemas
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI
- **Caching**: Redis
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for caching)
- Stripe account (for payments)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freelance-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/freelance_platform"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRE="7d"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   
   # Email (optional)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT=587
   SMTP_USER="your-email@example.com"
   SMTP_PASS="your-password"
   
   # Other
   NODE_ENV="development"
   PORT=3000
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`.

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:3000/api-docs`
- JSON specification: `http://localhost:3000/api-docs.json`

## Database Schema

The platform uses the following main entities:

- **Users**: Freelancers, clients, and admins
- **FreelancerProfiles**: Extended profile information for freelancers
- **CompanyProfiles**: Company information for business clients
- **Missions**: Job postings created by clients
- **Applications**: Freelancer applications to missions
- **Interviews**: Scheduled interviews between clients and freelancers
- **Contracts**: Agreements between clients and freelancers
- **Milestones**: Project milestones with deliverables
- **Payments**: Payment transactions
- **Feedback**: Reviews and ratings
- **Disputes**: Conflict resolution
- **Portfolios**: Freelancer work showcases
- **Assessments**: Skills assessments
- **TrackingEvents**: System activity tracking

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run swagger` - Generate Swagger documentation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Missions
- `GET /api/missions` - Get missions with filtering
- `POST /api/missions` - Create mission (clients only)
- `GET /api/missions/:id` - Get mission by ID
- `PUT /api/missions/:id` - Update mission
- `DELETE /api/missions/:id` - Delete mission

### Applications
- `GET /api/applications` - Get applications
- `POST /api/applications` - Submit application (freelancers only)
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Withdraw application

### Interviews
- `GET /api/interviews` - Get interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews/:id` - Get interview by ID
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Cancel interview
- `GET /api/interviews/upcoming` - Get upcoming interviews

### Contracts
- `GET /api/contracts` - Get contracts
- `POST /api/contracts` - Create contract (clients only)
- `GET /api/contracts/:id` - Get contract by ID
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `POST /api/contracts/:id/accept` - Accept contract (freelancers only)
- `POST /api/contracts/:id/complete` - Mark contract as complete

### Milestones
- `GET /api/milestones` - Get milestones
- `POST /api/milestones` - Create milestone (clients only)
- `GET /api/milestones/:id` - Get milestone by ID
- `PUT /api/milestones/:id` - Update milestone
- `DELETE /api/milestones/:id` - Delete milestone
- `POST /api/milestones/:id/approve` - Approve milestone (clients only)
- `POST /api/milestones/:id/reject` - Reject milestone (clients only)

### Payments
- `GET /api/payments` - Get payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/process` - Process payment
- `POST /api/payments/:id/refund` - Refund payment
- `GET /api/payments/summary` - Get payment summary

### Additional modules include endpoints for:
- Tracking events
- Feedback/reviews  
- Disputes
- Analytics
- Portfolios
- Company profiles
- Assessments

## Testing

The platform includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   DATABASE_URL="your-production-database-url" npm run db:migrate
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation using Zod schemas
- Rate limiting on API endpoints
- CORS protection
- Helmet for security headers
- SQL injection protection via Prisma

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Email: support@freelanceplatform.com