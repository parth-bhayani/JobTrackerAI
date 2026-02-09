import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { StateGraph, END } from '@langchain/langgraph';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI model
const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.3,
    openAIApiKey: process.env.OPENAI_API_KEY
});

// Intent detection prompt
const intentPrompt = PromptTemplate.fromTemplate(`
You are an AI assistant for a job tracking platform. Analyze the user's message and determine their intent.

User message: "{message}"

Possible intents:
1. "search" - User wants to search for jobs (e.g., "Find React jobs", "Show me remote positions")
2. "filter" - User wants to apply or change filters (e.g., "Only show remote jobs", "Filter by last 24 hours")
3. "help" - User is asking for help about the platform (e.g., "How do I upload my resume?", "Where are my applications?")
4. "clear" - User wants to clear/reset filters (e.g., "Clear all filters", "Reset filters")
5. "chat" - General conversation or unclear intent

Extract any relevant parameters:
- For search: keywords, skills, location
- For filter: workMode (remote/hybrid/on-site), jobType (full-time/part-time/contract/internship), datePosted (24h/week/month), matchScore (high/medium), location, skills

Respond in JSON format:
{{
  "intent": "<search|filter|help|clear|chat>",
  "params": {{
    "keywords": "<search keywords if any>",
    "skills": [<array of skills>],
    "workMode": "<remote|hybrid|on-site|null>",
    "jobType": "<full-time|part-time|contract|internship|null>",
    "datePosted": "<24h|week|month|null>",
    "matchScore": "<high|medium|null>",
    "location": "<location if mentioned>"
  }},
  "helpTopic": "<topic if help intent>"
}}

JSON Response:
`);

// Help response prompt
const helpPrompt = PromptTemplate.fromTemplate(`
You are a helpful assistant for a job tracking platform. Answer the user's question about using the platform.

User question: "{question}"
Topic: {topic}

Platform features:
1. Job Feed - Browse and search jobs from various sources
2. Resume Upload - Upload PDF or TXT resume for AI matching
3. AI Matching - Jobs are scored 0-100% based on resume match
4. Application Tracking - Track applied jobs with status updates (Applied → Interview → Offer/Rejected)
5. AI Assistant - Use natural language to search and filter jobs
6. Filters - Filter by role, skills, date, job type, work mode, location, match score

Provide a helpful, concise answer (2-3 sentences max).

Answer:
`);

// Output parser
const outputParser = new JsonOutputParser();

// Graph state definition
const graphState = {
    message: null,
    intent: null,
    params: null,
    response: null,
    actions: null,
    conversationHistory: []
};

// Node: Detect Intent
async function detectIntent(state) {
    try {
        const chain = intentPrompt.pipe(model).pipe(outputParser);
        const result = await chain.invoke({ message: state.message });

        return {
            ...state,
            intent: result.intent,
            params: result.params || {},
            helpTopic: result.helpTopic
        };
    } catch (error) {
        console.error('Intent detection error:', error);
        return {
            ...state,
            intent: 'chat',
            params: {}
        };
    }
}

// Node: Handle Search
async function handleSearch(state) {
    const { params } = state;

    // Build filter actions from search params
    const actions = [];

    if (params.keywords) {
        actions.push({ type: 'SET_TITLE_SEARCH', payload: params.keywords });
    }

    if (params.skills && params.skills.length > 0) {
        actions.push({ type: 'SET_SKILLS', payload: params.skills });
    }

    if (params.location) {
        actions.push({ type: 'SET_LOCATION', payload: params.location });
    }

    if (params.workMode) {
        actions.push({ type: 'SET_WORK_MODE', payload: params.workMode });
    }

    if (params.jobType) {
        actions.push({ type: 'SET_JOB_TYPE', payload: params.jobType });
    }

    // Generate response message
    let response = 'Searching for jobs';
    if (params.keywords) response += ` matching "${params.keywords}"`;
    if (params.skills?.length) response += ` with skills: ${params.skills.join(', ')}`;
    if (params.location) response += ` in ${params.location}`;
    if (params.workMode) response += ` (${params.workMode})`;

    return {
        ...state,
        response: response + '. Updating your job feed now!',
        actions
    };
}

// Node: Handle Filter
async function handleFilter(state) {
    const { params } = state;
    const actions = [];

    if (params.workMode) {
        actions.push({ type: 'SET_WORK_MODE', payload: params.workMode });
    }

    if (params.jobType) {
        actions.push({ type: 'SET_JOB_TYPE', payload: params.jobType });
    }

    if (params.datePosted) {
        actions.push({ type: 'SET_DATE_POSTED', payload: params.datePosted });
    }

    if (params.matchScore) {
        actions.push({ type: 'SET_MATCH_SCORE', payload: params.matchScore });
    }

    if (params.location) {
        actions.push({ type: 'SET_LOCATION', payload: params.location });
    }

    if (params.skills && params.skills.length > 0) {
        actions.push({ type: 'SET_SKILLS', payload: params.skills });
    }

    // Generate response
    const filterDescriptions = [];
    if (params.workMode) filterDescriptions.push(`${params.workMode} jobs`);
    if (params.jobType) filterDescriptions.push(`${params.jobType} positions`);
    if (params.datePosted) filterDescriptions.push(`posted in last ${params.datePosted}`);
    if (params.matchScore) filterDescriptions.push(`${params.matchScore} match scores`);
    if (params.location) filterDescriptions.push(`in ${params.location}`);

    const response = actions.length > 0
        ? `Applying filters for: ${filterDescriptions.join(', ')}. Your job feed is updated!`
        : "I couldn't identify any specific filters to apply. Try something like 'Show remote jobs' or 'Filter by full-time positions'.";

    return {
        ...state,
        response,
        actions
    };
}

// Node: Handle Clear Filters
async function handleClear(state) {
    return {
        ...state,
        response: 'All filters have been cleared. You can now see all available jobs!',
        actions: [{ type: 'CLEAR_ALL_FILTERS' }]
    };
}

// Node: Handle Help
async function handleHelp(state) {
    try {
        const helpChain = helpPrompt.pipe(model);
        const result = await helpChain.invoke({
            question: state.message,
            topic: state.helpTopic || 'general'
        });

        return {
            ...state,
            response: result.content,
            actions: []
        };
    } catch (error) {
        // Fallback help responses
        const helpResponses = {
            resume: 'To upload your resume, click on the "Upload Resume" button in the header or profile section. You can upload PDF or TXT files. Your resume is used to calculate job match scores.',
            applications: 'Your applications are tracked in the "Applications" tab. After applying to a job, confirm your application in the popup that appears. You can update the status as you progress through the interview process.',
            matching: 'AI matching analyzes your resume against each job posting to calculate a match score (0-100%). Green badges mean excellent match (70%+), yellow means good match (40-70%), and gray means lower match. The "Best Matches" section shows your top 8 matched jobs.',
            filters: "Use the filter panel to narrow down jobs by role, skills, date posted, job type, work mode, location, and match score. You can also tell me what you're looking for in natural language!",
            default: "I can help you search for jobs, apply filters, and navigate the platform. Try asking things like 'Show me remote React jobs' or 'How do I track my applications?'"
        };

        const topic = state.helpTopic?.toLowerCase() || 'default';
        const response = helpResponses[topic] || helpResponses.default;

        return {
            ...state,
            response,
            actions: []
        };
    }
}

// Node: Handle General Chat
async function handleChat(state) {
    return {
        ...state,
        response: "I'm your job search assistant! I can help you:\n• Search for jobs: 'Find Python developer roles'\n• Apply filters: 'Show only remote jobs'\n• Answer questions: 'How does job matching work?'\n\nWhat would you like to do?",
        actions: []
    };
}

// Router function
function routeByIntent(state) {
    switch (state.intent) {
        case 'search':
            return 'handleSearch';
        case 'filter':
            return 'handleFilter';
        case 'clear':
            return 'handleClear';
        case 'help':
            return 'handleHelp';
        default:
            return 'handleChat';
    }
}

// Build the graph
function buildAssistantGraph() {
    const graph = new StateGraph({
        channels: {
            message: { value: null },
            intent: { value: null },
            params: { value: null },
            helpTopic: { value: null },
            response: { value: null },
            actions: { value: [] },
            conversationHistory: { value: [] }
        }
    });

    // Add nodes
    graph.addNode('detectIntent', detectIntent);
    graph.addNode('handleSearch', handleSearch);
    graph.addNode('handleFilter', handleFilter);
    graph.addNode('handleClear', handleClear);
    graph.addNode('handleHelp', handleHelp);
    graph.addNode('handleChat', handleChat);

    // Add edges
    graph.setEntryPoint('detectIntent');
    graph.addConditionalEdges('detectIntent', routeByIntent, {
        handleSearch: 'handleSearch',
        handleFilter: 'handleFilter',
        handleClear: 'handleClear',
        handleHelp: 'handleHelp',
        handleChat: 'handleChat'
    });

    // All handlers go to END
    graph.addEdge('handleSearch', END);
    graph.addEdge('handleFilter', END);
    graph.addEdge('handleClear', END);
    graph.addEdge('handleHelp', END);
    graph.addEdge('handleChat', END);

    return graph.compile();
}

// Main function to process messages
export async function processAssistantMessage({ message, conversationHistory = [], resumeText, userId }) {
    // If no OpenAI key, use fallback processing
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        return fallbackProcessing(message);
    }

    try {
        const graph = buildAssistantGraph();

        const result = await graph.invoke({
            message,
            conversationHistory
        });

        return {
            message: result.response,
            actions: result.actions || [],
            jobs: []
        };
    } catch (error) {
        console.error('Assistant error:', error);
        return fallbackProcessing(message);
    }
}

// Fallback processing when LLM is unavailable
function fallbackProcessing(message) {
    const lowerMessage = message.toLowerCase();

    // Clear filters
    if (lowerMessage.includes('clear') && lowerMessage.includes('filter')) {
        return {
            message: 'All filters have been cleared!',
            actions: [{ type: 'CLEAR_ALL_FILTERS' }],
            jobs: []
        };
    }

    // Work mode filters
    if (lowerMessage.includes('remote')) {
        return {
            message: 'Showing remote jobs only!',
            actions: [{ type: 'SET_WORK_MODE', payload: 'remote' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('hybrid')) {
        return {
            message: 'Showing hybrid jobs only!',
            actions: [{ type: 'SET_WORK_MODE', payload: 'hybrid' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('on-site') || lowerMessage.includes('onsite')) {
        return {
            message: 'Showing on-site jobs only!',
            actions: [{ type: 'SET_WORK_MODE', payload: 'on-site' }],
            jobs: []
        };
    }

    // Job type filters
    if (lowerMessage.includes('full-time') || lowerMessage.includes('fulltime')) {
        return {
            message: 'Showing full-time positions only!',
            actions: [{ type: 'SET_JOB_TYPE', payload: 'full-time' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('part-time') || lowerMessage.includes('parttime')) {
        return {
            message: 'Showing part-time positions only!',
            actions: [{ type: 'SET_JOB_TYPE', payload: 'part-time' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('intern')) {
        return {
            message: 'Showing internship positions only!',
            actions: [{ type: 'SET_JOB_TYPE', payload: 'internship' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('contract')) {
        return {
            message: 'Showing contract positions only!',
            actions: [{ type: 'SET_JOB_TYPE', payload: 'contract' }],
            jobs: []
        };
    }

    // Date filters
    if (lowerMessage.includes('24 hour') || lowerMessage.includes('today') || lowerMessage.includes('last day')) {
        return {
            message: 'Showing jobs posted in the last 24 hours!',
            actions: [{ type: 'SET_DATE_POSTED', payload: '24h' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('this week') || lowerMessage.includes('last week')) {
        return {
            message: 'Showing jobs posted in the last week!',
            actions: [{ type: 'SET_DATE_POSTED', payload: 'week' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('this month') || lowerMessage.includes('last month')) {
        return {
            message: 'Showing jobs posted in the last month!',
            actions: [{ type: 'SET_DATE_POSTED', payload: 'month' }],
            jobs: []
        };
    }

    // Match score filters
    if (lowerMessage.includes('high match') || lowerMessage.includes('best match')) {
        return {
            message: 'Showing only high match score jobs (70%+)!',
            actions: [{ type: 'SET_MATCH_SCORE', payload: 'high' }],
            jobs: []
        };
    }

    if (lowerMessage.includes('medium match')) {
        return {
            message: 'Showing medium match score jobs (40-70%)!',
            actions: [{ type: 'SET_MATCH_SCORE', payload: 'medium' }],
            jobs: []
        };
    }

    // Skill-based search
    const skills = ['react', 'node', 'python', 'java', 'javascript', 'typescript', 'angular', 'vue', 'django', 'flask', 'aws', 'docker', 'kubernetes', 'ml', 'machine learning', 'ai', 'data science', 'sql', 'mongodb', 'pytorch', 'tensorflow'];
    const foundSkills = skills.filter(skill => lowerMessage.includes(skill));

    if (foundSkills.length > 0) {
        return {
            message: `Searching for jobs with skills: ${foundSkills.join(', ')}!`,
            actions: [{ type: 'SET_SKILLS', payload: foundSkills }],
            jobs: []
        };
    }

    // Help topics
    if (lowerMessage.includes('resume') || lowerMessage.includes('upload')) {
        return {
            message: 'To upload your resume, click the "Upload Resume" button in the header. You can upload PDF or TXT files. Your resume helps our AI match you with the best jobs!',
            actions: [],
            jobs: []
        };
    }

    if (lowerMessage.includes('application') || lowerMessage.includes('applied') || lowerMessage.includes('track')) {
        return {
            message: 'View your applications in the "My Applications" section. After clicking Apply on a job, confirm your application when you return. Track your progress from Applied → Interview → Offer/Rejected.',
            actions: [],
            jobs: []
        };
    }

    if (lowerMessage.includes('match') || lowerMessage.includes('score')) {
        return {
            message: 'Each job shows a match score (0-100%) based on how well it matches your resume. Green = excellent (70%+), Yellow = good (40-70%), Gray = lower match. Upload your resume to see match scores!',
            actions: [],
            jobs: []
        };
    }

    // Default response
    return {
        message: "I can help you find jobs! Try saying:\n• 'Show me remote React developer jobs'\n• 'Filter by full-time positions'\n• 'Show high match scores only'\n• 'How do I upload my resume?'",
        actions: [],
        jobs: []
    };
}
