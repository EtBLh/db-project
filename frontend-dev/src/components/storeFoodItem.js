import { Link } from "react-router-dom";

import "./foodItem.scss"
import '../common.scss';
import { useState } from "react";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";

const FoodItem = (props) => {
    const [login, logout, checkAuth, auth] = useAuth();
    const [newData, setNewData] = useState({
        price: props.price,
        amount: props.amount
    });

    const newDataChange = (ndtype, value) => {
        let newState = {...newData};
        newState[ndtype] = value;
        setNewData(newState);
    }

    const delete_food = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/delete_food.php",{
            token: auth.token,
            uid: auth.uid,
            name: props.food.name
        }).then(body => props.update())
    }

    const update_food = () => {
        console.log(newData);
        asyncJsonFetch("https://ubereat.nycu.me/api/update_food.php",{
            token: auth.token,
            uid: auth.uid,
            name: props.food.name,
            price: newData.price,
            amount: newData.amount
        }).then(body => props.update())
    }

    return <div className={`food-item modify ${props.food.amount?null:"out-of-stock"}`}>
        <img className="food-img" src={props.food.thumbnail} alt={props.food.name}/>
        <div className="text-container">
            <span className="food-name">{props.food.name}</span>
            <span className="food-price">price: {props.food.price}
                <input value={newData.price}
                onChange={e => newDataChange("price", e.target.value)}/>
            </span>
            <span className="food-amount">amount: {props.food.amount}
                <input value={newData.amount}
                onChange={e => newDataChange("amount", e.target.value)}/>
            </span>
            <button onClick={update_food}>update</button>
            <a href="#" onClick={delete_food}>delete</a>
        </div>
    </div>
}

export default FoodItem;