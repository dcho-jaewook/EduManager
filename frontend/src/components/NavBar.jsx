import { Link } from "react-router-dom";
import './NavBar.css';

function NavBar() {
    return (
        <nav>
            <ul className="menu">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/programs">Programs</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavBar;