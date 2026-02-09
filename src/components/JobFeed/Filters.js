import React, { useState } from 'react';
import { FiFilter, FiX, FiSearch, FiMapPin } from 'react-icons/fi';
import {
    useFilters,
    SKILL_OPTIONS,
    DATE_OPTIONS,
    JOB_TYPE_OPTIONS,
    WORK_MODE_OPTIONS,
    MATCH_SCORE_OPTIONS
} from '../../context/FilterContext';
import './Filters.css';

function Filters() {
    const {
        filters,
        setTitle,
        setSkills,
        setDatePosted,
        setJobType,
        setWorkMode,
        setLocation,
        setMatchScore,
        clearAllFilters
    } = useFilters();

    const [skillSearch, setSkillSearch] = useState('');
    const [showAllSkills, setShowAllSkills] = useState(false);

    const handleSkillToggle = (skill) => {
        const newSkills = filters.skills.includes(skill)
            ? filters.skills.filter(s => s !== skill)
            : [...filters.skills, skill];
        setSkills(newSkills);
    };

    const filteredSkills = SKILL_OPTIONS.filter(skill =>
        skill.toLowerCase().includes(skillSearch.toLowerCase())
    );

    const displayedSkills = showAllSkills ? filteredSkills : filteredSkills.slice(0, 12);

    const hasActiveFilters =
        filters.title ||
        filters.skills.length > 0 ||
        filters.datePosted !== 'any' ||
        filters.jobType !== 'all' ||
        filters.workMode !== 'all' ||
        filters.location ||
        filters.matchScore !== 'all';

    return (
        <div className="filters-container">
            <div className="filters-header">
                <h3>
                    <FiFilter />
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button className="btn btn-ghost clear-btn" onClick={clearAllFilters}>
                        <FiX />
                        Clear All
                    </button>
                )}
            </div>

            {/* Search by Title */}
            <div className="filter-group">
                <label>Role / Title</label>
                <div className="input-wrapper">
                    <FiSearch className="input-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g. React Developer"
                        value={filters.title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>

            {/* Location */}
            <div className="filter-group">
                <label>Location</label>
                <div className="input-wrapper">
                    <FiMapPin className="input-icon" />
                    <input
                        type="text"
                        className="input"
                        placeholder="City or region"
                        value={filters.location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
            </div>

            {/* Skills Multi-select */}
            <div className="filter-group">
                <label>Skills</label>
                <input
                    type="text"
                    className="input skill-search"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                />
                <div className="skills-pills">
                    {filters.skills.map(skill => (
                        <button
                            key={skill}
                            className="skill-pill selected"
                            onClick={() => handleSkillToggle(skill)}
                        >
                            {skill}
                            <FiX />
                        </button>
                    ))}
                </div>
                <div className="skills-options">
                    {displayedSkills
                        .filter(skill => !filters.skills.includes(skill))
                        .map(skill => (
                            <button
                                key={skill}
                                className="skill-pill"
                                onClick={() => handleSkillToggle(skill)}
                            >
                                {skill}
                            </button>
                        ))}
                </div>
                {filteredSkills.length > 12 && (
                    <button
                        className="btn btn-ghost show-more-btn"
                        onClick={() => setShowAllSkills(!showAllSkills)}
                    >
                        {showAllSkills ? 'Show Less' : `Show ${filteredSkills.length - 12} More`}
                    </button>
                )}
            </div>

            {/* Date Posted */}
            <div className="filter-group">
                <label>Date Posted</label>
                <div className="radio-group">
                    {DATE_OPTIONS.map(option => (
                        <label key={option.value} className="radio-option">
                            <input
                                type="radio"
                                name="datePosted"
                                value={option.value}
                                checked={filters.datePosted === option.value}
                                onChange={(e) => setDatePosted(e.target.value)}
                            />
                            <span className="radio-label">{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Job Type */}
            <div className="filter-group">
                <label>Job Type</label>
                <select
                    className="input select"
                    value={filters.jobType}
                    onChange={(e) => setJobType(e.target.value)}
                >
                    {JOB_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Work Mode */}
            <div className="filter-group">
                <label>Work Mode</label>
                <select
                    className="input select"
                    value={filters.workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                >
                    {WORK_MODE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Match Score */}
            <div className="filter-group">
                <label>Match Score</label>
                <select
                    className="input select"
                    value={filters.matchScore}
                    onChange={(e) => setMatchScore(e.target.value)}
                >
                    {MATCH_SCORE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default Filters;
