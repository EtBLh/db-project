import { useState, useEffect, useDebugValue } from "react";
import { useNavigate } from "react-router";
import FileBase64 from 'react-file-base64';

import FoodItem from "../components/storeFoodItem";
import asyncJsonFetch from "../func/asyncJsonFetch";
import useAuth from "../hook/useAuth";

import "./shop.scss";
import "../components/foodItem.scss"
import useAlert from "../hook/useAlert";

const MyShop = () => {

    const navigate = useNavigate();
    const [, logout, checkAuth, auth] = useAuth();
    const [show, ] = useAlert();
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
            show("info wrong format, error: "+ error, "danger");
            return;
        } else {
            asyncJsonFetch("https://ubereat.nycu.me/api/create_food.php",{
                ...newFood,
                uid: auth.uid,
                token: auth.token
            }).then(body => {
                if (body.status === 0){
                    getFoodList();
                    show("added successfully!");
                } else show("error occur :(", "danger");
            });
            setNewFood(initialNewFood);
        }
    }

    const getShopData = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_user_shop.php",{
            uid: auth.uid, token: auth.token
        }).then(body => {
            setShopData(body);
        })
    }

    const getFoodList = () => {
        if (!shopData.shop_info) return;
        asyncJsonFetch("https://ubereat.nycu.me/api/get_food_list.php",{
            uid: auth.uid, token: auth.token, store: shopData.shop_info.sid
        }).then(body => {
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
        }).then(body => {
            if (body.status === 0) {
                show("created shop successfully");
                getShopData();
            } else show("error occured :(", "danger");
        });
    }

    useEffect(() => {
        if (auth.login) checkAuth().then(res => {
            if (!res){
                logout();
            }
        });
        else navigate('/');
    },[auth]);

    useEffect(getShopData, []);
    useEffect(getFoodList, [shopData]);

    return <div className="container">
        {
            shopData.exist?shopData?<>
                <h2>{shopData.shop_info.name}</h2>
                <div id="info">
                    <div id="class">{shopData.shop_info.class}</div>
                    <div id="position">({shopData.shop_info.long+", "+shopData.shop_info.lat})</div>
                </div>
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
                <div className="popup" style={{
                    width: "400px",
                    position: "absolute",
                    marginTop: "1rem",
                    left: "50%",
                    transform: "translateX(-50%)"
                }}>
                    <div className="popup-container">
                        <h3>Create Shop</h3>
                        <label>shop name:</label><input id="new-shop-name" value={shopData.name}
                            onChange={e => newShopDataChange("name", e.target.value)}/>
                        <label>shop longtitude:</label><input id="new-shop-long" value={shopData.long} type="number"
                            onChange={e => newShopDataChange("long", e.target.value)}/>
                        <label>shop latitude:</label><input id="new-shop-lat" value={shopData.lat} type="number"
                            onChange={e => newShopDataChange("lat", e.target.value)}/>
                        <label>shop class:</label><input id="new-shop-class" value={shopData.class}
                            onChange={e => newShopDataChange("class", e.target.value)}/>
                        <button onClick={newShopRegister}>register</button>
                    </div>
                </div>
                
            </>
        }
    </div>
}

export default MyShop;