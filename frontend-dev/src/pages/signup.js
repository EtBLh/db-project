import '../common.scss';
import { useState } from "react";

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
            alert('password and password comfirm are not identical.');
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
                alert("success!");
            } else {
                alert(errorMsg[body.status]);
            }
            console.log(body);
        });
    }

    const inputChange = (item, value) => {
        let newState = {...input}; //clone input obj
        newState[item] = value;
        setInput(newState);
    }

    return <>
        <div className="container">
            <label>account</label>
            <input type="text" onChange={ev=>inputChange("ac",ev.target.value)} value={input.ac} />
            <br/>
            <label>password</label>
            <input type="password" onChange={ev=>inputChange("pw",ev.target.value)} value={input.pw} />
            <br/>
            <label>password confirm</label>
            <input type="password" onChange={ev=>inputChange("pwc",ev.target.value)} value={input.pwc} />
            <br/>
            <label>first name</label>
            <input type="text" onChange={ev=>inputChange("fname",ev.target.value)} value={input.fname} />
            <br/>
            <label>last name</label>
            <input type="text" onChange={ev=>inputChange("lname",ev.target.value)} value={input.lname} />
            <br/>
            <label>phone</label>
            <input type="text" onChange={ev=>inputChange("phone",ev.target.value)} value={input.phone} />
            <br/>
            <label>longtitude</label>
            <input type="text" onChange={ev=>inputChange("long",ev.target.value)} value={input.long} />
            <br/>
            <label>latitude</label>
            <input type="text" onChange={ev=>inputChange("lat",ev.target.value)} value={input.lat} />
            <br/>
            <button onClick={e => req()}>submit</button>
        </div>
    </>
}

export default Signup;