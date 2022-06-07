import { Link } from "react-router-dom";

import "./foodItem.scss"
import '../common.scss';
import { useState } from "react";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";

const FoodItem = (prop) => {
    const [login, logout, checkAuth, auth] = useAuth();

    return <div className="food-item">
        <img className="food-img" src={prop.food.thumbnail}/>
        <div className="text-container">
            <span className="food-name">{prop.food.name}</span>
            <span className="food-price">price: {prop.food.price}</span>
            <span className="food-amount">amount: {prop.food.amount}</span>
        </div>
    </div>
}

export default FoodItem;