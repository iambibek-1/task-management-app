import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'A comprehensive task management API with user authentication, task CRUD operations, and advanced features',
      contact: {
        name: 'API Support',
        email: 'support@taskmanager.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Complete project documentation' },
            description: { type: 'string', example: 'Write comprehensive API documentation' },
            status: { type: 'string', enum: ['completed', 'inProgress', 'incompleted'], example: 'inProgress' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
            assignedUsers: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' }
                }
              },
              example: [{ id: 2, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }]
            },
            dueDate: { type: 'string', format: 'date-time', nullable: true, example: '2024-12-31T23:59:59Z' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login successful' },
            success: { type: 'boolean', example: true },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            success: { type: 'boolean', example: false },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
