import "./foodItem.scss"
import '../common.scss';
import { changeStore, addItem } from "../stores/cart";
import { useDispatch, useSelector } from "react-redux";
import useAlert from "../hook/useAlert";
import { selectCart } from "../stores/cart";

const FoodItem = (props) => {
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const [show,] = useAlert();

    return <div className={`food-item ${props.food.amount?null:"out-of-stock"}`}>
        <img className="food-img" src={props.food.thumbnail} alt={props.food.name}/>
        <div className="text-container">
            <div className="food-name">{props.food.name}</div>
            <div className="food-price">${props.food.price}, </div>
            <div className="food-amount">remains {props.food.amount}</div>
            <button className="add" onClick={() => {
                dispatch(changeStore({
                    store: props.storeid,
                    storeName: props.storeName
                }));
                for(let food of cart.foods){
                    if (food.fid === props.food.fid) {
                        show("added to cart already","warn");
                        return;
                    }
                }
                dispatch(addItem({
                    fid: props.food.fid,
                    name: props.food.name,
                    thumbnail: props.food.thumbnail,
                    amount: props.food.amount,
                    price: props.food.price
                }));
                if (props.food.amount) show("added to cart");
                else show("item out of stock :(","warn");
            }}>add to cart</button>
        </div>
    </div>
}

export default FoodItem;