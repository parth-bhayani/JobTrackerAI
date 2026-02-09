import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiBriefcase, FiFileText, FiLogOut, FiUpload, FiCheck, FiX, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header() {
    const { user, logout, uploadResume, deleteResume } = useAuth();
    const location = useLocation();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);
        setUploadStatus(null);

        const result = await uploadResume(acceptedFiles[0]);

        setUploading(false);
        setUploadStatus(result);

        if (result.success) {
            setTimeout(() => {
                setShowUploadModal(false);
                setUploadStatus(null);
            }, 1500);
        }
    }, [uploadResume]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt']
        },
        maxFiles: 1
    });

    const handleDeleteResume = async () => {
        if (window.confirm('Are you sure you want to delete your resume?')) {
            await deleteResume();
        }
    };

    return (
        <>
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <FiBriefcase className="logo-icon" />
                            <span>JobTracker<span className="logo-ai">AI</span></span>
                        </Link>

                        <nav className="nav">
                            <Link
                                to="/"
                                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                            >
                                Jobs
                            </Link>
                            <Link
                                to="/applications"
                                className={`nav-link ${location.pathname === '/applications' ? 'active' : ''}`}
                            >
                                My Applications
                            </Link>
                        </nav>

                        <div className="header-actions">
                            <button
                                className={`btn ${user?.hasResume ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => setShowUploadModal(true)}
                            >
                                <FiUpload />
                                {user?.hasResume ? 'Update Resume' : 'Upload Resume'}
                            </button>

                            <div className="user-menu">
                                <div className="user-avatar">
                                    <FiUser />
                                </div>
                                <span className="user-email">{user?.email}</span>
                                <button className="btn btn-ghost" onClick={logout} title="Logout">
                                    <FiLogOut />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Resume Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <FiFileText />
                                {user?.hasResume ? 'Update Your Resume' : 'Upload Your Resume'}
                            </h3>
                            <button className="btn btn-ghost" onClick={() => setShowUploadModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div
                                {...getRootProps()}
                                className={`dropzone ${isDragActive ? 'active' : ''} ${uploadStatus?.success ? 'success' : ''}`}
                            >
                                <input {...getInputProps()} />
                                {uploading ? (
                                    <>
                                        <div className="spinner"></div>
                                        <p>Uploading...</p>
                                    </>
                                ) : uploadStatus?.success ? (
                                    <>
                                        <FiCheck className="success-icon" />
                                        <p>Resume uploaded successfully!</p>
                                    </>
                                ) : (
                                    <>
                                        <FiUpload className="upload-icon" />
                                        {isDragActive ? (
                                            <p>Drop your resume here...</p>
                                        ) : (
                                            <>
                                                <p>Drag & drop your resume here</p>
                                                <span className="dropzone-hint">or click to browse</span>
                                                <span className="dropzone-formats">Supports PDF and TXT files</span>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>

                            {uploadStatus && !uploadStatus.success && (
                                <div className="upload-error">
                                    {uploadStatus.message}
                                </div>
                            )}

                            {user?.hasResume && (
                                <button
                                    className="btn btn-danger delete-resume-btn"
                                    onClick={handleDeleteResume}
                                >
                                    Delete Current Resume
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;
