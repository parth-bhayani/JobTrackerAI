import React, { useState } from 'react';
import {
    FiMapPin, FiExternalLink, FiTrash2, FiChevronDown, FiChevronUp,
    FiCheck, FiClock, FiAward, FiXCircle
} from 'react-icons/fi';
import './ApplicationCard.css';

const STATUS_OPTIONS = [
    { value: 'applied', label: 'Applied', icon: FiClock, color: 'primary' },
    { value: 'interview', label: 'Interview', icon: FiCheck, color: 'warning' },
    { value: 'offer', label: 'Offer', icon: FiAward, color: 'success' },
    { value: 'rejected', label: 'Rejected', icon: FiXCircle, color: 'danger' }
];

function ApplicationCard({ application, onStatusUpdate, onDelete }) {
    const [showTimeline, setShowTimeline] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const currentStatus = STATUS_OPTIONS.find(s => s.value === application.status);
    const StatusIcon = currentStatus?.icon || FiClock;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="application-card">
            <div className="app-card-main">
                <div className="app-company-logo">
                    {application.job.company.charAt(0)}
                </div>

                <div className="app-info">
                    <h3 className="app-title">{application.job.title}</h3>
                    <p className="app-company">{application.job.company}</p>
                    <div className="app-meta">
                        <span>
                            <FiMapPin />
                            {application.job.location}
                        </span>
                        <span>
                            <FiClock />
                            Applied {formatDate(application.createdAt)}
                        </span>
                    </div>
                </div>

                <div className="app-actions">
                    {/* Status Selector */}
                    <div className="status-selector">
                        <button
                            className={`status-btn ${currentStatus?.color}`}
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                        >
                            <StatusIcon />
                            {currentStatus?.label}
                            <FiChevronDown />
                        </button>

                        {showStatusMenu && (
                            <div className="status-menu">
                                {STATUS_OPTIONS.map(status => (
                                    <button
                                        key={status.value}
                                        className={`status-option ${status.color} ${application.status === status.value ? 'active' : ''}`}
                                        onClick={() => {
                                            onStatusUpdate(application.id, status.value);
                                            setShowStatusMenu(false);
                                        }}
                                    >
                                        <status.icon />
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <a
                        href={application.job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        title="View job posting"
                    >
                        <FiExternalLink />
                    </a>

                    <button
                        className="btn btn-ghost delete-btn"
                        onClick={() => onDelete(application.id)}
                        title="Delete application"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>

            {/* Timeline Toggle */}
            <button
                className="timeline-toggle"
                onClick={() => setShowTimeline(!showTimeline)}
            >
                {showTimeline ? <FiChevronUp /> : <FiChevronDown />}
                {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
            </button>

            {/* Timeline */}
            {showTimeline && (
                <div className="app-timeline">
                    {application.timeline.map((event, index) => {
                        const statusInfo = STATUS_OPTIONS.find(s => s.value === event.status);
                        const EventIcon = statusInfo?.icon || FiClock;

                        return (
                            <div key={index} className={`timeline-event ${statusInfo?.color}`}>
                                <div className="timeline-icon">
                                    <EventIcon />
                                </div>
                                <div className="timeline-content">
                                    <p className="timeline-status">{statusInfo?.label || event.status}</p>
                                    <p className="timeline-note">{event.note}</p>
                                    <p className="timeline-date">{formatDate(event.timestamp)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ApplicationCard;
