import React from 'react';

function Home() {
    return (
        <div className="container">
            <div className="card">
                <h1 className="page-title">Welcome to EduManager</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Your comprehensive solution for managing educational programs, classes, and students.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                        <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Programs</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Manage your educational programs and curriculum.</p>
                    </div>
                    <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                        <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Classes</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Organize and track your classes and schedules.</p>
                    </div>
                    <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                        <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Students</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Keep track of student information and progress.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;