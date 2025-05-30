import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ProtectedRoute from '../components/ProtectedRoute';
import './ProgramDetails.css';

function ProgramDetails() {
    const { programId } = useParams();
    const navigate = useNavigate();
    const { user, userRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [program, setProgram] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchProgramDetails();
    }, [programId]);

    const fetchProgramDetails = async () => {
        try {
            // Fetch program details
            const { data: programData, error: programError } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();

            if (programError) throw programError;
            setProgram(programData);

            // Fetch tutors
            const { data: tutorsData, error: tutorsError } = await supabase
                .from('program_tutors')
                .select(`
                    tutor_id,
                    profiles:profiles (
                        id,
                        full_name,
                        email
                    )
                `)
                .eq('program_id', programId);

            if (tutorsError) throw tutorsError;
            setTutors(tutorsData.map(t => t.profiles));

            // Fetch students
            const { data: studentsData, error: studentsError } = await supabase
                .from('program_students')
                .select(`
                    student_id,
                    profiles:profiles (
                        id,
                        full_name,
                        email
                    )
                `)
                .eq('program_id', programId);

            if (studentsError) throw studentsError;
            setStudents(studentsData.map(s => s.profiles));
            console.log(studentsData);

        } catch (err) {
            console.error('Error fetching program details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading program details...</div>
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
                        onClick={() => navigate('/programs')}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Programs
                    </button>
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="container">
                <div className="error">
                    Program not found
                    <button 
                        className="btn btn-primary" 
                        onClick={() => navigate('/programs')}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Programs
                    </button>
                </div>
            </div>
        );
    }

    const deleteProgram = async (programId) => {
        if (userRole !== 'admin') {
            setError('You are not authorized to delete this program');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('programs')
                .delete()
                .eq('id', programId);
        } catch (error) {
            console.error('Error deleting program:', error);
            setError(error.message || 'Failed to delete program');
        }
    }

    return (
        <div className="container">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title">{program.title}</h1>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/programs')}
                    >
                        Back to Programs
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Program Details */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Program Details</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <strong>Status:</strong> {program.status}
                            </div>
                            <div>
                                <strong>Total Sessions:</strong> {program.total_sessions}
                            </div>
                            <div>
                                <strong>Created At:</strong> {new Date(program.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Tutors Section */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Tutors</h2>
                        {tutors.length === 0 ? (
                            <p>No tutors assigned to this program.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {tutors.map(tutor => (
                                    <div key={tutor.id} style={{ 
                                        padding: '1rem',
                                        backgroundColor: 'var(--background-light)',
                                        borderRadius: '4px'
                                    }}>
                                        <div><strong>{tutor.full_name}</strong></div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{tutor.email}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Students Section */}
                    <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Students</h2>
                        {students.length === 0 ? (
                            <p>No students enrolled in this program.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {students.map(student => (
                                    <div key={student.id} style={{ 
                                        padding: '1rem',
                                        backgroundColor: 'var(--background-light)',
                                        borderRadius: '4px'
                                    }}>
                                        <div><strong>{student.full_name}</strong></div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{student.email}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {userRole === 'admin' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button className="btn delete-btn" onClick={() => deleteProgram(programId)}>Delete Program</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProgramDetails; 