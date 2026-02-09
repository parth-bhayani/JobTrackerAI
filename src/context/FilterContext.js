import React, { createContext, useContext, useState, useReducer, useCallback } from 'react';

const FilterContext = createContext(null);

// Initial filter state
const initialFilters = {
    title: '',
    skills: [],
    datePosted: 'any',
    jobType: 'all',
    workMode: 'all',
    location: '',
    matchScore: 'all'
};

// Filter reducer for handling AI assistant actions
function filterReducer(state, action) {
    switch (action.type) {
        case 'SET_TITLE_SEARCH':
            return { ...state, title: action.payload };

        case 'SET_SKILLS':
            return { ...state, skills: action.payload };

        case 'SET_DATE_POSTED':
            return { ...state, datePosted: action.payload };

        case 'SET_JOB_TYPE':
            return { ...state, jobType: action.payload };

        case 'SET_WORK_MODE':
            return { ...state, workMode: action.payload };

        case 'SET_LOCATION':
            return { ...state, location: action.payload };

        case 'SET_MATCH_SCORE':
            return { ...state, matchScore: action.payload };

        case 'CLEAR_ALL_FILTERS':
            return { ...initialFilters };

        case 'SET_MULTIPLE':
            return { ...state, ...action.payload };

        default:
            return state;
    }
}

export function FilterProvider({ children }) {
    const [filters, dispatch] = useReducer(filterReducer, initialFilters);
    const [filtersChanged, setFiltersChanged] = useState(0);

    // Apply filter actions from AI assistant
    const applyActions = useCallback((actions) => {
        if (!actions || actions.length === 0) return;

        actions.forEach(action => {
            dispatch(action);
        });

        // Trigger re-fetch by incrementing counter
        setFiltersChanged(prev => prev + 1);
    }, []);

    // Manual filter setters
    const setTitle = (title) => {
        dispatch({ type: 'SET_TITLE_SEARCH', payload: title });
        setFiltersChanged(prev => prev + 1);
    };

    const setSkills = (skills) => {
        dispatch({ type: 'SET_SKILLS', payload: skills });
        setFiltersChanged(prev => prev + 1);
    };

    const setDatePosted = (datePosted) => {
        dispatch({ type: 'SET_DATE_POSTED', payload: datePosted });
        setFiltersChanged(prev => prev + 1);
    };

    const setJobType = (jobType) => {
        dispatch({ type: 'SET_JOB_TYPE', payload: jobType });
        setFiltersChanged(prev => prev + 1);
    };

    const setWorkMode = (workMode) => {
        dispatch({ type: 'SET_WORK_MODE', payload: workMode });
        setFiltersChanged(prev => prev + 1);
    };

    const setLocation = (location) => {
        dispatch({ type: 'SET_LOCATION', payload: location });
        setFiltersChanged(prev => prev + 1);
    };

    const setMatchScore = (matchScore) => {
        dispatch({ type: 'SET_MATCH_SCORE', payload: matchScore });
        setFiltersChanged(prev => prev + 1);
    };

    const clearAllFilters = () => {
        dispatch({ type: 'CLEAR_ALL_FILTERS' });
        setFiltersChanged(prev => prev + 1);
    };

    const value = {
        filters,
        filtersChanged,
        applyActions,
        setTitle,
        setSkills,
        setDatePosted,
        setJobType,
        setWorkMode,
        setLocation,
        setMatchScore,
        clearAllFilters
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
}

// Available filter options
export const SKILL_OPTIONS = [
    'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
    'Angular', 'Vue', 'Django', 'Flask', 'FastAPI', 'Spring',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
    'Git', 'CI/CD', 'REST', 'GraphQL', 'HTML', 'CSS'
];

export const DATE_OPTIONS = [
    { value: 'any', label: 'Any time' },
    { value: '24h', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' }
];

export const JOB_TYPE_OPTIONS = [
    { value: 'all', label: 'All types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
];

export const WORK_MODE_OPTIONS = [
    { value: 'all', label: 'All modes' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'on-site', label: 'On-site' }
];

export const MATCH_SCORE_OPTIONS = [
    { value: 'all', label: 'All scores' },
    { value: 'high', label: 'High (70%+)' },
    { value: 'medium', label: 'Medium (40-70%)' }
];
