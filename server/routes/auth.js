import { v4 as uuidv4 } from 'uuid';

export default async function authRoutes(fastify, options) {
    // Login
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body;

        const user = fastify.users.get(email);

        if (!user || user.password !== password) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Create session
        const sessionId = uuidv4();
        fastify.sessions.set(sessionId, {
            userId: user.id,
            email: user.email,
            createdAt: new Date()
        });

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                hasResume: !!user.resumeText
            },
            sessionId
        };
    });

    // Logout
    fastify.post('/logout', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (sessionId) {
            fastify.sessions.delete(sessionId);
        }

        return { success: true, message: 'Logged out successfully' };
    });

    // Get current user
    fastify.get('/me', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);

        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const user = fastify.users.get(session.email);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                hasResume: !!user.resumeText
            }
        };
    });
}
