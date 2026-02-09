import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI model
const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.2,
    openAIApiKey: process.env.OPENAI_API_KEY
});

// Prompt template for job matching
const matchingPrompt = PromptTemplate.fromTemplate(`
You are a job matching expert. Analyze how well a candidate's resume matches a job posting.

RESUME:
{resume}

JOB POSTING:
Title: {jobTitle}
Company: {company}
Description: {jobDescription}
Required Skills: {jobSkills}

Analyze the match and provide:
1. A match score from 0-100 (be realistic, 70+ means excellent match)
2. List of matching skills found in both resume and job
3. Relevant experience points from the resume
4. A brief explanation of the match

Respond in the following JSON format:
{{
  "score": <number 0-100>,
  "matchingSkills": [<list of skills that match>],
  "relevantExperience": [<list of relevant experience points>],
  "explanation": "<brief 1-2 sentence explanation>"
}}

JSON Response:
`);

// Parse JSON output
const outputParser = new JsonOutputParser();

// Score a single job against resume
async function scoreJob(job, resumeText) {
    try {
        const chain = matchingPrompt.pipe(model).pipe(outputParser);

        const result = await chain.invoke({
            resume: resumeText.substring(0, 3000), // Limit resume length
            jobTitle: job.title,
            company: job.company,
            jobDescription: job.description.substring(0, 1500), // Limit description
            jobSkills: job.skills.join(', ')
        });

        return {
            matchScore: Math.min(100, Math.max(0, result.score || 0)),
            matchDetails: {
                matchingSkills: result.matchingSkills || [],
                relevantExperience: result.relevantExperience || [],
                explanation: result.explanation || 'No explanation available'
            }
        };
    } catch (error) {
        console.error('Error scoring job:', error);
        // Return fallback scoring based on keyword matching
        return fallbackScoring(job, resumeText);
    }
}

// Fallback scoring when LLM is unavailable
function fallbackScoring(job, resumeText) {
    const resumeLower = resumeText.toLowerCase();
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    // Check for skill matches
    const matchingSkills = job.skills.filter(skill =>
        resumeLower.includes(skill.toLowerCase())
    );

    // Check for title keywords
    const titleWords = job.title.toLowerCase().split(/\s+/);
    const titleMatches = titleWords.filter(word =>
        word.length > 3 && resumeLower.includes(word)
    );

    // Calculate score
    const skillScore = (matchingSkills.length / Math.max(job.skills.length, 1)) * 60;
    const titleScore = (titleMatches.length / Math.max(titleWords.length, 1)) * 40;
    const totalScore = Math.round(skillScore + titleScore);

    return {
        matchScore: Math.min(100, totalScore),
        matchDetails: {
            matchingSkills,
            relevantExperience: [],
            explanation: matchingSkills.length > 0
                ? `Found ${matchingSkills.length} matching skills: ${matchingSkills.slice(0, 3).join(', ')}`
                : 'Limited skill overlap detected'
        }
    };
}

// Score multiple jobs against resume
export async function scoreJobsWithResume(jobs, resumeText) {
    if (!resumeText) {
        return jobs;
    }

    // If OpenAI API key is not set, use fallback scoring
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.log('Using fallback scoring (no OpenAI API key)');
        return jobs.map(job => {
            const scoring = fallbackScoring(job, resumeText);
            return { ...job, ...scoring };
        });
    }

    // Score jobs in parallel with rate limiting
    const scoredJobs = [];
    const batchSize = 5; // Process 5 jobs at a time to avoid rate limits

    for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(async (job) => {
                const scoring = await scoreJob(job, resumeText);
                return { ...job, ...scoring };
            })
        );

        scoredJobs.push(...batchResults);
    }

    return scoredJobs;
}

export { scoreJob, fallbackScoring };
