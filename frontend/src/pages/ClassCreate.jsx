import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { createCalendarEvent } from '../lib/googleCalendar';
import ProtectedRoute from '../components/ProtectedRoute';
import './ClassCreate.css';

function ClassCreate() {
    const { programId } = useParams();
    const navigate = useNavigate();
    const { user, userRole } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [program, setProgram] = useState(null);
    const [availableTutors, setAvailableTutors] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [formData, setFormData] = useState({
        start_time: '',
        end_time: '',
        location: '',
        type: '',
        note: '',
        tutor_ids: [],
        student_ids: []
    });

    useEffect(() => {
        if (userRole !== 'admin') {
            navigate('/programs');
            return;
        }
        fetchProgramAndParticipants();
    }, [programId, userRole]);

    const fetchProgramAndParticipants = async () => {
        try {
            // Fetch program details
            const { data: programData, error: programError } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .single();

            if (programError) throw programError;
            setProgram(programData);

            // Fetch available tutors from program_tutors
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
            setAvailableTutors(tutorsData.map(t => t.profiles));

            // Fetch available students from program_students
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
            setAvailableStudents(studentsData.map(s => s.profiles));

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (e) => {
        const { name } = e.target;
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            [name]: selectedOptions
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert times to UTC+9
            const startTime = new Date(formData.start_time);
            const endTime = new Date(formData.end_time);

            // Create class
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .insert([{
                    program_id: programId,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    location: formData.location,
                    type: formData.type,
                    note: formData.note
                }])
                .select()
                .single();

            if (classError) throw classError;

            // Get selected tutors and students
            const selectedTutors = availableTutors.filter(tutor => formData.tutor_ids.includes(tutor.id));
            const selectedStudents = availableStudents.filter(student => formData.student_ids.includes(student.id));

            // Create Google Calendar event and update class with event ID
            let googleEventId = null;
            try {
                const calendarEvent = await createCalendarEvent(classData, selectedTutors, selectedStudents);
                googleEventId = calendarEvent.id;
                // Update the class record with the Google event ID
                await supabase
                    .from('classes')
                    .update({ google_event_id: googleEventId })
                    .eq('id', classData.id);
            } catch (calendarError) {
                console.error('Failed to create calendar event:', calendarError);
                // Don't throw the error - we still want to proceed with class creation
            }

            // Insert class tutors
            if (formData.tutor_ids.length > 0) {
                const tutorInserts = formData.tutor_ids.map(tutorId => ({
                    class_id: classData.id,
                    tutor_id: tutorId
                }));

                const { error: tutorsError } = await supabase
                    .from('class_tutors')
                    .insert(tutorInserts);

                if (tutorsError) throw tutorsError;
            }

            // Insert class students
            if (formData.student_ids.length > 0) {
                const studentInserts = formData.student_ids.map(studentId => ({
                    class_id: classData.id,
                    student_id: studentId
                }));

                const { error: studentsError } = await supabase
                    .from('class_students')
                    .insert(studentInserts);

                if (studentsError) throw studentsError;
            }

            navigate(`/programs/${programId}/classes`);
        } catch (err) {
            console.error('Error creating class:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading...</div>
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
                    <h1 className="page-title">Create New Class</h1>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(`/programs/${programId}`)}
                    >
                        Back to Program
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="start_time">Start Time</label>
                        <input
                            type="datetime-local"
                            id="start_time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="end_time">End Time</label>
                        <input
                            type="datetime-local"
                            id="end_time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="note">Note</label>
                        <textarea
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="tutor_ids">Select Tutors</label>
                        <select
                            id="tutor_ids"
                            name="tutor_ids"
                            multiple
                            value={formData.tutor_ids}
                            onChange={handleMultiSelectChange}
                            required
                        >
                            {availableTutors.map(tutor => (
                                <option key={tutor.id} value={tutor.id}>
                                    {tutor.full_name} ({tutor.email})
                                </option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple tutors</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="student_ids">Select Students</label>
                        <select
                            id="student_ids"
                            name="student_ids"
                            multiple
                            value={formData.student_ids}
                            onChange={handleMultiSelectChange}
                            required
                        >
                            {availableStudents.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.full_name} ({student.email})
                                </option>
                            ))}
                        </select>
                        <small>Hold Ctrl/Cmd to select multiple students</small>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClassCreate; 