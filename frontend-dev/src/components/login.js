import { useNavigate } from "react-router-dom";

import '../common.scss';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hook/useAuth";
import useAlert from "../hook/useAlert";

const Login = () => {
    const navigate = useNavigate();
    const [ac, setAc] = useState(""); 
    const [pw, setPw] = useState("");
    const [login, logout, checkAuth, auth] = useAuth();
    const [show,] = useAlert();

    const _login = () => {
        fetch("https://ubereat.nycu.me/api/login.php",{
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                ac: ac,
                pw: pw
            })
        })
        .then(res => res.json())
        .then(body => {
            if (body.status !== 0){
                show('login failed',"danger");
                return;
            }
            login(body.uid, body.token);
            navigate("/");
            show("login success!");
        });
    }

    return <div className="popup-container">
        <label>ACCOUNT</label>
        <input type="text" onChange={ev=>setAc(ev.target.value)} value={ac} />
        <label>PASSWORD</label>
        <input type="password" onChange={ev=>setPw(ev.target.value)} value={pw} />
        <div className="row" style={{textAlign: 'right'}}>
            <Link style={{textAlign: "right", marginRight: "1rem"}} to="/signup">signup</Link>
            <button onClick={_login}>Login</button>
        </div>
    </div>
}

export default Login;