import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotSignedIn from '../components/NotSignedIn';

function Programs() {
    const { user } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/api/programs");
                if (!response.ok) {
                    throw new Error("Server Error");
                }
                const jsonPrograms = await response.json();
                setPrograms(jsonPrograms);
            } catch (error) {
                setError(error);
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPrograms();
    }, []);

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading programs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">Error: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="container">
            {user?
            (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 className="page-title">Programs</h1>
                        <button className="btn btn-primary">Add New Program</button>
                    </div>
                    <div>
                        {programs.map((program) => (
                            <div key={program.id} className="card" style={{ 
                                borderLeft: '4px solid var(--primary-color)',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{program.title}</h3>
                                {program.description && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {program.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ):
            (<NotSignedIn message="Sign In to Access Program List"/>)}
        </div>
    );
}

export default Programs;