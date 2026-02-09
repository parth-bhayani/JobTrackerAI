import dotenv from 'dotenv';
dotenv.config();

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api';

// Map job types to Adzuna contract types
const jobTypeMap = {
    'full-time': 'permanent',
    'part-time': 'part_time',
    'contract': 'contract',
    'internship': 'permanent' // Adzuna doesn't have internship, use permanent
};

// Fetch jobs from Adzuna API
export async function fetchJobs({ title = '', location = '', page = 1, limit = 20 }) {
    try {
        // Default to India (in) for location, can be changed
        const country = 'in';

        let url = `${ADZUNA_BASE_URL}/jobs/${country}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=${limit}`;

        if (title) {
            url += `&what=${encodeURIComponent(title)}`;
        }

        if (location) {
            url += `&where=${encodeURIComponent(location)}`;
        }

        // Add content type for JSON
        url += '&content-type=application/json';

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Adzuna API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform Adzuna response to our job format
        const jobs = (data.results || []).map(job => ({
            id: job.id,
            title: job.title,
            company: job.company?.display_name || 'Company Not Specified',
            location: job.location?.display_name || 'Location Not Specified',
            description: job.description || '',
            jobType: detectJobType(job),
            workMode: detectWorkMode(job),
            salary: job.salary_min && job.salary_max
                ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
                : job.salary_is_predicted ? 'Salary not disclosed' : null,
            applyUrl: job.redirect_url,
            datePosted: job.created,
            category: job.category?.label || 'General',
            skills: extractSkills(job.description || ''),
            matchScore: 0,
            matchDetails: null
        }));

        return jobs;
    } catch (error) {
        console.error('Error fetching jobs from Adzuna:', error);

        // Return mock data if API fails (for development without API keys)
        return getMockJobs();
    }
}

// Filter jobs based on criteria
export function filterJobs(jobs, { skills = [], datePosted, jobType, workMode }) {
    let filtered = [...jobs];

    // Filter by skills
    if (skills.length > 0) {
        filtered = filtered.filter(job => {
            const jobSkills = job.skills.map(s => s.toLowerCase());
            return skills.some(skill =>
                jobSkills.includes(skill.toLowerCase()) ||
                job.description.toLowerCase().includes(skill.toLowerCase()) ||
                job.title.toLowerCase().includes(skill.toLowerCase())
            );
        });
    }

    // Filter by date posted
    if (datePosted) {
        const now = new Date();
        let cutoffDate;

        switch (datePosted) {
            case '24h':
                cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                cutoffDate = null;
        }

        if (cutoffDate) {
            filtered = filtered.filter(job => new Date(job.datePosted) >= cutoffDate);
        }
    }

    // Filter by job type
    if (jobType && jobType !== 'all') {
        filtered = filtered.filter(job =>
            job.jobType?.toLowerCase() === jobType.toLowerCase()
        );
    }

    // Filter by work mode
    if (workMode && workMode !== 'all') {
        filtered = filtered.filter(job =>
            job.workMode?.toLowerCase() === workMode.toLowerCase()
        );
    }

    return filtered;
}

// Helper function to detect job type from job data
function detectJobType(job) {
    const text = `${job.title} ${job.description}`.toLowerCase();

    if (text.includes('intern') || text.includes('internship')) return 'Internship';
    if (text.includes('contract') || text.includes('contractor')) return 'Contract';
    if (text.includes('part-time') || text.includes('part time')) return 'Part-time';

    return 'Full-time';
}

// Helper function to detect work mode
function detectWorkMode(job) {
    const text = `${job.title} ${job.description}`.toLowerCase();

    if (text.includes('remote') || text.includes('work from home') || text.includes('wfh')) {
        return 'Remote';
    }
    if (text.includes('hybrid')) {
        return 'Hybrid';
    }

    return 'On-site';
}

// Extract skills from job description
function extractSkills(description) {
    const skillKeywords = [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python',
        'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
        'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST', 'GraphQL', 'HTML', 'CSS',
        'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
        'Django', 'Flask', 'FastAPI', 'Spring', 'Express', 'Next.js'
    ];

    const foundSkills = [];
    const lowerDesc = description.toLowerCase();

    for (const skill of skillKeywords) {
        if (lowerDesc.includes(skill.toLowerCase())) {
            foundSkills.push(skill);
        }
    }

    return foundSkills;
}

// Format salary for display
function formatSalary(amount) {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
}

// Mock jobs for development/testing without API keys
function getMockJobs() {
    return [
        {
            id: 'mock-1',
            title: 'Senior React Developer',
            company: 'TechCorp India',
            location: 'Bangalore, India',
            description: 'We are looking for an experienced React developer with Node.js skills. Experience with TypeScript, Redux, and REST APIs required. Remote work available.',
            jobType: 'Full-time',
            workMode: 'Remote',
            salary: '₹15L - ₹25L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date().toISOString(),
            category: 'IT Jobs',
            skills: ['React', 'Node.js', 'TypeScript', 'Redux', 'REST'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-2',
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            location: 'Mumbai, India',
            description: 'Join our growing team! We need a full stack developer with Python, Django, and React experience. PostgreSQL and Docker knowledge is a plus.',
            jobType: 'Full-time',
            workMode: 'Hybrid',
            salary: '₹12L - ₹20L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-3',
            title: 'Machine Learning Engineer',
            company: 'AI Solutions Ltd',
            location: 'Hyderabad, India',
            description: 'Looking for ML engineer with experience in TensorFlow, PyTorch, and Python. Deep learning and NLP experience required.',
            jobType: 'Full-time',
            workMode: 'On-site',
            salary: '₹20L - ₹35L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'AI'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-4',
            title: 'Frontend Developer Intern',
            company: 'WebDev Agency',
            location: 'Delhi, India',
            description: 'Great opportunity for freshers! Learn React, HTML, CSS, and JavaScript in a fast-paced environment. Stipend provided.',
            jobType: 'Internship',
            workMode: 'Remote',
            salary: '₹15K - ₹25K/month',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['React', 'HTML', 'CSS', 'JavaScript'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-5',
            title: 'DevOps Engineer',
            company: 'CloudFirst',
            location: 'Pune, India',
            description: 'Seeking DevOps engineer with AWS, Docker, Kubernetes experience. CI/CD pipeline experience required. Terraform is a plus.',
            jobType: 'Contract',
            workMode: 'Remote',
            salary: '₹18L - ₹28L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Git'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-6',
            title: 'Backend Developer - Node.js',
            company: 'FinTech Pro',
            location: 'Bangalore, India',
            description: 'Node.js backend developer needed for fintech platform. Experience with Express, MongoDB, and REST APIs required.',
            jobType: 'Full-time',
            workMode: 'Hybrid',
            salary: '₹14L - ₹22L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['Node.js', 'Express', 'MongoDB', 'REST', 'JavaScript'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-7',
            title: 'Data Scientist',
            company: 'Analytics Hub',
            location: 'Chennai, India',
            description: 'Data scientist role requiring Python, SQL, and machine learning expertise. Experience with pandas, scikit-learn preferred.',
            jobType: 'Full-time',
            workMode: 'On-site',
            salary: '₹16L - ₹26L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['Python', 'SQL', 'Machine Learning', 'Data Science'],
            matchScore: 0,
            matchDetails: null
        },
        {
            id: 'mock-8',
            title: 'Senior Java Developer',
            company: 'Enterprise Corp',
            location: 'Noida, India',
            description: 'Java developer with Spring Boot experience needed. Microservices architecture and REST API development skills required.',
            jobType: 'Full-time',
            workMode: 'Hybrid',
            salary: '₹18L - ₹30L',
            applyUrl: 'http://localhost:3000/demo-apply.html',
            datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'IT Jobs',
            skills: ['Java', 'Spring', 'REST', 'SQL'],
            matchScore: 0,
            matchDetails: null
        }
    ];
}
