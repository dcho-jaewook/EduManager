import { useEffect, useState } from 'react';

function Programs() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

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
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
       }

       fetchPrograms();
       console.log(programs);
    }, []);

    if (loading) {
        return <div>Loading programs...</div>;
    }

    return (
        <div>
            <h1>Programs List</h1>
            <ul>
                {programs.map((program) => (
                    <li key={program.id}>{program.title}</li>
                ))}
            </ul>
        </div>
    );
}

export default Programs;