import { fetchJobs, filterJobs } from '../services/adzunaService.js';
import { scoreJobsWithResume } from '../services/matchingService.js';

export default async function jobsRoutes(fastify, options) {
    // Get jobs with optional filters
    fastify.get('/', async (request, reply) => {
        const {
            title,
            skills,
            datePosted,
            jobType,
            workMode,
            location,
            matchScore,
            page = 1,
            limit = 20
        } = request.query;

        try {
            // Fetch jobs from Adzuna
            let jobs = await fetchJobs({
                title,
                location,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            // Apply additional filters
            jobs = filterJobs(jobs, {
                skills: skills ? skills.split(',') : [],
                datePosted,
                jobType,
                workMode
            });

            // Check if user has a resume for matching
            const sessionId = request.headers['x-session-id'];
            let resumeText = null;

            if (sessionId) {
                const session = fastify.sessions.get(sessionId);
                if (session) {
                    const user = fastify.users.get(session.email);
                    resumeText = user?.resumeText;
                }
            }

            // Score jobs if resume exists
            if (resumeText) {
                jobs = await scoreJobsWithResume(jobs, resumeText);

                // Filter by match score if specified
                if (matchScore === 'high') {
                    jobs = jobs.filter(job => job.matchScore >= 70);
                } else if (matchScore === 'medium') {
                    jobs = jobs.filter(job => job.matchScore >= 40 && job.matchScore < 70);
                }

                // Sort by match score descending
                jobs.sort((a, b) => b.matchScore - a.matchScore);
            }

            return {
                success: true,
                jobs,
                total: jobs.length,
                page: parseInt(page),
                limit: parseInt(limit)
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to fetch jobs',
                error: error.message
            });
        }
    });

    // Get best matches (top 8 highest scoring)
    fastify.get('/best-matches', async (request, reply) => {
        const sessionId = request.headers['x-session-id'];

        if (!sessionId) {
            return reply.status(401).send({ success: false, message: 'Not authenticated' });
        }

        const session = fastify.sessions.get(sessionId);
        if (!session) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }

        const user = fastify.users.get(session.email);
        if (!user?.resumeText) {
            return { success: true, jobs: [], message: 'Upload resume to see best matches' };
        }

        try {
            // Fetch a larger batch of jobs
            let jobs = await fetchJobs({ limit: 50 });

            // Score all jobs
            jobs = await scoreJobsWithResume(jobs, user.resumeText);

            // Sort by score and return top 8
            jobs.sort((a, b) => b.matchScore - a.matchScore);
            const bestMatches = jobs.slice(0, 8);

            return { success: true, jobs: bestMatches };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                message: 'Failed to get best matches'
            });
        }
    });
}
