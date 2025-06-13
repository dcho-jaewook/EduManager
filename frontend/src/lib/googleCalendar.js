import { supabase } from './supabaseClient';

export const createCalendarEvent = async (classData, tutors, students) => {
    try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Get the access token
        const accessToken = session.provider_token;

        // Format the event details
        const event = {
            summary: `${classData.type} - ${classData.location}`,
            location: classData.location,
            description: classData.note || '',
            start: {
                dateTime: classData.start_time,
                timeZone: 'Asia/Seoul',
            },
            end: {
                dateTime: classData.end_time,
                timeZone: 'Asia/Seoul',
            },
            attendees: [
                ...tutors.map(tutor => ({ email: tutor.email })),
                ...students.map(student => ({ email: student.email }))
            ],
            reminders: {
                useDefault: true
            }
        };

        // Create the event using Google Calendar API
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to create calendar event');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
};

export const deleteCalendarEvent = async (eventId) => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const accessToken = session.provider_token;

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        // 410 Gone or 404 Not Found means the event is already deleted
        if (!response.ok && response.status !== 410 && response.status !== 404) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to delete calendar event');
        }
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        // Optionally, don't throw to allow class deletion to proceed
    }
}; 