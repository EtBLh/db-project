import { useEffect, useState } from "react";
import useAuth from "../hook/useAuth";
import useAlert from '../hook/useAlert';
import asyncJsonFetch from '../func/asyncJsonFetch';
import { clearCart, hideCart, selectCart } from "../stores/cart";
import { useDispatch, useSelector } from "react-redux";
import CartItem from './cartItem';
import '../common.scss';
import './cart.scss';

const Cart = () => {
    const [,,, auth] = useAuth();
    const [show,] = useAlert();
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const defaultPreview = {
        total: 0,
        subtotal: 0,
        delivery_fee: 0
    };
    const [preview, setPreview] = useState(defaultPreview);
    const [delivery, setDelivery] = useState(true);

    const calcParams = () => {
        return {
            uid: auth.uid, token: auth.token,
            sid: cart.store, delivery: delivery,
            orderdetail: cart.foods.map(food => {
                return {
                    fid: food.fid,
                    quantity: food.quantity
                }
            })
        }
    }

    const placeOrder = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/create_order.php", calcParams())
        .then(body => {
            if (body.status === 0){
                show("order success!");
                dispatch(clearCart());
                dispatch(hideCart());
            } else {
                show("order failure :(");
            }
        })
    }

    useEffect(() => {
        if (cart.store && cart.foods !== []){
            asyncJsonFetch("https://ubereat.nycu.me/api/check_shop_cart.php", calcParams())
            .then(body => {
                if (body.status === 0){
                    setPreview(body);
                } else setPreview(defaultPreview);
            })
        }
    }, [cart, delivery])

    if (!cart.foods[0]){
        return <div className="popup-container">
            <div className="row" style={{fontSize:"1.1rem", textAlign: "center"}}>
                {"nothing in the cart yet :("}
            </div>
        </div>
    } else return <div className="popup-container">
        <h3>{cart.storeName}</h3>
        <hr/>
        {
            cart.foods?.map((food, idx) => 
                <CartItem food={food} key={idx}/>
            )
        }
        <div className="row">
            <span>delivery fee:</span>
            <span>${preview.delivery_fee}</span>
        </div>
        <div className="row">
            <span>subtotal:</span>
            <span>${preview.subtotal}</span>
        </div>
        <div className="row">
            <span>total:</span>
            <span>${preview.total}</span>
        </div>
        <div className="row _5050">
            <div>
                <input name="delivery" type="checkbox" id="delivery" checked={delivery} onChange={e=>{
                    setDelivery(!!e.target.checked)
                }}/>
                <label name="delivery">Delivery</label>
            </div>
            <button onClick={placeOrder}>place order</button>
        </div>
    </div>
}

export default Cart;