import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuth from '../hook/useAuth';

import asyncJsonFetch from "../func/asyncJsonFetch";

import '../common.scss';
import './home.scss';
import ShopCard from "../components/shopCard";

const Home = () => {
    const navigate = useNavigate();
    const [login, logout, checkAuth, auth] = useAuth();

    const [shopList, setShopList] = useState([]);
    const [shopListSBF, setShopListSBF] = useState([]);
    const [newPostition, setNewPosition] = useState({long: 0, lat: 0});
    const [userinfo, setUserInfo] = useState({
        ac: "",
        name: "",
        phone: "",
        long: 0,
        lat: 0
    });
    const [search, setSearch] = useState("");
    const [filter, setfilter] = useState({
        activated: false,
        distance: '',
        pricelow: '',
        pricehigh: '',
        class: '' 
    });

    useEffect(() => {
        checkAuth()
        .then(res => {
            if (!res) navigate('/');
            getUserInfo();
            getShopList();
        })
    }, [auth.login]);

    useEffect(() => {
        getShopList();
    }, [search, filter]);

    const filterChange = (ftype, value) => {
        let newState = {...filter};
        newState[ftype] = value;
        newState.activated = !!(newState.distance || newState.pricehigh ||
                                newState.pricelow || newState.class);
        setfilter(newState);
    }

    const getUserInfo = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_user_info.php",{
            uid:auth.uid,
            token:auth.token
        }).then(body => {
                setUserInfo({
                    ac: body.ac,
                    name: body.name,
                    phone: body.phone,
                    long: body.long,
                    lat: body.lat
            })
        });
    }

    const getShopList = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_shop_list.php",{
            search: search,
            filter: {
                ...filter,
                position: {
                    longtidue: userinfo.longtitude,
                    longtidue: userinfo.latitude,
                }
            }
        }).then(body => {
            setShopList(body.searchbystore);
            setShopListSBF(body.searchbyfood);
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
                getUserInfo();
            }
        })
    }

    return <div className="container">
        <div id="user-info">
            <h3>User Info</h3>
            <table>
                <tbody>
                    <tr>
                        <td>account</td>
                        <td>{userinfo.ac}</td>
                    </tr>
                    <tr>
                        <td>name</td>
                        <td>{userinfo.name}</td>
                    </tr>
                    <tr>
                        <td>phone</td>
                        <td>{userinfo.phone}</td>
                    </tr>
                    <tr>
                        <td>position</td>
                        <td>{userinfo.long}, {userinfo.lat}</td>
                    </tr>
                    <tr><span style={{fontStyle:"italic"}}>change user data</span></tr>
                    <tr>
                        <td><label>new longtitude</label></td>
                        <td>
                            <input type="text" value={newPostition.long} onChange={e=>setNewPosition({
                                long: e.target.value, lat: newPostition.lat
                            })}/>
                        </td>
                    </tr>
                    <tr>
                        <td><label>new latitude</label></td>
                        <td>
                            <input type="text" value={newPostition.lat} onChange={e=>setNewPosition({
                                long: newPostition.long, lat: e.target.value
                            })}/>
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td align="right">
                            <button onClick={updatePosition} style={{width: "50%", display:"inline-block"}}>update</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className="shop-filter">
            <input id="search-bar" value={search} onChange={e => setSearch(e.target.value)}/>
            <label>distance:</label>
            <select id="filter-distance" value={filter.distance}
                onChange={e => filterChange("distance",e.target.value)}>
                <option value="">select distance</option>
                <option value="100">close</option>
                <option value="1000">mid</option>
                <option value="10000">far</option>
            </select>
            <label>price range:</label>
            <input id="filter-price-low-limit" value={filter.pricelow} 
                onChange={e => filterChange("pricelow",e.target.value)}/>
            <input id="filter-price-high-limit" value={filter.pricehigh}
                onChange={e => filterChange("pricehigh",e.target.value)}/>
            <label>type:</label>
            <input id="filter-type" value={filter.class}
                onChange={e => filterChange("class",e.target.value)}/>
        </div>
        <div className="shop-list">
            {
                Object.keys(shopList).length !== 0?
                    shopList.map((shop, idx) => {
                        return <ShopCard key={idx} shop={shop} user={userinfo}/>
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
                            return <ShopCard key={idx} shop={shop} user={userinfo}/>
                        })
                    }
                </div>
            </>
        :null
        }
    </div>
}

export default Home;