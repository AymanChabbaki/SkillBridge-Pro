# ROUTES — SkillBridge Pro (API v1)

Base URL: `/api/v1`

## Authentication & Authorization
- **Bearer Token**: All protected routes require `Authorization: Bearer <token>` header
- **Roles**: ADMIN, FREELANCE, COMPANY
- **Response Format**: All endpoints return `{success: boolean, data?: any, error?: {code, message, details?}}`

---

## Auth
### POST /auth/register
**Description**: Register a new user account  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "FREELANCE" | "COMPANY" | "ADMIN"
}
```
**Response**: `{user: UserObject, tokens: {accessToken, refreshToken, expiresIn}}`

### POST /auth/login
**Description**: Login with email/password  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: `{user: UserObject, tokens: {accessToken, refreshToken, expiresIn}}`

### POST /auth/refresh
**Description**: Refresh access token  
**Body**:
```json
{
  "refreshToken": "refresh_token_here"
}
```
**Response**: `{user: UserObject, tokens: {accessToken, refreshToken, expiresIn}}`

### GET /auth/me
**Auth**: Required  
**Description**: Get current user profile  
**Response**: `UserProfile with role-specific data`

### PATCH /auth/change-password
**Auth**: Required  
**Body**:
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### POST /auth/logout
**Auth**: Required  
**Description**: Logout current user

---

## Users Management
### GET /users
**Auth**: ADMIN only  
**Query**: `?page=1&limit=20&role=FREELANCE&search=john`  
**Description**: List all users (admin only)

### GET /users/:id
**Auth**: ADMIN or own profile  
**Description**: Get user by ID

### PATCH /users/:id/status
**Auth**: ADMIN only  
**Body**: `{"isActive": true}`  
**Description**: Activate/deactivate user

---

## Freelancer Profiles
### GET /freelancers/me
**Auth**: FREELANCE  
**Description**: Get own freelancer profile  
**Response**: Full freelancer profile with portfolio

### PUT /freelancers/me
**Auth**: FREELANCE  
**Body**:
```json
{
  "title": "Senior Full-Stack Developer",
  "bio": "Experienced developer...",
  "skills": [{"name": "React", "level": "expert"}],
  "seniority": "senior",
  "dailyRate": 500,
  "availability": {"status": "available", "startDate": "2024-02-01"},
  "location": "Paris",
  "remote": true,
  "languages": ["French", "English"]
}
```

### GET /freelancers/:id
**Description**: Get public freelancer profile (for companies)

### GET /freelancers
**Query**: `?skills[]=React&seniority=senior&minRate=300&maxRate=600&location=Paris&remote=true&page=1&limit=20`  
**Description**: Search freelancers (public)

---

## Portfolio Management
### GET /freelancers/me/portfolio
**Auth**: FREELANCE  
**Description**: Get own portfolio items

### POST /freelancers/me/portfolio
**Auth**: FREELANCE  
**Body**:
```json
{
  "title": "E-commerce Platform",
  "description": "Full-stack e-commerce solution...",
  "technologies": ["React", "Node.js", "PostgreSQL"],
  "links": [{"type": "live", "url": "https://example.com"}],
  "impact": "Increased sales by 40%",
  "duration": "3 months",
  "teamSize": 3
}
```

### PUT /freelancers/me/portfolio/:id
**Auth**: FREELANCE  
**Description**: Update portfolio item

### DELETE /freelancers/me/portfolio/:id
**Auth**: FREELANCE  
**Description**: Delete portfolio item

---

## Company Profiles
### GET /companies/me
**Auth**: COMPANY  
**Description**: Get own company profile

### PUT /companies/me
**Auth**: COMPANY  
**Body**:
```json
{
  "name": "TechCorp Inc",
  "industry": "Fintech",
  "size": "50-100",
  "description": "Leading fintech company...",
  "website": "https://techcorp.com",
  "location": "Paris",
  "values": ["innovation", "collaboration"]
}
```

### GET /companies/:id
**Description**: Get public company profile

---

## Missions
### POST /missions
**Auth**: COMPANY  
**Body**:
```json
{
  "title": "Senior React Developer",
  "description": "We need an experienced React developer...",
  "requiredSkills": ["React", "TypeScript", "Node.js"],
  "optionalSkills": ["AWS", "Docker"],
  "budgetMin": 400,
  "budgetMax": 600,
  "duration": "3-6 months",
  "modality": "remote",
  "sector": "Fintech",
  "urgency": "high",
  "experience": "senior",
  "startDate": "2024-03-01"
}
```

### GET /missions
**Query**: `?q=react&skills[]=React&sector=Fintech&seniority=senior&budgetMin=300&budgetMax=700&duration=3-6 months&modality=remote&urgency=high&page=1&limit=20&sort=createdAt:desc`  
**Description**: Search missions (public with optional auth for personalized results)

### GET /missions/:id
**Description**: Get mission details (public)

### PUT /missions/:id
**Auth**: COMPANY (owner) or ADMIN  
**Description**: Update mission

### DELETE /missions/:id
**Auth**: COMPANY (owner) or ADMIN  
**Description**: Delete mission

### PATCH /missions/:id/status
**Auth**: COMPANY (owner) or ADMIN  
**Body**: `{"status": "PUBLISHED" | "COMPLETED" | "CANCELLED"}`

---

## Applications
### POST /applications
**Auth**: FREELANCE  
**Body**:
```json
{
  "missionId": "mission_id",
  "coverLetter": "I'm very interested in this position...",
  "proposedRate": 450,
  "availabilityPlan": "Available to start March 1st, 40h/week"
}
```

### GET /applications/me
**Auth**: FREELANCE  
**Query**: `?status=PENDING&page=1&limit=20`  
**Description**: Get own applications

### GET /applications/mission/:missionId
**Auth**: COMPANY (owner) or ADMIN  
**Description**: Get applications for a mission

### PATCH /applications/:id/status
**Auth**: COMPANY (mission owner) or ADMIN  
**Body**: `{"status": "SHORTLISTED" | "REJECTED" | "ACCEPTED", "notes": "Great profile"}`

### GET /applications/:id
**Auth**: Owner (freelancer/company) or ADMIN  
**Description**: Get application details

---

## Matching Engine
### GET /matching/missions
**Auth**: FREELANCE or ADMIN  
**Query**: `?freelancerId=current_user&limit=10`  
**Description**: Get top matching missions for freelancer  
**Response**: `[{mission, matchScore, matchReasons: ["skill_overlap", "budget_fit"]}]`

### GET /matching/freelancers
**Auth**: COMPANY or ADMIN  
**Query**: `?missionId=mission_id&limit=10`  
**Description**: Get top matching freelancers for mission  
**Response**: `[{freelancer, matchScore, matchReasons}]`

---

## Assessments
### POST /assessments
**Auth**: COMPANY or ADMIN  
**Body**:
```json
{
  "applicationId": "app_id",
  "type": "QCM" | "CHALLENGE" | "TECHNICAL_TEST",
  "title": "React Technical Test",
  "description": "Evaluate React knowledge",
  "questions": [{"question": "What is JSX?", "type": "text"}],
  "maxScore": 100,
  "timeLimit": 60
}
```

### GET /assessments/:id
**Auth**: Owner or reviewer  
**Description**: Get assessment details

### POST /assessments/:id/submit
**Auth**: FREELANCE (candidate)  
**Body**:
```json
{
  "answers": [{"questionId": 1, "answer": "JavaScript XML"}]
}
```

### PATCH /assessments/:id/score
**Auth**: COMPANY (reviewer) or ADMIN  
**Body**: `{"score": 85, "reviewNotes": "Good understanding of React concepts"}`

---

## Interviews
### POST /interviews/schedule
**Auth**: COMPANY or ADMIN  
**Body**:
```json
{
  "applicationId": "app_id",
  "scheduledAt": "2024-03-15T10:00:00Z",
  "duration": 60,
  "meetingLink": "https://meet.google.com/abc-def-ghi"
}
```

### GET /interviews/:id
**Auth**: Participants or ADMIN  
**Description**: Get interview details

### PATCH /interviews/:id/notes
**Auth**: COMPANY or ADMIN  
**Body**: `{"notes": "Candidate shows strong technical skills", "rating": 4.5}`

### PATCH /interviews/:id/complete
**Auth**: COMPANY or ADMIN  
**Body**: `{"completed": true, "rating": 4.0}`

---

## Contracts & Milestones
### POST /contracts
**Auth**: COMPANY or ADMIN  
**Body**:
```json
{
  "missionId": "mission_id",
  "freelancerId": "freelancer_id",
  "terms": {"scope": "Full development", "deliverables": ["App", "Documentation"]},
  "hourlyRate": 500,
  "startDate": "2024-03-01",
  "endDate": "2024-06-01"
}
```

### GET /contracts/:id
**Auth**: Contract parties or ADMIN  
**Description**: Get contract details with milestones

### PATCH /contracts/:id/sign
**Auth**: Contract parties  
**Description**: Sign contract

### POST /contracts/:id/milestones
**Auth**: Contract parties or ADMIN  
**Body**:
```json
{
  "title": "Phase 1 - Design",
  "description": "Complete UI/UX design",
  "amount": 2000,
  "dueDate": "2024-04-01"
}
```

### PATCH /milestones/:id/approve
**Auth**: COMPANY  
**Body**: `{"approved": true, "deliverable": "Design files delivered"}`

### PATCH /milestones/:id/submit
**Auth**: FREELANCE  
**Body**: `{"deliverable": "Phase completed as per requirements"}`

---

## Payments
### POST /payments/:milestoneId/pay
**Auth**: COMPANY  
**Body**: `{"paymentMethod": "card"}`  
**Description**: Process payment for approved milestone (mock)

### GET /payments/history
**Auth**: Contract parties  
**Query**: `?contractId=contract_id`  
**Description**: Get payment history

### POST /payments/webhook
**Description**: Handle payment webhooks (public, verified by signature)

---

## Tracking & Project Management
### POST /tracking/:contractId/log
**Auth**: FREELANCE  
**Body**:
```json
{
  "date": "2024-03-15",
  "hours": 8,
  "description": "Implemented user authentication",
  "deliverable": "Auth module completed",
  "attachments": ["file1.pdf"]
}
```

### GET /tracking/:contractId
**Auth**: Contract parties or ADMIN  
**Description**: Get project tracking entries

### PATCH /tracking/:entryId/approve
**Auth**: COMPANY  
**Body**: `{"approved": true}`

### GET /tracking/:contractId/summary
**Auth**: Contract parties or ADMIN  
**Description**: Get project summary (total hours, progress, etc.)

---

## Feedback & Reviews
### POST /feedback
**Auth**: FREELANCE or COMPANY  
**Body**:
```json
{
  "toUserId": "user_id",
  "missionId": "mission_id",
  "contractId": "contract_id",
  "rating": 4.5,
  "comment": "Excellent work quality and communication",
  "skills": {"technical": 5, "communication": 4, "timeliness": 5},
  "isPublic": true
}
```

### GET /feedback/user/:userId
**Description**: Get user's public feedback/reviews  
**Query**: `?page=1&limit=10`

### GET /feedback/me
**Auth**: Required  
**Description**: Get own received feedback

---

## Disputes & Mediation
### POST /disputes
**Auth**: Contract parties  
**Body**:
```json
{
  "contractId": "contract_id",
  "reason": "Payment delay",
  "description": "Milestone approved but payment not processed"
}
```

### GET /disputes
**Auth**: ADMIN  
**Query**: `?status=OPEN&page=1&limit=20`  
**Description**: List disputes (admin only)

### PATCH /disputes/:id/status
**Auth**: ADMIN  
**Body**: `{"status": "RESOLVED", "resolution": "Payment processed", "resolverId": "admin_id"}`

---

## Analytics & Insights
### GET /analytics/summary
**Auth**: Required (role-aware)  
**Description**: Get role-specific analytics dashboard
- **FREELANCE**: Revenue forecasts, skill demand, profile optimization tips
- **COMPANY**: ROI metrics, sourcing time, satisfaction rates  
- **ADMIN**: Platform metrics, user activity, financial overview

### GET /analytics/top-skills
**Auth**: ADMIN  
**Description**: Get trending skills and market demand

### GET /analytics/market-trends
**Auth**: Public or ADMIN  
**Description**: Get market trends (rates, popular technologies, etc.)

### GET /analytics/freelancer/performance
**Auth**: FREELANCE  
**Query**: `?period=month`  
**Description**: Detailed freelancer performance metrics

### GET /analytics/company/hiring
**Auth**: COMPANY  
**Query**: `?period=quarter`  
**Description**: Company hiring analytics and insights

---

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Cache Strategy
- **Missions list**: Cached by filters (TTL: 300s)
- **Matching results**: Cached by user/mission (TTL: 180s)  
- **Analytics summaries**: Cached by user role (TTL: 600s)
- **User profiles**: Cached (TTL: 1800s)

Cache invalidation on relevant mutations (create/update operations).