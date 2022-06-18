import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { selectUserData, _login, _logout } from "../stores/userData";
import { useSelector, useDispatch } from "react-redux";
import asyncJsonFetch from "../func/asyncJsonFetch";

//integrate redux and cookies
function useAuth() {
    const userData = useSelector(selectUserData); 
    const dispatch = useDispatch();
    const [cookies, setCookies, removeCookies] = useCookies();

    const syncCookieWithRedux = () => {
        let {uid, token, login} = userData;
        if (!login && cookies['auth']){
            dispatch(_login(cookies['auth']));
            return cookies['auth'];
        }
        if (login && !cookies['auth']){
            setCookies('auth',{
                uid: uid,
                token: token
            });
            return {uid, token};
        }
        if (login && token !== cookies['auth'].token){
            setCookies('auth',{
                uid: uid,
                token: token
            });
            return {uid, token};
        }
        return {uid, token};
    }

    useEffect(() => {syncCookieWithRedux()}, []);

    const checkAuth = async () => {
        let {uid, token} = syncCookieWithRedux();
        let result = await asyncJsonFetch("https://ubereat.nycu.me/api/check_login.php",{
            uid: uid,
            token: token
        })
        .then(body => {
            // console.log('auth', body["result"], userData, cookies['auth'])
            if (!body["result"]){
                removeCookies('auth');
                logout();
            }
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
                uid: userData.uid
            })
        });
        dispatch(_logout());
        removeCookies('auth');
    };

    return [login, logout, checkAuth, {
        uid: userData.uid,
        token: userData.token,
        login: userData.login
    }];
}

export default useAuth;