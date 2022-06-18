import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuth from '../hook/useAuth';

import asyncJsonFetch from "../func/asyncJsonFetch";

import '../common.scss';
import './home.scss';
import ShopCard from "../components/shopCard";
import { useDispatch, useSelector } from "react-redux";
import { selectFilter } from "../stores/filter";
import { selectUserData, _setData } from "../stores/userData";

const Home = () => {
    const [, , checkAuth, auth] = useAuth();
    const filter = useSelector(selectFilter);
    const dispatch = useDispatch()

    const [shopList, setShopList] = useState([]);
    const [shopListSBF, setShopListSBF] = useState([]);
    const userData = useSelector(selectUserData);

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

    useEffect(() => {
        if (auth.login)
            checkAuth().then(res => {
                if (res) getUserData();
            })
    }, [auth]);

    useEffect(() => {
        getShopList();
    }, [filter]);


    const getShopList = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_shop_list.php",{
            search: filter.search,
            filter: {
                ...filter,
                position: {
                    longtidue: userData.long,
                    latitude: userData.lat,
                }
            }
        }).then(body => {
            setShopList(body.searchbystore);
            setShopListSBF(body.searchbyfood);
        });
    }

    return <div className="container">
        <div className="shop-list">
            {
                Object.keys(shopList).length !== 0?
                    shopList.map((shop, idx) => {
                        return <ShopCard key={idx} shop={shop}/>
                    })
                :null
            }
        </div>
        
        {
            Object.keys(shopListSBF).length !== 0?
            <>
                <h3>search by food</h3>
                <div className="shop-list">
                    {
                        shopListSBF.map((shop, idx) => {
                            return <ShopCard key={idx} shop={shop}/>
                        })
                    }
                </div>
            </>
        :null
        }
    </div>
}

export default Home;