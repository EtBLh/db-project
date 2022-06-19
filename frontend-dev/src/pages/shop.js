import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import FoodItem from "../components/customerFoodItem";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";
import useAlert from "../hook/useAlert";

import "./shop.scss";
import "../components/foodItem.scss"
import { useSelector } from "react-redux";
import { selectCart } from "../stores/cart";

const Shop = () => {

    let { storeid } = useParams();
    let [show,] = useAlert();

    const navigate = useNavigate();
    const [, , checkAuth, auth] = useAuth();
    const [shopData, setShopData] = useState({});
    const [foodList, setFoodList] = useState([]);
    const cart = useSelector(selectCart);

    const getShopData = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_shop_data.php",{
            uid: auth.uid, token: auth.token, store: storeid
        }).then(body => {
            if (body.status === 0)
                setShopData(body);
        })
    }

    const getFoodList = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_food_list.php",{
            uid: auth.uid, token: auth.token, store: storeid
        }).then(body => {
            if (body.status === 2){
                return;
            }
            setFoodList(body);
        })
    }

    useEffect(() => {
        checkAuth().then(res => {
            if (!res){
                show("login before accessing to shop page", "warn");
                navigate('/');
            } else 
                getShopData();
        })
    },[auth.login, cart]);

    useEffect(getFoodList,[shopData]);

    return <div className="container">
        {
            shopData?<>
                <h2>{shopData.name}</h2>
                <div id="info">
                    <div id="class">{shopData.class}</div>
                    <div id="position">({shopData.long+", "+shopData.lat})</div>
                </div>
                <div className="food-list">
                    {
                        foodList.length?
                            foodList.map((food, idx) => <FoodItem food={food} key={idx} update={getFoodList} storeid={storeid} storeName={shopData.name}/>)
                            :null
                    }
                </div>
            </>:null
        }
    </div>
}

export default Shop;