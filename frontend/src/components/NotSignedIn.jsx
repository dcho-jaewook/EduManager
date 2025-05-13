import { useAuth } from "../contexts/AuthContext";

function NotSignedIn({message}) {
    const { signInWithGoogle } = useAuth();
    return (
        <>
            <h1>{message}</h1>
            <button 
            style={{ cursor: "pointer" }}
            onClick={signInWithGoogle}>
                Sign In with Google
            </button>
        </>
    );
}

export default NotSignedIn;