import { createSlice } from "@reduxjs/toolkit";

export const userDataSlice = createSlice({
    name: "userData",
    initialState: {
        login: false,
        uid: 0,
        token: "",
        name: null,
        account: null,
        lat: null,
        long: null,
        phone: null,
        show: false
    },
    reducers: {
        _login: (state, action) => {
            state.login = true;
            state.uid = action.payload.uid;
            state.token = action.payload.token;
        },
        _logout: (state) => {
            state.login = false;
            state.uid = 0;
            state.token = "";
        },
        _setData: (state, action) => {
            state.ac = action.payload.ac;
            state.name = action.payload.name;
            state.long = action.payload.long;
            state.lat = action.payload.lat;
            state.phone = action.payload.phone;
            state.account = action.payload.account;
            state.balance = action.payload.balance
        },
        showUserData: state => {state.show = true},
        hideUserData: state => {state.show = false},
    },
});

export const selectUserData = (state) => state.userData;
export const {_login, _logout, _setData, showUserData, hideUserData} = userDataSlice.actions;
export default userDataSlice.reducer;