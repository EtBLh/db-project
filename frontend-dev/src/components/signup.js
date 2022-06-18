import '../common.scss';
import { useState } from "react";
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import asyncJsonFetch from '../func/asyncJsonFetch';
import useAlert from '../hook/useAlert';

const Signup = () => {
    const [input, setInput] = useState({
        ac: "",
        pw: "",
        fname: "",
        lname: "",
        phone: "",
        long: 0,
        lat: 0,
        pwc: ""
    });
    const navigate = useNavigate();
    const [acValidMsg, setAcValidMsg] = useState("ok");
    const [show,] = useAlert();

    const errorMsg = [  '',
                        'unknown error',
                        'empty field exists',
                        'first name or last name does not meet requirement',
                        'phone does not meet requirement',
                        'password does not meet requirement',
                        'account does not meet requirement',
                        'position does not meet requirement',
                        'account already exists']

    const req = () => {
        if (input.pw !== input.pwc){
            show('password and password comfirm are not identical.', "danger");
            return;
        } 
        fetch("https://ubereat.nycu.me/api/signup.php",{
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(input)
        })
        .then(res => res.json())
        .then(body => {
            if (body.status === 0){
                show("success!");
                navigate('/login');
            } else {
                show(errorMsg[body.status],"danger");
            }
        });
    }

    const inputChange = (item, value) => {
        let newState = {...input}; //clone input obj
        newState[item] = value;
        setInput(newState);
        if (item === "ac"){
            asyncJsonFetch("https://ubereat.nycu.me/api/check_account_valid.php",{
                "ac": value
            }).then(body => {
                if (body.status === 0 && body.exist){
                    setAcValidMsg("ac already exists :(");
                } else if (body.status === 2){
                    setAcValidMsg("ac empty :(");
                } else {
                    setAcValidMsg("ok!");
                }
            })
        }
    }

    return <>
        <div className="popup-container">
            <div className="row _5050">
                <label>account</label>
                <span className="main-color right">{acValidMsg}</span>
            </div>
            <input type="text" onChange={ev=>inputChange("ac",ev.target.value)} value={input.ac} />
            <label>password</label>
            <input type="password" onChange={ev=>inputChange("pw",ev.target.value)} value={input.pw} />
            <label>password confirm</label>
            <input type="password" onChange={ev=>inputChange("pwc",ev.target.value)} value={input.pwc} />
            <label>first name</label>
            <input type="text" onChange={ev=>inputChange("fname",ev.target.value)} value={input.fname} />
            <label>last name</label>
            <input type="text" onChange={ev=>inputChange("lname",ev.target.value)} value={input.lname} />
            <label>phone</label>
            <input type="number" onChange={ev=>inputChange("phone",ev.target.value)} value={input.phone} />
            <label>longtitude</label>
            <input type="number" onChange={ev=>inputChange("long",ev.target.value)} value={input.long} />
            <label>latitude</label>
            <input type="number" onChange={ev=>inputChange("lat",ev.target.value)} value={input.lat} />

            <div className="row" style={{textAlign: 'right'}}>
                <Link style={{textAlign: "right", marginRight: "1rem"}} to="/login">login</Link>
                <button onClick={e => req()}>submit</button>
            </div>
        </div>
    </>
}

export default Signup;