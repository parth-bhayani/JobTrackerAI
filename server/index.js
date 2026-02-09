import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import resumeRoutes from './routes/resume.js';
import applicationsRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const fastify = Fastify({ logger: true });

// Swagger documentation
await fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Job Tracker API',
            description: 'AI-Powered Job Tracking Platform - Backend API Documentation',
            version: '1.0.0'
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Jobs', description: 'Job fetching and matching' },
            { name: 'Resume', description: 'Resume management' },
            { name: 'Applications', description: 'Application tracking' },
            { name: 'AI', description: 'AI Assistant' }
        ]
    }
});

await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: true
    },
    staticCSP: true
});

// Register plugins
await fastify.register(cors, {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
});

await fastify.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// In-memory data stores
fastify.decorate('users', new Map([
    ['test@gmail.com', {
        id: '1',
        email: 'test@gmail.com',
        password: 'test@123',
        resume: null,
        resumeText: null
    }]
]));

fastify.decorate('applications', new Map());
fastify.decorate('sessions', new Map());

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(jobsRoutes, { prefix: '/api/jobs' });
fastify.register(resumeRoutes, { prefix: '/api/resume' });
fastify.register(applicationsRoutes, { prefix: '/api/applications' });
fastify.register(aiRoutes, { prefix: '/api/assistant' });

// Health check
fastify.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Root redirect to docs
fastify.get('/', async (request, reply) => {
    reply.redirect('/docs');
});

// Start server
const start = async () => {
    try {
        const port = process.env.PORT || 3001;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
