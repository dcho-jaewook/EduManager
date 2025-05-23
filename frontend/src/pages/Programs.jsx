import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import NotSignedIn from '../components/NotSignedIn';

function Programs() {
    const { user, loadingAuth } = useAuth();
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
                //Log detailed auth information
                console.log('Auth State:', {
                    userId: user?.id,
                    email: user?.email,
                    role: user?.role,
                    session: await supabase.auth.getSession()
                });

                const {data, error: programsError } = await supabase
                    .from('programs')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (programsError) {
                    console.error('Supabase error details:', {
                        message: programsError.message,
                        details: programsError.details,
                        hint: programsError.hint,
                        code: programsError.code,
                        // Add the actual SQL query that was attempted
                        query: programsError.query
                    });
                    throw programsError;
                }

                console.log('Raw response:', { data, error: programsError });
                setPrograms(data || []);
            } catch (fetchError) {
                console.error("Full error object:", fetchError);
                setError(fetchError);
            } finally {
                setLoading(false);
            }
        }

        fetchPrograms();
    }, [user, loadingAuth]);

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

    if (error) {
        return (
            <div className="container">
                <div className="error">Error: {error.message}</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container">
                <div className="error">Error fetching programs: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="container">
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
        </div>
    );
}

export default Programs;