import { createSlice } from "@reduxjs/toolkit";

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        store: null,
        storeName: '',
        activated: false,
        foods: [

        ]
    },
    reducers: {
        changeStore: (state, action) => {
            if (state.store !== action.payload.store){
                state.store = action.payload.store;
                state.storeName = action.payload.storeName;
                state.foods = [];
            }
        },
        addItem: (state, action) => {
            for (let food of state.foods){
                if (food.fid === action.payload.fid) return;
            }
            if (action.payload.amount < 1) return;
            state.foods.push({
                fid: action.payload.fid,
                name: action.payload.name,
                price: action.payload.price,
                amount: action.payload.amount,
                thumbnail: action.payload.thumbnail,
                quantity: 1
            });
        },
        itemPlusPlus: (state, action) => {
            state.foods.forEach(food => {
                if (food.fid === action.payload.fid) {
                    if (food.quantity < food.amount)
                        food.quantity++;
                    return;
                }
            });
        },
        itemMinusMinus: (state, action) => {
            state.foods.forEach((food, idx) => {
                if (food.fid === action.payload.fid) {
                    if (food.quantity > 0)
                        food.quantity--;
                    if (food.quantity < 1){
                        state.foods.splice(idx,1);
                    }
                    return;
                }
            });
        },
        clearCart: (state, action) => {
            state.store = null;
            state.storeName = null;
            state.foods = [];
        },
        showCart: (state) => {state.activated = true},
        hideCart: (state) => {state.activated = false}
    },
});

export const selectCart = (state) => state.cart;
export const { changeStore, addItem, itemPlusPlus, itemMinusMinus, clearCart, showCart, hideCart } = cartSlice.actions;
export default cartSlice.reducer;