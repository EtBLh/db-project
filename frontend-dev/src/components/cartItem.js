import '../common.scss';
import './cart.scss';
import { itemPlusPlus, itemMinusMinus } from "../stores/cart";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';


const CartItem = (props) => {
    const dispatch = useDispatch();

    return <tr className="cart-item">
        <td className="food-img">
            <img src={props.food.thumbnail} alt={props.food.name}/>
        </td>
        <td className="food-name">{props.food.name}</td>
        <td className="food-price">${props.food.price * props.food.quantity}</td>
        <td className="food-quantity">
            <div onClick={() => {
                dispatch(itemMinusMinus({fid: props.food.fid}));
            }}>
                <FontAwesomeIcon icon={faMinus} />
            </div>
            <span>{props.food.quantity}</span>
            <div onClick={() => {
                dispatch(itemPlusPlus({fid: props.food.fid}));
            }}>
                <FontAwesomeIcon icon={faPlus} />
            </div>
        </td>
    </tr>
}

export default CartItem;