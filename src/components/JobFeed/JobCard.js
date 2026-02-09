import React from 'react';
import { FiMapPin, FiBriefcase, FiClock, FiExternalLink, FiStar, FiTrendingUp } from 'react-icons/fi';
import './JobCard.css';

function JobCard({ job, onApply, style }) {
    const getMatchBadgeClass = (score) => {
        if (score >= 70) return 'high';
        if (score >= 40) return 'medium';
        return 'low';
    };

    const getMatchEmoji = (score) => {
        if (score >= 70) return '🟢';
        if (score >= 40) return '🟡';
        return '⚪';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="job-card animate-fade-in" style={style}>
            <div className="job-card-header">
                <div className="job-company-logo">
                    {job.company.charAt(0)}
                </div>
                <div className="job-header-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-company">{job.company}</p>
                </div>
                {job.matchScore > 0 && (
                    <div className={`match-badge ${getMatchBadgeClass(job.matchScore)}`}>
                        <span>{getMatchEmoji(job.matchScore)}</span>
                        <span>{job.matchScore}%</span>
                    </div>
                )}
            </div>

            <div className="job-meta">
                <span className="job-meta-item">
                    <FiMapPin />
                    {job.location}
                </span>
                <span className="job-meta-item">
                    <FiBriefcase />
                    {job.jobType}
                </span>
                <span className="job-meta-item">
                    <FiClock />
                    {formatDate(job.datePosted)}
                </span>
            </div>

            <div className="job-tags">
                <span className={`badge badge-${job.workMode === 'Remote' ? 'success' : job.workMode === 'Hybrid' ? 'warning' : 'muted'}`}>
                    {job.workMode}
                </span>
                {job.salary && (
                    <span className="badge badge-primary">
                        {job.salary}
                    </span>
                )}
            </div>

            <p className="job-description">
                {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
            </p>

            {job.skills && job.skills.length > 0 && (
                <div className="job-skills">
                    {job.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="skill-tag">
                            {skill}
                        </span>
                    ))}
                    {job.skills.length > 5 && (
                        <span className="skill-tag more">+{job.skills.length - 5}</span>
                    )}
                </div>
            )}

            {job.matchDetails && job.matchScore >= 40 && (
                <div className="match-details">
                    <div className="match-details-header">
                        <FiTrendingUp />
                        <span>Match Insights</span>
                    </div>
                    {job.matchDetails.matchingSkills?.length > 0 && (
                        <div className="match-insight">
                            <FiStar className="match-icon" />
                            <span>Matching: {job.matchDetails.matchingSkills.slice(0, 3).join(', ')}</span>
                        </div>
                    )}
                    {job.matchDetails.explanation && (
                        <p className="match-explanation">{job.matchDetails.explanation}</p>
                    )}
                </div>
            )}

            <div className="job-card-footer">
                <button
                    className="btn btn-primary apply-btn"
                    onClick={() => onApply(job)}
                >
                    <FiExternalLink />
                    Apply Now
                </button>
            </div>
        </div>
    );
}

export default JobCard;
