import React, { useState, useEffect } from 'react';
import { FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { jobsAPI } from '../../services/api';
import JobCard from './JobCard';
import './BestMatches.css';

function BestMatches({ onApply }) {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const fetchBestMatches = async () => {
            if (!user?.hasResume) {
                setLoading(false);
                return;
            }

            try {
                const response = await jobsAPI.getBestMatches();
                if (response.success) {
                    setJobs(response.jobs);
                }
            } catch (err) {
                console.error('Failed to fetch best matches:', err);
            }

            setLoading(false);
        };

        fetchBestMatches();
    }, [user]);

    const scrollContainer = (direction) => {
        const container = document.querySelector('.best-matches-scroll');
        if (container) {
            const scrollAmount = direction === 'left' ? -360 : 360;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setScrollPosition(container.scrollLeft + scrollAmount);
        }
    };

    if (!user?.hasResume) {
        return (
            <section className="best-matches-section placeholder">
                <div className="placeholder-content">
                    <FiZap className="placeholder-icon" />
                    <h3>AI-Powered Best Matches</h3>
                    <p>Upload your resume to see personalized job recommendations with match scores.</p>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="best-matches-section">
                <div className="section-header">
                    <h2>
                        <FiZap />
                        Best Matches For You
                    </h2>
                </div>
                <div className="best-matches-loading">
                    <div className="spinner"></div>
                    <span>Finding your best matches...</span>
                </div>
            </section>
        );
    }

    if (jobs.length === 0) {
        return null;
    }

    return (
        <section className="best-matches-section">
            <div className="section-header">
                <h2>
                    <FiZap />
                    Best Matches For You
                </h2>
                <span className="match-count">{jobs.length} top matches</span>
            </div>

            <div className="best-matches-container">
                <button
                    className="scroll-btn scroll-left"
                    onClick={() => scrollContainer('left')}
                    aria-label="Scroll left"
                >
                    <FiChevronLeft />
                </button>

                <div className="best-matches-scroll">
                    {jobs.map((job, index) => (
                        <div key={job.id} className="best-match-card-wrapper">
                            <JobCard
                                job={job}
                                onApply={onApply}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            />
                        </div>
                    ))}
                </div>

                <button
                    className="scroll-btn scroll-right"
                    onClick={() => scrollContainer('right')}
                    aria-label="Scroll right"
                >
                    <FiChevronRight />
                </button>
            </div>
        </section>
    );
}

export default BestMatches;
