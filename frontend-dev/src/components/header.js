import useAuth from "../hook/useAuth";
import { Link } from "react-router-dom";

import '../common.scss';

const Header = () => {

    const [login, logout, checkAuth, auth] = useAuth();

    return <header>
        <Link to="/" style={{textDecoration: "none"}}>
            <h1 style={{display: "inline-block"}}>DB EAT</h1>
        </Link>
        {
            auth.login?
                <nav>
                    <Link to="/myshop">your shop</Link>
                    <a href="/" onClick={e => logout()}>logout</a>
                </nav>:
                <nav>
                    <Link to="/">login</Link>
                    <Link to="/signup">signup</Link>
                </nav>
        }
    </header>
}

export default Header;