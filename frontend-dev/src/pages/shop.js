import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import FoodItem from "../components/customerFoodItem";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";

import "./shop.scss";
import "../components/foodItem.scss"

const Shop = () => {

    let { storeid } = useParams();

    const navigate = useNavigate();
    const [login, logout, checkAuth, auth] = useAuth();
    const [shopData, setShopData] = useState({
        exist: false
    });
    const [foodList, setFoodList] = useState([]);

    const getShopData = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_shop_data.php",{
            uid: auth.uid, token: auth.token, store: storeid
        }).then(body => {
            console.log("shopdata", body);
            setShopData(body);
        })
    }

    const getFoodList = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_food_list.php",{
            uid: auth.uid, token: auth.token, store: storeid
        }).then(body => {
            console.log("food", body);
            console.log("sid", shopData.sid);
            setFoodList(body);
        })
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
            shopData?<>
                <h2>{shopData.name}</h2>
                position: {shopData.longtitude+", "+shopData.latitude} <br/>
                class: {shopData.class}
                <div className="food-list">
                    {
                        foodList.map((food, idx) => <FoodItem food={food} key={idx} update={getFoodList}/>)
                    }
                </div>
            </>:null
        }
    </div>
}

export default Shop;