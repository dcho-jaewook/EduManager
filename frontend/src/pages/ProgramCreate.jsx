import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ProtectedRoute from '../components/ProtectedRoute';

function ProgramCreate() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tutors, setTutors] = useState([]);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        total_sessions: 0,
        status: 'active',
        selectedTutors: [],
        selectedStudents: []
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Fetch tutors
            const { data: tutorsData, error: tutorsError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'tutor');

            if (tutorsError) throw tutorsError;
            setTutors(tutorsData || []);

            // Fetch students
            const { data: studentsData, error: studentsError } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'student');

            if (studentsError) throw studentsError;
            setStudents(studentsData || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (type, id) => {
        setFormData(prev => {
            const currentSelection = prev[type];
            const newSelection = currentSelection.includes(id)
                ? currentSelection.filter(item => item !== id)
                : [...currentSelection, id];
            
            return {
                ...prev,
                [type]: newSelection
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Start a transaction
            const { data: program, error: programError } = await supabase
                .from('programs')
                .insert([{
                    title: formData.title,
                    total_sessions: parseInt(formData.total_sessions),
                    status: formData.status
                }])
                .select()
                .single();

            if (programError) throw programError;

            // Insert program tutors
            if (formData.selectedTutors.length > 0) {
                const programTutors = formData.selectedTutors.map(tutorId => ({
                    program_id: program.id,
                    tutor_id: tutorId
                }));

                const { error: tutorsError } = await supabase
                    .from('program_tutors')
                    .insert(programTutors);

                if (tutorsError) throw tutorsError;
            }

            // Insert program students
            if (formData.selectedStudents.length > 0) {
                const programStudents = formData.selectedStudents.map(studentId => ({
                    program_id: program.id,
                    student_id: studentId
                }));

                const { error: studentsError } = await supabase
                    .from('program_students')
                    .insert(programStudents);

                if (studentsError) throw studentsError;
            }

            navigate('/programs');
        } catch (err) {
            console.error('Error creating program:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="container">
                <div className="card">
                    <h1 className="page-title">Create New Program</h1>
                    
                    {error && (
                        <div className="error">
                            {error}
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setError(null)}
                                style={{ marginTop: '1rem' }}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem' }}>Program Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="total_sessions" style={{ display: 'block', marginBottom: '0.5rem' }}>Total Sessions</label>
                            <input
                                type="number"
                                id="total_sessions"
                                name="total_sessions"
                                value={formData.total_sessions}
                                onChange={handleInputChange}
                                required
                                min="1"
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="status" style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '0.5rem' }}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Tutors</label>
                            <div style={{ 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '4px',
                                padding: '1rem',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {tutors.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)' }}>No tutors available</p>
                                ) : (
                                    tutors.map(tutor => (
                                        <div key={tutor.id} style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedTutors.includes(tutor.id)}
                                                    onChange={() => handleCheckboxChange('selectedTutors', tutor.id)}
                                                />
                                                <span>{tutor.full_name} ({tutor.email})</span>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Students</label>
                            <div style={{ 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '4px',
                                padding: '1rem',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {students.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)' }}>No students available</p>
                                ) : (
                                    students.map(student => (
                                        <div key={student.id} style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedStudents.includes(student.id)}
                                                    onChange={() => handleCheckboxChange('selectedStudents', student.id)}
                                                />
                                                <span>{student.full_name} ({student.email})</span>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/programs')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Program'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default ProgramCreate;
