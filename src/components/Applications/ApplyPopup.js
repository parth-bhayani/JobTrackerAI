import React, { useState } from 'react';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import { applicationsAPI } from '../../services/api';
import './ApplyPopup.css';

function ApplyPopup({ job, onClose }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleResponse = async (response) => {
        if (response === 'yes') {
            setLoading(true);
            try {
                await applicationsAPI.create(job);
                setStatus('success');
                setTimeout(() => onClose(), 1500);
            } catch (err) {
                setStatus('error');
            }
            setLoading(false);
        } else {
            onClose();
        }
    };

    return (
        <div className="apply-popup-overlay" onClick={onClose}>
            <div className="apply-popup" onClick={e => e.stopPropagation()}>
                {status === 'success' ? (
                    <div className="popup-success">
                        <div className="success-icon-circle">
                            <FiCheck />
                        </div>
                        <h3>Application Saved!</h3>
                        <p>Track it in your Applications dashboard</p>
                    </div>
                ) : (
                    <>
                        <div className="popup-header">
                            <div className="popup-icon">
                                <FiClock />
                            </div>
                            <h3>Did you apply?</h3>
                        </div>

                        <div className="popup-job-info">
                            <p className="popup-job-title">{job.title}</p>
                            <p className="popup-job-company">at {job.company}</p>
                        </div>

                        <div className="popup-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => handleResponse('yes')}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner"></span>
                                ) : (
                                    <>
                                        <FiCheck />
                                        Yes, Applied
                                    </>
                                )}
                            </button>

                            <button
                                className="btn btn-secondary"
                                onClick={() => handleResponse('no')}
                                disabled={loading}
                            >
                                <FiX />
                                No, just browsing
                            </button>

                            <button
                                className="btn btn-ghost"
                                onClick={() => handleResponse('earlier')}
                                disabled={loading}
                            >
                                Applied Earlier
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ApplyPopup;
