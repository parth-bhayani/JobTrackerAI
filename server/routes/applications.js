import { v4 as uuidv4 } from 'uuid';

export default async function applicationsRoutes(fastify, options) {
    // Create new application
    fastify.post('/', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const { job, status = 'applied' } = request.body;

        if (!job) {
            return reply.status(400).send({ success: false, message: 'Job data required' });
        }

        const applicationId = uuidv4();
        const application = {
            id: applicationId,
            userId: session.userId,
            job: {
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                applyUrl: job.applyUrl
            },
            status,
            timeline: [
                {
                    status,
                    timestamp: new Date(),
                    note: 'Application submitted'
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Get or create user's applications list
        let userApps = fastify.applications.get(session.userId) || [];
        userApps.push(application);
        fastify.applications.set(session.userId, userApps);

        return { success: true, application };
    });

    // Get all applications for user
    fastify.get('/', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const applications = fastify.applications.get(session.userId) || [];

        // Sort by most recent first
        applications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        return { success: true, applications };
    });

    // Update application status
    fastify.patch('/:id', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const { id } = request.params;
        const { status, note } = request.body;

        const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
        if (!validStatuses.includes(status)) {
            return reply.status(400).send({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        let userApps = fastify.applications.get(session.userId) || [];
        const appIndex = userApps.findIndex(app => app.id === id);

        if (appIndex === -1) {
            return reply.status(404).send({ success: false, message: 'Application not found' });
        }

        // Update status and add to timeline
        userApps[appIndex].status = status;
        userApps[appIndex].updatedAt = new Date();
        userApps[appIndex].timeline.push({
            status,
            timestamp: new Date(),
            note: note || `Status changed to ${status}`
        });

        fastify.applications.set(session.userId, userApps);

        return { success: true, application: userApps[appIndex] };
    });

    // Delete application
    fastify.delete('/:id', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const { id } = request.params;

        let userApps = fastify.applications.get(session.userId) || [];
        const filteredApps = userApps.filter(app => app.id !== id);

        if (filteredApps.length === userApps.length) {
            return reply.status(404).send({ success: false, message: 'Application not found' });
        }

        fastify.applications.set(session.userId, filteredApps);

        return { success: true, message: 'Application deleted' };
    });
}
