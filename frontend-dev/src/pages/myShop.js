import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import FileBase64 from 'react-file-base64';

import FoodItem from "../components/foodItem";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";

import "./shop.scss";
import "../components/foodItem.scss"

const MyShop = () => {

    const navigate = useNavigate();
    const [login, logout, checkAuth, auth] = useAuth();
    const [shopData, setShopData] = useState({
        exist: false
    });
    const [foodList, setFoodList] = useState([]);
    const [newShopData, setNewShopData] = useState({
        name: "",
        long: "",
        lat: "",
        class: ""
    });
    const initialNewFood = {
        name: "",
        amount: "",
        price: "",
        thumbnail: ""
    }
    const [newFood, setNewFood] = useState(initialNewFood);

    const newShopDataChange = (sdtype, value) => {
        let newState = {...newShopData}; //clone input obj
        newState[sdtype] = value;
        setNewShopData(newState);
    }

    const newFoodChange = (ftype, value) => {
        let newState = {...newFood}; //clone input obj
        newState[ftype] = value;
        setNewFood(newState);
    }

    const addFood = () => {
        let error = 0;
        if (newFood.name === "") error = 1;
        if (newFood.amount === "" || !newFood.amount.match(/^[0-9]+$/i)) error = 2;
        if (newFood.price === "" || !newFood.price.match(/^[0-9]+$/i)) error = 3;
        if (newFood.thumbnail === "") error = 4;
        if (error !== 0) {
            alert ("info wrong format, error "+ error);
            return;
        } else {
            asyncJsonFetch("https://ubereat.nycu.me/api/create_food.php",{
                ...newFood,
                uid: auth.uid,
                token: auth.token
            }).then(body => getFoodList());
            setNewFood(initialNewFood);
        }
    }

    const getShopData = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_user_shop.php",{
            uid: auth.uid, token: auth.token
        }).then(body => {
            console.log("shopdata", body);
            setShopData(body);
        })
    }

    const getFoodList = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_food_list.php",{
            uid: auth.uid, token: auth.token, store: shopData.sid
        }).then(body => {
            console.log("food", body);
            console.log("sid", shopData.sid);
            setFoodList(body);
        })
    }

    const newShopRegister = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/create_shop.php",{
            uid: auth.uid,
            token: auth.token,
            name: newShopData.name,
            long: newShopData.long,
            lat: newShopData.lat,
            class: newShopData.class,
        }).then(body => console.log(body))
        .then(getShopData());
    }

    useEffect(() => {
        checkAuth()
        .then(res => {
            if (!res){
                navigate('/');
            }
        })
    },[auth]);

    useEffect(getShopData,[]);
    useEffect(getFoodList,[shopData]);

    return <div className="container">
        {
            shopData.exist?shopData?<>
                <h2>{shopData.name}</h2>
                position: {shopData.longtitude+", "+shopData.latitude} <br/>
                class: {shopData.class}
                <div className="food-list">
                    {
                        foodList.map((food, idx) => <FoodItem food={food} key={idx} update={getFoodList}/>)
                    }
                    <div className="food-item add">
                        <div className="text-container">
                            + add food
                            <span className="food-name">
                                <label>name: </label>
                                <input value={newFood.name} onChange={e=>newFoodChange("name",e.target.value)}/>
                            </span>
                            <span className="food-price">
                                <label>price: </label>
                                <input value={newFood.price} onChange={e=>newFoodChange("price",e.target.value)}/>
                            </span>
                            <span className="food-amount">
                                <label>amount: </label>
                                <input value={newFood.amount} onChange={e=>newFoodChange("amount",e.target.value)}/>
                            </span>
                            <span className="food-image">
                                <label>image: </label>
                                <FileBase64
                                    multiple={ false }
                                    onDone={ file => newFoodChange("thumbnail",file.base64)} />
                            </span>
                            <button onClick={addFood}>add food</button>
                        </div>
                    </div>
                </div>
            </>:null
            :<>
                {"you dont have a shop, create a new one?"}
                <br/>
                <label>shop name:</label><input id="new-shop-name" value={shopData.name}
                    onChange={e => newShopDataChange("name", e.target.value)}/><br/>
                <label>shop longtitude:</label><input id="new-shop-long" value={shopData.long}
                    onChange={e => newShopDataChange("long", e.target.value)}/><br/>
                <label>shop latitude:</label><input id="new-shop-lat" value={shopData.lat}
                    onChange={e => newShopDataChange("lat", e.target.value)}/><br/>
                <label>shop class:</label><input id="new-shop-class" value={shopData.class}
                    onChange={e => newShopDataChange("class", e.target.value)}/><br/>
                <button onClick={newShopRegister}>register</button>
            </>
        }
    </div>
}

export default MyShop;