import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message || 'Login failed');
        }
    };

    const fillTestCredentials = () => {
        setEmail('test@gmail.com');
        setPassword('test@123');
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-bg-gradient"></div>
                <div className="login-bg-pattern"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <FiBriefcase />
                        </div>
                        <h1>Welcome to JobTracker<span className="highlight">AI</span></h1>
                        <p>AI-powered job matching to find your perfect role</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    className="input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    type="password"
                                    id="password"
                                    className="input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    Sign In
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-divider">
                        <span>Demo Access</span>
                    </div>

                    <div className="demo-credentials">
                        <p>Use test credentials to explore the platform:</p>
                        <div className="credentials-box">
                            <code>Email: test@gmail.com</code>
                            <code>Password: test@123</code>
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={fillTestCredentials}
                        >
                            Fill Test Credentials
                        </button>
                    </div>
                </div>

                <div className="login-features">
                    <div className="feature">
                        <span className="feature-icon">🎯</span>
                        <h3>AI Job Matching</h3>
                        <p>Get personalized job recommendations based on your resume</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🤖</span>
                        <h3>Smart Assistant</h3>
                        <p>Use natural language to search and filter jobs</p>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📊</span>
                        <h3>Track Applications</h3>
                        <p>Monitor your job applications in one place</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
