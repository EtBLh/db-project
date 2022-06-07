import { Link } from "react-router-dom";

import "./foodItem.scss"
import '../common.scss';
import { useState } from "react";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";

const FoodItem = (prop) => {
    const [login, logout, checkAuth, auth] = useAuth();
    const [newData, setNewData] = useState({
        price: prop.price,
        amount: prop.amount
    });

    const newDataChange = (ndtype, value) => {
        let newState = {...newData};
        newState[ndtype] = value;
        setNewData(newState);
    }

    const delete_food = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/delete_food.php",{
            token: auth.token,
            uid: auth.token,
            name: prop.name
        }).then(body => prop.update())
    }

    const update_food = () => {
        console.log(newData);
        asyncJsonFetch("https://ubereat.nycu.me/api/update_food.php",{
            token: auth.token,
            uid: auth.token,
            name: prop.name,
            price: newData.price,
            amount: newData.amount
        }).then(body => prop.update())
    }

    return <div className="food-item">
        <img className="food-img" src={prop.food.thumbnail}/>
        <div className="text-container">
            <span className="food-name">{prop.food.name}</span>
            <span className="food-price">price: {prop.food.price}
                <input value={newData.price}
                onChange={e => newDataChange("price", e.target.value)}/>
            </span>
            <span className="food-amount">amount: {prop.food.amount}
                <input value={newData.amount}
                onChange={e => newDataChange("amount", e.target.value)}/>
            </span>
            <button onClick={update_food}>update</button>
            <a href="#" onClick={delete_food}>delete</a>
        </div>
    </div>
}

export default FoodItem;