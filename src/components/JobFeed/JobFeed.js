import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useFilters } from '../../context/FilterContext';
import { jobsAPI } from '../../services/api';
import JobCard from './JobCard';
import BestMatches from './BestMatches';
import Filters from './Filters';
import ApplyPopup from '../Applications/ApplyPopup';
import './JobFeed.css';

function JobFeed() {
    const { filters, filtersChanged } = useFilters();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingApplication, setPendingApplication] = useState(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await jobsAPI.getJobs(filters);
            if (response.success) {
                setJobs(response.jobs);
            } else {
                setError(response.message || 'Failed to fetch jobs');
            }
        } catch (err) {
            setError('Failed to fetch jobs. Please try again.');
        }

        setLoading(false);
    }, [filters]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs, filtersChanged]);

    // Check for pending application on focus (when user returns from external site)
    useEffect(() => {
        const handleFocus = () => {
            const pending = localStorage.getItem('pendingApplication');
            if (pending) {
                setPendingApplication(JSON.parse(pending));
                localStorage.removeItem('pendingApplication');
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const handleApplyClick = (job) => {
        // Store pending application
        localStorage.setItem('pendingApplication', JSON.stringify(job));
        // Open external link
        window.open(job.applyUrl, '_blank');
    };

    const handleClosePopup = () => {
        setPendingApplication(null);
    };

    return (
        <div className="job-feed-page">
            <div className="container">
                <div className="job-feed-layout">
                    {/* Sidebar with Filters */}
                    <aside className="filters-sidebar">
                        <Filters />
                    </aside>

                    {/* Main Content */}
                    <main className="job-feed-main">
                        {/* Best Matches Section */}
                        <BestMatches onApply={handleApplyClick} />

                        {/* All Jobs Section */}
                        <section className="jobs-section">
                            <div className="section-header">
                                <h2>
                                    <FiSearch />
                                    All Jobs
                                </h2>
                                <button
                                    className="btn btn-ghost refresh-btn"
                                    onClick={fetchJobs}
                                    disabled={loading}
                                >
                                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>

                            {loading ? (
                                <div className="jobs-loading">
                                    <div className="spinner spinner-lg"></div>
                                    <p>Loading jobs...</p>
                                </div>
                            ) : error ? (
                                <div className="jobs-error">
                                    <p>{error}</p>
                                    <button className="btn btn-primary" onClick={fetchJobs}>
                                        Try Again
                                    </button>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="jobs-empty">
                                    <p>No jobs found matching your criteria.</p>
                                    <p className="text-muted">Try adjusting your filters or search terms.</p>
                                </div>
                            ) : (
                                <div className="jobs-grid">
                                    {jobs.map((job, index) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onApply={handleApplyClick}
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            {/* Apply Confirmation Popup */}
            {pendingApplication && (
                <ApplyPopup
                    job={pendingApplication}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
}

export default JobFeed;
