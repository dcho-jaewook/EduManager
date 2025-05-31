import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import './ClassList.css';

function ClassList() {
    const { programId } = useParams();
    const navigate = useNavigate();
    const { user, userRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [program, setProgram] = useState(null);
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetchProgramAndClasses();
    }, [programId]);

    const fetchProgramAndClasses = async () => {
        try {
            // Fetch program details
            const { data: programData, error: programError } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();

            if (programError) throw programError;
            setProgram(programData);

            // Fetch classes with their tutors and students
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select(`
                    *,
                    class_tutors (
                        tutor_id,
                        profiles:profiles (
                            id,
                            full_name,
                            email
                        )
                    ),
                    class_students (
                        student_id,
                        profiles:profiles (
                            id,
                            full_name,
                            email
                        )
                    )
                `)
                .eq('program_id', programId)
                .order('start_time', { ascending: true });

            if (classesError) throw classesError;

            // Transform the data to make it easier to work with
            const transformedClasses = classesData.map(classItem => ({
                ...classItem,
                tutors: classItem.class_tutors.map(t => t.profiles),
                students: classItem.class_students.map(s => s.profiles)
            }));

            setClasses(transformedClasses);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    };

    const deleteClass = async (classId) => {
        if (!window.confirm('Are you sure you want to delete this class?')) {
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('classes')
                .delete()
                .eq('id', classId);

            if (error) throw error;

            // Refresh the class list
            fetchProgramAndClasses();
        } catch (err) {
            console.error('Error deleting class:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading classes...</div>
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
                        onClick={() => navigate(`/programs/${programId}`)}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Program
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title">Classes - {program.title}</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {userRole === 'admin' && (
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/programs/${programId}/classes/create`)}
                            >
                                Create Class
                            </button>
                        )}
                        <button 
                            className="btn btn-secondary"
                            onClick={() => navigate(`/programs/${programId}`)}
                        >
                            Back to Program
                        </button>
                    </div>
                </div>

                {classes.length === 0 ? (
                    <div className="no-classes">
                        <p>No classes have been created yet.</p>
                        {userRole === 'admin' && (
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/programs/${programId}/classes/create`)}
                            >
                                Create First Class
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="classes-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Time</th>
                                    <th>Location</th>
                                    <th>Tutors</th>
                                    <th>Students</th>
                                    <th>Note</th>
                                    {userRole === 'admin' && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map(classItem => (
                                    <tr key={classItem.id}>
                                        <td>{classItem.type}</td>
                                        <td>
                                            <div className="time-cell">
                                                <div>{formatDateTime(classItem.start_time)}</div>
                                                <div>{formatDateTime(classItem.end_time)}</div>
                                            </div>
                                        </td>
                                        <td>{classItem.location}</td>
                                        <td>
                                            <div className="participants-list">
                                                {classItem.tutors.map(tutor => (
                                                    <div key={tutor.id} className="participant">
                                                        {tutor.full_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="participants-list">
                                                {classItem.students.map(student => (
                                                    <div key={student.id} className="participant">
                                                        {student.full_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{classItem.note || '-'}</td>
                                        {userRole === 'admin' && (
                                            <td>
                                                <button 
                                                    className="btn delete-btn"
                                                    onClick={() => deleteClass(classItem.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClassList; 