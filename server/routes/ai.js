import { processAssistantMessage } from '../services/assistantService.js';

export default async function aiRoutes(fastify, options) {
    // Chat with AI assistant
    fastify.post('/chat', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const { message, conversationHistory = [] } = request.body;

        if (!message) {
            return reply.status(400).send({ success: false, message: 'Message required' });
        }

        try {
            const user = fastify.users.get(session.email);
            const resumeText = user?.resumeText || null;

            const response = await processAssistantMessage({
                message,
                conversationHistory,
                resumeText,
                userId: session.userId
            });

            return {
                success: true,
                response: response.message,
                actions: response.actions || [],
                jobs: response.jobs || []
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'AI assistant error',
                error: error.message
            });
        }
    });
}
