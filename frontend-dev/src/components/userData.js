import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import useAuth from '../hook/useAuth';
import { faRightFromBracket, faStore, faScroll, faMoneyBillTransfer, faCartFlatbed } from "@fortawesome/free-solid-svg-icons";

import asyncJsonFetch from "../func/asyncJsonFetch";
import '../common.scss';
import { hideUserData, selectUserData, _logout, _setData } from "../stores/userData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAlert from "../hook/useAlert";

const UserData = () => {
    const navigate = useNavigate();
    const [, logout, checkAuth, auth] = useAuth();
    const [ show, ] = useAlert();
    const [newPostition, setNewPosition] = useState({long: 0, lat: 0});
    const [rechargeAmount, setRechargeAmount] = useState(0);
    const userData = useSelector(selectUserData);
    const dispatch = useDispatch();

    useEffect(() => {
        checkAuth().then(res => {
            if (!res) {
                dispatch(hideUserData());
            } else getUserData();
        })
    }, [auth.login]);


    const getUserData = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_user_info.php",{
            uid:auth.uid,
            token:auth.token
        }).then(body => {
            dispatch(_setData({
                ac: body.ac,
                name: body.name,
                phone: body.phone,
                long: body.long,
                lat: body.lat,
                balance: body.balance
            }));
        });
    }

    const updatePosition = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/update_user_info.php",{
            uid: auth.uid,
            token: auth.token,
            longtitude: newPostition.long,
            latitude: newPostition.lat 
        }).then(body => {
            if (body.status === 0){
                getUserData();
                show("position update success!");
            } else show("position update failed :(","danger");
        })
    }

    const recharge = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/recharge.php",{
            uid: auth.uid,
            token: auth.token,
            amount: rechargeAmount
        }).then(body => {
            if (body.status === 0){
                getUserData();
                show("recharge success!");
            } else {
                show("recharge failed :(", "warn");
            }
        });
        setRechargeAmount(0);
    }

    return <div className="popup-container">
            <h3>{userData.ac}</h3>
            <div className="row _5050">
                <span>your name</span>
                <span>{userData.name}</span>
            </div>
            <div className="row _5050">
                <span>your phone</span>
                <span>{userData.phone}</span>
            </div>
            <hr style={{marginTop: "1rem"}}/>
            <button className="full-row-btn" onClick={() => {logout(); show("logout success!")}}>
                <FontAwesomeIcon icon={faRightFromBracket}/>&nbsp;&nbsp;Logout
            </button>
            <button className="full-row-btn" onClick={() => {
                navigate('/myshop');
            }}>
                <FontAwesomeIcon icon={faStore}/>&nbsp;&nbsp;My Shop
            </button>
            <button className="full-row-btn" onClick={() => {
                navigate('/myshoporders');
            }}>
                <FontAwesomeIcon icon={faCartFlatbed}/>&nbsp;&nbsp;My Shop Orders
            </button>
            <button className="full-row-btn" onClick={() => {
                navigate('/orders');
            }}>
                <FontAwesomeIcon icon={faScroll}/>&nbsp;&nbsp;My Order
            </button>
            <button className="full-row-btn" onClick={() => {
                navigate('/transactions');
            }}>
                <FontAwesomeIcon icon={faMoneyBillTransfer}/>&nbsp;&nbsp;Transaction History
            </button>
            <hr/>
            <div className="row _5050">
                <h4>position</h4>
                <span className="right">({userData.long}, {userData.lat})</span>
            </div>
            <label>new longtitude</label>
            <input type="number" value={newPostition.long} onChange={e=>setNewPosition({
                long: e.target.value, lat: newPostition.lat
            })}/>
            <label>new latitude</label>
            <input type="number" value={newPostition.lat} onChange={e=>setNewPosition({
                long: newPostition.long, lat: e.target.value
            })}/>
            <div className="row _5050">
                <div></div>
                <button onClick={updatePosition} className="secondary">update</button>
            </div>
            <hr/>
            <div className="row _5050">
                <h4>balance</h4>
                <span className="right">${userData.balance}</span>
            </div>
            <label>recharge</label>
            <input type="number" value={rechargeAmount} onChange={e=> setRechargeAmount(e.target.value)}/>
            <div className="row _5050">
                <div></div>
                <button onClick={recharge} className="secondary">recharge</button>
            </div>
        </div>
}

export default UserData;