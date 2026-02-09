import pdf from 'pdf-parse/lib/pdf-parse.js';

export default async function resumeRoutes(fastify, options) {
    // Upload resume
    fastify.post('/upload', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        try {
            const data = await request.file();

            if (!data) {
                return reply.status(400).send({ success: false, message: 'No file uploaded' });
            }

            const filename = data.filename.toLowerCase();
            const buffer = await data.toBuffer();

            let resumeText = '';

            if (filename.endsWith('.pdf')) {
                // Parse PDF
                const pdfData = await pdf(buffer);
                resumeText = pdfData.text;
            } else if (filename.endsWith('.txt')) {
                // Plain text
                resumeText = buffer.toString('utf-8');
            } else {
                return reply.status(400).send({
                    success: false,
                    message: 'Only PDF and TXT files are supported'
                });
            }

            // Clean up extracted text
            resumeText = resumeText
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n')
                .trim();

            // Update user's resume
            const user = fastify.users.get(session.email);
            user.resume = {
                filename: data.filename,
                uploadedAt: new Date()
            };
            user.resumeText = resumeText;

            return {
                success: true,
                message: 'Resume uploaded successfully',
                resume: {
                    filename: data.filename,
                    textLength: resumeText.length,
                    uploadedAt: user.resume.uploadedAt
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to process resume',
                error: error.message
            });
        }
    });

    // Get current resume info
    fastify.get('/', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const user = fastify.users.get(session.email);

        if (!user.resume) {
            return { success: true, hasResume: false };
        }

        return {
            success: true,
            hasResume: true,
            resume: {
                filename: user.resume.filename,
                uploadedAt: user.resume.uploadedAt,
                textPreview: user.resumeText?.substring(0, 500) + '...'
            }
        };
    });

    // Delete resume
    fastify.delete('/', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const user = fastify.users.get(session.email);
        user.resume = null;
        user.resumeText = null;

        return { success: true, message: 'Resume deleted successfully' };
    });
}
