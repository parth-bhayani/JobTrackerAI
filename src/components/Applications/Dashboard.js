import React, { useState, useEffect } from 'react';
import { FiClipboard, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { applicationsAPI } from '../../services/api';
import ApplicationCard from './ApplicationCard';
import './Dashboard.css';

function Dashboard() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await applicationsAPI.getAll();
            if (response.success) {
                setApplications(response.applications);
            }
        } catch (err) {
            setError('Failed to fetch applications');
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await applicationsAPI.updateStatus(id, status);
            if (response.success) {
                setApplications(apps =>
                    apps.map(app => app.id === id ? response.application : app)
                );
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this application?')) {
            return;
        }

        try {
            const response = await applicationsAPI.delete(id);
            if (response.success) {
                setApplications(apps => apps.filter(app => app.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete application:', err);
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const statusCounts = {
        all: applications.length,
        applied: applications.filter(a => a.status === 'applied').length,
        interview: applications.filter(a => a.status === 'interview').length,
        offer: applications.filter(a => a.status === 'offer').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <div className="dashboard-title">
                        <h1>
                            <FiClipboard />
                            My Applications
                        </h1>
                        <p>Track and manage your job applications</p>
                    </div>
                    <button
                        className="btn btn-ghost"
                        onClick={fetchApplications}
                        disabled={loading}
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Status Filters */}
                <div className="status-filters">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <button
                            key={status}
                            className={`status-filter ${filter === status ? 'active' : ''} ${status}`}
                            onClick={() => setFilter(status)}
                        >
                            <span className="status-label">
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            <span className="status-count">{count}</span>
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                {loading ? (
                    <div className="dashboard-loading">
                        <div className="spinner spinner-lg"></div>
                        <p>Loading applications...</p>
                    </div>
                ) : error ? (
                    <div className="dashboard-error">
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchApplications}>
                            Try Again
                        </button>
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="dashboard-empty">
                        <FiClipboard className="empty-icon" />
                        <h3>No applications yet</h3>
                        <p>When you apply to jobs, they'll appear here so you can track your progress.</p>
                    </div>
                ) : (
                    <div className="applications-list">
                        {filteredApplications.map(app => (
                            <ApplicationCard
                                key={app.id}
                                application={app}
                                onStatusUpdate={handleStatusUpdate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
