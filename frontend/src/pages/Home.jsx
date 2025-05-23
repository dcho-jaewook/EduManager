import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotSignedIn from '../components/NotSignedIn';

function Home() {
    const { user, userRole } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="container">
            <div className="card">
                <h1 className="page-title">Welcome to EduManager</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    EduGate's comprehensive class management tool
                </p>
                {user ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            <div 
                                className="card" 
                                style={{ borderTop: '4px solid var(--primary-color)', cursor: "pointer" }}
                                onClick={() => navigate('/programs')}>
                                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Programs</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Manage your educational programs and curriculum.</p>
                            </div>
                            <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Classes</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>Organize and track your classes and schedules.</p>
                            </div>
                        </div>
                    ) : (
                        <NotSignedIn message="Sign In to Access Features"/>
                    )}
                <h1>Your Role: {userRole}</h1>
            </div>
        </div>
    );
}

export default Home;