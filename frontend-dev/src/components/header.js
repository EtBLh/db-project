import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faCartShopping, faMagnifyingGlass, faFilter, faCar, faTag, faSackDollar } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from "react-router-dom"

import { selectFilter, filterChange } from "../stores/filter"
import { useSelector, useDispatch } from "react-redux"
import Popup from './popup'
import Login from './login'
import Signup from './signup'
import UserData from "./userData"
import Cart from './cart'
import useAuth from "../hook/useAuth"

import '../common.scss';
import { hideCart, selectCart, showCart } from "../stores/cart"
import { hideUserData, selectUserData, showUserData } from "../stores/userData"

const Header = () => {

    const [,,, auth] = useAuth();
    const [filterOptionsShow, setFilterOptionsShow] = useState(false);
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const filter = useSelector(selectFilter);
    const cart = useSelector(selectCart);
    const userData = useSelector(selectUserData);

    useEffect(() => {
        if (!auth.login){
            dispatch(hideCart());
            dispatch(hideUserData());
        }
    },[auth]);

    return <header>
        <div className="container">
            <Link to="/" style={{textDecoration: "none"}}>
                <h1>DB EAT</h1>
            </Link>
            <div id="options">
                <div id="search">
                    <label name="search" id="searchbar-label"><FontAwesomeIcon icon={faMagnifyingGlass}/></label>
                    <input name="search" type="text" placeholder="Search for store or food" id="searchbar" 
                        value={filter.search} onChange={e => dispatch(filterChange({
                            type: "search",
                            value: e.target.value
                        }))}/>
                </div>
                <div id="filter" onClick={e => setFilterOptionsShow(!filterOptionsShow)}>
                    <span><FontAwesomeIcon icon={faFilter}/>&nbsp;FILTER</span>
                </div>
            </div>
            <nav>
                <div className="link">
                    <div className="click-area" onClick={() => {if(!cart.activated)dispatch(showCart())}}>
                        <FontAwesomeIcon icon={faCartShopping}/>
                    </div>
                    <Popup id="cart" activated={cart.activated} deactivate={() => {
                        dispatch(hideCart());
                    }}>
                        <Cart/>
                    </Popup>
                </div>
                <div className="link">
                    <div className="click-area" onClick={() => {
                        if (auth.login){
                            if (!userData.show)dispatch(showUserData());
                        } else {
                            dispatch(hideUserData());
                            if (location.pathname==="/login" || location.pathname==="/signup"){
                                navigate("/");
                            } else navigate("/login")
                        }
                    }}>
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <Popup id="user-prompt" activated={
                        location.pathname==="/login" ||
                        location.pathname==="/signup" ||
                        userData.show
                        } deactivate={() => {
                            if (location.pathname==="/login" || location.pathname==="/signup"){
                                navigate("/");
                            }
                            dispatch(hideUserData());
                        }}>
                        {location.pathname==="/login"?<Login/>:null}
                        {location.pathname==="/signup"?<Signup/>:null}
                        {userData.show?<UserData/>:null}
                    </Popup>
                </div>
            </nav>
        </div>
        <div id="filter-options" style={{display:filterOptionsShow?"block":"none"}}>
            <div className="container">
                <div id="distance" style={{display:auth.login?"inline-block":"none"}}>
                    <FontAwesomeIcon icon={faCar} />
                    <select id="filter-distance" value={filter.distance}
                        onChange={e => dispatch(filterChange({
                            type: "distance",
                            value: e.target.value
                        }))}>
                        <option value="">All Distance</option>
                        <option value="100">Close</option>
                        <option value="1000">Mid</option>
                        <option value="10000">Far</option>
                    </select>
                </div>
                <div id="price-range">
                    <FontAwesomeIcon icon={faSackDollar} />
                    <input id="filter-price-low-limit" value={filter.pricelow}
                        placeholder="Lowest" type="number"
                        onChange={e => dispatch(filterChange({
                            type: "pricelow",
                            value: e.target.value
                        }))}/>
                    <span style={{opacity: ".5"}}>to</span>
                    <input id="filter-price-high-limit" value={filter.pricehigh}
                        placeholder="Highest" type="number"
                        onChange={e => dispatch(filterChange({
                            type: "pricehigh",
                            value: e.target.value
                        }))}/>
                </div>
                <div id="class">
                    <FontAwesomeIcon icon={faTag} />
                    <input id="filter-class" value={filter.class}
                        placeholder="Class"
                        onChange={e => dispatch(filterChange({
                            type: "class",
                            value: e.target.value
                        }))}/>
                </div>
            </div>
        </div>
    </header>
}

export default Header;