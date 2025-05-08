import { useEffect, useState } from 'react';

function Programs() {
    const [programs, setPrograms] = useState([]);

    useEffect(() => {
       const fetchPrograms = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/programs");
            if (!response.ok) {
                throw new Error("Server Error");
            }
            const jsonPrograms = await response.json();
            setPrograms(jsonPrograms);
        }
        catch (error) {
            console.error("Fetch error:", error);
        }
       }

       fetchPrograms();
       console.log(programs);
    }, []);

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