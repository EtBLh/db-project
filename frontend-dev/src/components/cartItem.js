import '../common.scss';
import './cart.scss';
import { itemPlusPlus, itemMinusMinus } from "../stores/cart";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';


const CartItem = (props) => {
    const dispatch = useDispatch();

    return <div className="cart-item row">
        <img className="food-img" src={props.food.thumbnail} alt={props.food.name}/>
        <div className="text-container">
            <span className="food-name">{props.food.name}</span>
            <span className="food-price">${props.food.price * props.food.quantity}</span>
            <div className="food-quantity">
                <span onClick={() => {
                    dispatch(itemMinusMinus({fid: props.food.fid}));
                }}>
                    <FontAwesomeIcon icon={faMinus} />
                </span>
                {props.food.quantity}
                <span onClick={() => {
                    dispatch(itemPlusPlus({fid: props.food.fid}));
                }}>
                    <FontAwesomeIcon icon={faPlus} />
                </span>
            </div>
        </div>
    </div>
}

export default CartItem;