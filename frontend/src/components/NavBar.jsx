import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import './NavBar.css';

function NavBar() {
    const { user, signInWithGoogle, signOut } = useAuth();

    return (
        <nav>
            <ul className="menu">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/programs">Programs</Link>
                </li>
                <li>
                    <a href="https://www.edugate-kr.com/" target="_blank">EduGate</a>
                </li>
                <li>
                    {user ? (
                        <a onClick={signOut}>Sign Out</a>
                    ) : (
                        <a onClick={signInWithGoogle}>Google Sign In</a>
                    )}
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;