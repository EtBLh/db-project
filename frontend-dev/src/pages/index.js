import { useNavigate } from "react-router-dom";

import '../common.scss';
import './index.scss';
import { useEffect, useState } from "react";
import useAuth from "../hook/useAuth";

const Index = () => {
    const navigate = useNavigate();
    const [ac, setAc] = useState(""); 
    const [pw, setPw] = useState("");
    const [login, logout, checkAuth, auth] = useAuth();

    useEffect(() => {
        checkAuth()
        .then(res => {
            if (res){
                navigate('/home');
            }
        })
    }, []);

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
                alert('login failed');
                return;
            }
            login(body.uid, body.token);
            navigate("/home");
        });
    }

    return <>
        <div className="container">
            <label>account</label>
            <input type="text" onChange={ev=>setAc(ev.target.value)} value={ac} />
            <br/>
            <label>password</label>
            <input type="password" onChange={ev=>setPw(ev.target.value)} value={pw} />
            <br/>
            <button onClick={_login}>submit</button>
        </div>
    </>
}

export default Index;