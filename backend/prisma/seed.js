const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting JS seed...');

  // Clean existing data (order matters)
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

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create personas from the cahier de charge: Alex (freelance) and Sarah (company CTO)

  // Company persona: Sarah, CTO
  const sarah = await prisma.user.create({
    data: {
      email: 'sarah.cto@example.com',
      password: hashedPassword,
      name: 'Sarah CTO',
      role: UserRole.COMPANY,
      companyProfile: {
        create: {
          name: 'FinTech Labs',
          industry: 'FinTech',
          size: '50-200',
          description: 'Startup focused on DeFi products',
          website: 'https://fintech.example.com',
          location: 'Paris, FR',
        },
      },
    },
    include: { companyProfile: true },
  });

  // Freelancer persona: Alex, Senior React dev
  const alex = await prisma.user.create({
    data: {
      email: 'alex.react@example.com',
      password: hashedPassword,
      name: 'Alex React',
      role: UserRole.FREELANCE,
      freelancerProfile: {
        create: {
          title: 'Senior React Developer',
          skills: ['React', 'TypeScript', 'Node.js'],
          seniority: 'senior',
          dailyRate: 500,
          availability: { daysPerWeek: 3 },
          location: 'Remote',
          remote: true,
        },
      },
    },
    include: { freelancerProfile: true },
  });

  // Create 3 portfolio items for Alex
  const portfolioItems = [
    {
      title: 'E-commerce Replatform',
      description: 'Rebuilt storefront with React/Next.js and improved performance',
      technologies: ['React', 'Next.js', 'TypeScript'],
      images: [],
      links: [],
      impact: 'Improved conversion by 12%'
    },
    {
      title: 'Dashboard for Analytics',
      description: 'Realtime analytics dashboard for internal tools',
      technologies: ['React', 'D3', 'Node.js'],
      images: [],
      links: [],
      impact: 'Enabled data-driven decisions'
    },
    {
      title: 'Auth & Payments Integration',
      description: 'Implemented secure auth and payments flows',
      technologies: ['Node.js', 'Postgres', 'Stripe'],
      images: [],
      links: [],
      impact: 'Reduced payment errors by 25%'
    },
  ];

  for (const p of portfolioItems) {
    await prisma.portfolioItem.create({
      data: {
        freelancerId: alex.freelancerProfile.id,
        title: p.title,
        description: p.description,
        technologies: p.technologies,
        images: p.images,
        links: p.links,
        impact: p.impact,
      },
    });
  }

  // Sarah posts an urgent blockchain mission (Persona 2)
  const blockchainMission = await prisma.mission.create({
    data: {
      companyId: sarah.companyProfile.id,
      title: 'Blockchain Solidity Developer - POC DeFi',
      description: 'Need a Solidity developer for a 3-week DeFi POC',
      requiredSkills: ['Solidity', 'DeFi'],
      optionalSkills: ['Web3.js', 'Hardhat'],
      budgetMin: 12000,
      budgetMax: 18000,
      duration: '1 month',
      modality: 'remote',
      sector: 'FinTech',
      urgency: 'high',
      experience: 'senior',
      status: 'PUBLISHED',
      startDate: new Date(),
    },
  });

  // Platform suggests a mission matching Alex (Persona 1) - create a sample mission
  const ecommerceMission = await prisma.mission.create({
    data: {
      companyId: sarah.companyProfile.id,
      title: 'Refonte d\'interface e-commerce en React/Next.js',
      description: '2-month remote project to rebuild e-commerce UI',
      requiredSkills: ['React', 'Next.js', 'TypeScript'],
      budgetMin: 20000,
      budgetMax: 40000,
      duration: '1-3 months',
      modality: 'remote',
      sector: 'E-commerce',
      urgency: 'medium',
      experience: 'senior',
      status: 'PUBLISHED',
      startDate: new Date(),
    },
  });

  // Alex applies to the e-commerce mission with a proposal
  const application = await prisma.application.create({
    data: {
      missionId: ecommerceMission.id,
      freelancerId: alex.freelancerProfile.id,
      coverLetter: 'I can deliver the redesign in 2 months. See portfolio.',
      proposedRate: 450,
      availabilityPlan: '3 days/week',
      status: 'PENDING',
    },
  });

  // Company schedules an interview and then hires Alex - create interview and contract
  const interview = await prisma.interview.create({
    data: {
      applicationId: application.id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      meetingLink: 'https://meet.example.com/interview/abc123',
      notes: 'Technical interview',
    },
  });

  // Create a contract for Alex on the ecommerce mission with one milestone
  const contract = await prisma.contract.create({
    data: {
      missionId: ecommerceMission.id,
      freelancerId: alex.freelancerProfile.id,
      clientId: sarah.companyProfile.id,
      terms: { scope: 'Rebuild storefront UI' },
      hourlyRate: 450,
      fixedPrice: 20000,
      startDate: new Date(),
      status: 'ACTIVE',
      signedAt: new Date(),
    },
  });

  const milestone = await prisma.milestone.create({
    data: {
      contractId: contract.id,
      title: 'Phase 1 - UI Redesign',
      description: 'Deliver redesigned homepage and product pages',
      amount: 10000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    },
  });

  // Create an initial payment (mock) for the milestone
  await prisma.payment.create({
    data: {
      milestoneId: milestone.id,
      contractId: contract.id,
      payerId: sarah.id,
      amount: milestone.amount,
      currency: 'EUR',
      status: 'COMPLETED',
      paymentMethod: 'mock',
      transactionId: `mock_tx_${Date.now()}`,
      processedAt: new Date(),
    },
  });

  // Insert a couple of tracking entries for the contract
  await prisma.trackingEntry.createMany({
    data: [
      {
        contractId: contract.id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        hours: 6,
        description: 'Kickoff and design specs',
        deliverable: 'Design spec PDF',
        attachments: [],
        approved: true,
        approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        contractId: contract.id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        hours: 5,
        description: 'Implemented homepage',
        deliverable: 'Homepage code',
        attachments: [],
        approved: false,
      },
    ],
  });

  // Add a sample feedback (recommendation) from Sarah to Alex
  await prisma.feedback.create({
    data: {
      fromUserId: sarah.id,
      toUserId: alex.id,
      missionId: ecommerceMission.id,
      contractId: contract.id,
      rating: 5,
      comment: 'Excellent delivery and communication',
      skills: { technical: 5, communication: 5, timeliness: 5 },
      isPublic: true,
    },
  });

  console.log('JS seed completed: created personas Alex (freelancer) and Sarah (company) with sample data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });