import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import NotSignedIn from '../components/NotSignedIn';
import { Link, useNavigate } from 'react-router-dom';
import './programs.css';

function Programs() {
    const { user, userRole, loadingAuth } = useAuth();
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Wait for auth state and user profile to be resolved
        if (loadingAuth) {
            return;
        }

        if (!user) {
            setLoading(false);
            return;
        }

        const fetchPrograms = async () => {
            try {
                console.log('Auth State:', {
                    userId: user?.id,
                    email: user?.email,
                    role: userRole,
                    session: await supabase.auth.getSession()
                });

                const { data, error: programsError } = await supabase
                    .from('programs')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (programsError) {
                    console.error('Supabase error details:', {
                        message: programsError.message,
                        details: programsError.details,
                        hint: programsError.hint,
                        code: programsError.code
                    });
                    throw programsError;
                }

                setPrograms(data || []);
            } catch (fetchError) {
                console.error("Full error object:", fetchError);
                setError(fetchError.message || 'Failed to fetch programs');
            } finally {
                setLoading(false);
            }
        }

        fetchPrograms();
    }, [user, userRole, loadingAuth]);

    if (loading || loadingAuth) {
        return (
            <div className="container">
                <div className="loading">Loading programs...</div>
            </div>
        );
    }

    if (!user) {
        return <NotSignedIn message="Sign In to Access Program List"/>;
    }

    if (userRole == null) {
        return (
            <div className="container">
                <div className="error">
                    You don't have permission to access programs. Only administrators can view and manage programs.
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">
                    Error: {error}
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setError(null)}
                        style={{ marginTop: '1rem' }}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title">Programs</h1>
                    {userRole === 'admin' && (   
                        <Link to="/programs/create" className="btn btn-primary add-button">Add New Program</Link>
                    )}
                </div>
                <div>
                    {programs.length === 0 ? (
                        <div className="no-programs">
                            <p>No programs available yet.</p>
                        </div>
                    ) : (
                        programs.map((program) => (
                            <div 
                                key={program.id} 
                                className="card" 
                                style={{ 
                                    borderLeft: '4px solid var(--primary-color)',
                                    transition: 'transform 0.2s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate(`/programs/${program.id}`)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{program.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span>Status: {program.status}</span>
                                    <span>Total Sessions: {program.total_sessions}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Programs;