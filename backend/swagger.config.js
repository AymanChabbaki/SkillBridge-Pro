const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Freelance Platform API',
      version: '1.0.0',
      description: 'A comprehensive freelance marketplace platform API',
      contact: {
        name: 'API Support',
        email: 'support@freelanceplatform.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            error: {
              type: 'object',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['FREELANCER', 'CLIENT', 'ADMIN'],
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
            },
          },
        },
        CreateInterview: {
          type: 'object',
          properties: {
            applicationId: {
              type: 'string',
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
            },
            duration: {
              type: 'integer',
              minimum: 15,
              maximum: 180,
            },
            meetingUrl: {
              type: 'string',
              format: 'uri',
            },
            notes: {
              type: 'string',
            },
          },
          required: ['applicationId', 'scheduledAt', 'duration'],
        },
        UpdateInterview: {
          type: 'object',
          properties: {
            scheduledAt: {
              type: 'string',
              format: 'date-time',
            },
            duration: {
              type: 'integer',
              minimum: 15,
              maximum: 180,
            },
            meetingUrl: {
              type: 'string',
              format: 'uri',
            },
            notes: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            },
            clientRating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            freelancerRating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            feedback: {
              type: 'string',
            },
          },
        },
        CreateContract: {
          type: 'object',
          properties: {
            missionId: {
              type: 'string',
            },
            freelancerId: {
              type: 'string',
            },
            title: {
              type: 'string',
              maxLength: 200,
            },
            description: {
              type: 'string',
              minLength: 10,
            },
            amount: {
              type: 'number',
              minimum: 0.01,
            },
            currency: {
              type: 'string',
              length: 3,
              default: 'USD',
            },
            paymentTerms: {
              type: 'string',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            terms: {
              type: 'string',
            },
          },
          required: ['missionId', 'freelancerId', 'title', 'description', 'amount', 'startDate'],
        },
        UpdateContract: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
            },
            description: {
              type: 'string',
              minLength: 10,
            },
            amount: {
              type: 'number',
              minimum: 0.01,
            },
            paymentTerms: {
              type: 'string',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
            },
            terms: {
              type: 'string',
            },
          },
        },
        CreateMilestone: {
          type: 'object',
          properties: {
            contractId: {
              type: 'string',
            },
            title: {
              type: 'string',
              maxLength: 200,
            },
            description: {
              type: 'string',
            },
            amount: {
              type: 'number',
              minimum: 0.01,
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
            },
            deliverables: {
              type: 'string',
            },
          },
          required: ['contractId', 'title', 'amount', 'dueDate'],
        },
        UpdateMilestone: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
            },
            description: {
              type: 'string',
            },
            amount: {
              type: 'number',
              minimum: 0.01,
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'DISPUTED'],
            },
            deliverables: {
              type: 'string',
            },
            feedback: {
              type: 'string',
            },
          },
        },
        CreatePayment: {
          type: 'object',
          properties: {
            contractId: {
              type: 'string',
            },
            milestoneId: {
              type: 'string',
            },
            amount: {
              type: 'number',
              minimum: 0.01,
            },
            currency: {
              type: 'string',
              length: 3,
              default: 'USD',
            },
            type: {
              type: 'string',
              enum: ['PROJECT_PAYMENT', 'MILESTONE_PAYMENT', 'BONUS', 'REFUND'],
            },
            description: {
              type: 'string',
            },
            paymentMethod: {
              type: 'string',
            },
          },
          required: ['amount', 'type'],
        },
        ProcessPayment: {
          type: 'object',
          properties: {
            paymentMethodId: {
              type: 'string',
            },
            savePaymentMethod: {
              type: 'boolean',
              default: false,
            },
          },
          required: ['paymentMethodId'],
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/**/*.ts'], // paths to files containing OpenAPI definitions
};

module.exports = options;