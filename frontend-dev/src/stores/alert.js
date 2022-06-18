import { createSlice } from "@reduxjs/toolkit";

export const alertSlice = createSlice({
    name: "alert",
    initialState: {
        type: "",
        message: "",
        activated: false
    },
    reducers: {
        show: (state, action) => {
            state.activated = true;
            state.type = action.payload.type;
            state.message = action.payload.message;
        },
        hide: (state) => {
            state.activated = false;
        }
    }
});

export const selectAlert = (state) => state.alert;
export const { show, hide } = alertSlice.actions;
export default alertSlice.reducer;