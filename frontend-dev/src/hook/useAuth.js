import React from "react";
import { useCookies } from "react-cookie";
import { selectUserData, _login, _logout } from "../stores/userData";
import { useSelector, useDispatch } from "react-redux";
import asyncJsonFetch from "../func/asyncJsonFetch";

//integrate redux and cookies
function useAuth() {
    const auth = useSelector(selectUserData); 
    const dispatch = useDispatch();
    const [cookies, setCookies, removeCookies] = useCookies();

    const syncCookieRedux = () => {
        if (!auth.login && cookies['auth']){
            dispatch(_login(cookies['auth']));
            return;
        }
        if (auth.login && !cookies['auth']){
            setCookies('auth',{
                uid: auth.uid,
                token: auth.token
            });
            return;
        }
        if (auth.token && auth.token !== cookies['auth'].token){
            setCookies('auth',{
                uid: auth.uid,
                token: auth.token
            });
        }
    }

    const checkAuth = async () => {
        syncCookieRedux();
        let result = await asyncJsonFetch("https://ubereat.nycu.me/api/check_login.php",{
            uid: auth.uid,
            token: auth.token
        })
        .then(body => {
            if (!body["result"]){
                removeCookies('auth');
                dispatch(_logout);
            }
            console.log("login", body["result"]);
            return body["result"];
        });
        return result;
    }

    const login = (uid, token) => {
        dispatch(_login({uid, token}));
        setCookies('auth',{
            uid: uid,
            token: token
        });
    }

    const logout = () => {
        fetch("https://ubereat.nycu.me/api/logout.php",{
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                uid: auth.uid
            })
        });
        dispatch(_logout);
        removeCookies('auth');
    };

    return [login, logout, checkAuth, auth];
}

export default useAuth;