import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, resumeAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                try {
                    const response = await authAPI.getMe();
                    if (response.success) {
                        setUser(response.user);
                    }
                } catch (err) {
                    localStorage.removeItem('sessionId');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await authAPI.login(email, password);
            if (response.success) {
                setUser(response.user);
                return { success: true };
            } else {
                setError(response.message);
                return { success: false, message: response.message };
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            // Ignore logout errors
        }
        setUser(null);
        localStorage.removeItem('sessionId');
    };

    const uploadResume = async (file) => {
        try {
            const response = await resumeAPI.upload(file);
            if (response.success) {
                setUser(prev => ({ ...prev, hasResume: true }));
            }
            return response;
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Upload failed' };
        }
    };

    const deleteResume = async () => {
        try {
            const response = await resumeAPI.delete();
            if (response.success) {
                setUser(prev => ({ ...prev, hasResume: false }));
            }
            return response;
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Delete failed' };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        uploadResume,
        deleteResume,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
