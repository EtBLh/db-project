import { createSlice } from "@reduxjs/toolkit";

export const filterSlice = createSlice({
    name: "filter",
    initialState: {
        activated: false,
        distance: '',
        pricelow: '',
        pricehigh: '',
        class: '',
        search: ''
    },
    reducers: {
        filterChange: (state, action) => {
            state[action.payload.type] = action.payload.value;
            state.activated = !!(state.distance || state.pricehigh ||
                                state.pricelow || state.class);
        }
    },
});

export const selectFilter = (state) => state.filter;
export const { filterChange } = filterSlice.actions;
export default filterSlice.reducer;