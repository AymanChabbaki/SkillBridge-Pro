import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.feedback.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.trackingEntry.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.freelancerProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillbridge.pro',
      password: hashedPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  // Create company users
  const companies = [];
  for (let i = 1; i <= 3; i++) {
    const company = await prisma.user.create({
      data: {
        email: `company${i}@example.com`,
        password: hashedPassword,
        name: `Company ${i} User`,
        role: UserRole.COMPANY,
        companyProfile: {
          create: {
            name: `TechCorp ${i}`,
            industry: i === 1 ? 'Fintech' : i === 2 ? 'E-commerce' : 'Healthcare',
            size: i === 1 ? '50-100' : i === 2 ? '100-500' : '10-50',
            description: `Leading company in ${i === 1 ? 'financial technology' : i === 2 ? 'e-commerce solutions' : 'healthcare innovation'}`,
            website: `https://techcorp${i}.com`,
            location: i === 1 ? 'Paris' : i === 2 ? 'Lyon' : 'Marseille',
            verified: true,
          },
        },
      },
      include: {
        companyProfile: true,
      },
    });
    companies.push(company);
  }

  // Create freelancer users
  const freelancers = [];
  const skillSets = [
    ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    ['Python', 'Django', 'PostgreSQL', 'Docker'],
    ['Java', 'Spring Boot', 'Microservices', 'AWS'],
    ['PHP', 'Laravel', 'MySQL', 'Vue.js'],
    ['C#', '.NET', 'Azure', 'SQL Server'],
  ];

  for (let i = 1; i <= 5; i++) {
    const freelancer = await prisma.user.create({
      data: {
        email: `freelancer${i}@example.com`,
        password: hashedPassword,
        name: `Freelance Developer ${i}`,
        role: UserRole.FREELANCE,
        freelancerProfile: {
          create: {
            title: `Senior ${skillSets[i-1][0]} Developer`,
            bio: `Experienced developer with ${3 + i} years in the industry`,
            skills: skillSets[i-1].map(skill => ({ name: skill, level: 'expert' })),
            seniority: i <= 2 ? 'senior' : i <= 4 ? 'mid' : 'junior',
            dailyRate: 400 + (i * 50),
            availability: { status: 'available', startDate: '2024-02-01' },
            location: 'Remote',
            remote: true,
            languages: ['French', 'English'],
            experience: 3 + i,
            rating: 4.2 + (i * 0.1),
            completedJobs: 10 + (i * 2),
          },
        },
      },
      include: {
        freelancerProfile: true,
      },
    });
    freelancers.push(freelancer);

    // Create portfolio items for each freelancer
    for (let j = 1; j <= 2; j++) {
      await prisma.portfolioItem.create({
        data: {
          freelancerId: freelancer.freelancerProfile!.id,
          title: `Project ${j} - ${skillSets[i-1][0]} Application`,
          description: `A comprehensive ${skillSets[i-1][0]} application built with modern technologies`,
          technologies: skillSets[i-1],
          links: [
            { type: 'live', url: `https://project${i}-${j}.example.com` },
            { type: 'github', url: `https://github.com/freelancer${i}/project${j}` },
          ],
          impact: `Increased client efficiency by ${20 + (j * 10)}%`,
          duration: `${2 + j} months`,
          teamSize: j,
        },
      });
    }
  }

  // Create missions
  const missionTitles = [
    'Full-Stack Developer for Fintech Platform',
    'React Developer for E-commerce App',
    'Backend Developer for Healthcare System',
    'Frontend Developer for Marketing Website',
    'DevOps Engineer for Cloud Migration',
    'Mobile Developer for iOS App',
    'Python Developer for Data Pipeline',
    'UI/UX Designer for SaaS Platform',
    'WordPress Developer for Corporate Site',
    'Blockchain Developer for DeFi Project',
  ];

  const missions = [];
  for (let i = 0; i < 10; i++) {
    const companyIndex = i % 3;
    const mission = await prisma.mission.create({
      data: {
        companyId: companies[companyIndex].companyProfile!.id,
        title: missionTitles[i],
        description: `We are looking for a skilled developer to join our team and help build ${missionTitles[i].toLowerCase()}. The ideal candidate should have strong technical skills and experience with modern development practices.`,
        requiredSkills: skillSets[i % 5].slice(0, 3),
        optionalSkills: skillSets[i % 5].slice(3),
        budgetMin: 300 + (i * 50),
        budgetMax: 600 + (i * 100),
        duration: ['1-3 months', '3-6 months', '6-12 months'][i % 3],
        modality: ['remote', 'on-site', 'hybrid'][i % 3],
        sector: ['Technology', 'Finance', 'Healthcare', 'E-commerce'][i % 4],
        urgency: ['low', 'medium', 'high'][i % 3],
        experience: ['junior', 'mid', 'senior'][i % 3],
        startDate: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)), // Stagger start dates
        views: Math.floor(Math.random() * 100) + 10,
      },
    });
    missions.push(mission);
  }

  // Create applications
  const applications = [];
  for (let i = 0; i < 15; i++) {
    const missionIndex = i % 10;
    const freelancerIndex = i % 5;
    
    try {
      const application = await prisma.application.create({
        data: {
          missionId: missions[missionIndex].id,
          freelancerId: freelancers[freelancerIndex].freelancerProfile!.id,
          coverLetter: `I'm very interested in the ${missions[missionIndex].title} position. With my experience in relevant technologies, I believe I can contribute effectively to your project.`,
          proposedRate: 350 + (i * 25),
          availabilityPlan: 'Available to start immediately, can commit 40 hours per week',
          status: ['PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'][i % 4] as any,
          matchingScore: 0.6 + (Math.random() * 0.4),
        },
      });
      applications.push(application);
    } catch (error) {
      // Skip duplicate applications (same freelancer applying to same mission)
      continue;
    }
  }

  // Create assessments for some applications
  for (let i = 0; i < Math.min(5, applications.length); i++) {
    await prisma.assessment.create({
      data: {
        applicationId: applications[i].id,
        type: ['QCM', 'CHALLENGE', 'TECHNICAL_TEST'][i % 3] as any,
        title: `Technical Assessment ${i + 1}`,
        description: 'Technical evaluation to assess candidate skills',
        questions: [
          { question: 'What is your experience with React?', type: 'text' },
          { question: 'Explain the concept of closures in JavaScript', type: 'text' },
        ],
        maxScore: 100,
        score: 70 + (Math.random() * 30),
        reviewerId: companies[i % 3].id,
        submittedAt: new Date(),
      },
    });
  }

  // Create interviews
  for (let i = 0; i < Math.min(3, applications.length); i++) {
    await prisma.interview.create({
      data: {
        applicationId: applications[i].id,
        scheduledAt: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
        duration: 60,
        meetingLink: 'https://meet.google.com/mock-link',
        notes: 'Candidate shows strong technical knowledge and communication skills',
        completed: i < 2,
        rating: i < 2 ? 4.0 + (Math.random() * 1.0) : undefined,
      },
    });
  }

  // Create contracts with milestones and payments
  for (let i = 0; i < 3; i++) {
    const contract = await prisma.contract.create({
      data: {
        missionId: missions[i].id,
        freelancerId: freelancers[i].freelancerProfile!.id,
        terms: {
          scope: 'Full development as per mission requirements',
          deliverables: ['Design mockups', 'Working application', 'Documentation'],
          timeline: '3 months',
        },
        hourlyRate: 450 + (i * 50),
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        signedAt: new Date(),
      },
    });

    // Create milestones for each contract
    for (let j = 0; j < 3; j++) {
      const milestone = await prisma.milestone.create({
        data: {
          contractId: contract.id,
          title: `Milestone ${j + 1}`,
          description: `Phase ${j + 1} deliverable`,
          amount: 1500 + (j * 500),
          dueDate: new Date(Date.now() + (j + 1) * 30 * 24 * 60 * 60 * 1000),
          status: j === 0 ? 'APPROVED' : 'PENDING',
          approvedAt: j === 0 ? new Date() : undefined,
        },
      });

      // Create payment for approved milestone
      if (j === 0) {
        await prisma.payment.create({
          data: {
            milestoneId: milestone.id,
            amount: milestone.amount,
            status: 'COMPLETED',
            transactionId: `tx_${Date.now()}_${j}`,
            processedAt: new Date(),
          },
        });
      }
    }

    // Create multiple tracking entries for this contract with richer data
    const trackingSamples = [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        hours: 8,
        description: 'Initial project setup and architecture planning',
        deliverable: 'Architecture docs',
        attachments: ['https://example.com/arch-design.pdf'],
        approved: true,
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        hours: 5.5,
        description: 'Implemented core authentication flow',
        deliverable: 'Auth module',
        attachments: [],
        approved: false,
      },
      {
        date: new Date(), // today
        hours: 6,
        description: 'Bug fixes and PR reviews',
        deliverable: 'Resolved issues from QA',
        attachments: ['https://example.com/screenshot-issue.png'],
        approved: false,
      },
    ];

    for (const t of trackingSamples) {
      await prisma.trackingEntry.create({
        data: {
          contractId: contract.id,
          date: t.date,
          hours: t.hours,
          description: t.description,
          deliverable: t.deliverable,
          attachments: t.attachments,
          approved: t.approved,
          approvedAt: t.approvedAt,
        },
      });
    }
  }

  // Create feedback
  for (let i = 0; i < 5; i++) {
    await prisma.feedback.create({
      data: {
        fromUserId: companies[i % 3].id,
        toUserId: freelancers[i % 5].id,
        missionId: missions[i % 10].id,
        rating: 4.0 + (Math.random() * 1.0),
        comment: 'Excellent work quality and communication. Would definitely work with again.',
        skills: {
          technical: 4.5,
          communication: 4.8,
          timeliness: 4.2,
        },
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Created:
    - 1 admin user
    - 3 company users with profiles
    - 5 freelancer users with profiles
    - 10 portfolio items
    - 10 missions
    - ${applications.length} applications
    - 5 assessments
    - 3 interviews
    - 3 contracts with 9 milestones
    - 3 payments
    - 3 tracking entries
    - 5 feedback entries
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });