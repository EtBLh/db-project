import { Link } from "react-router-dom";

import "./shopCard.scss"
import '../common.scss';

const ShopCard = (prop) => {

    return <Link to={"/shop/"+prop.shop.sid}>
        <div className="shop-card">
            <span className="shop-name">{prop.shop.name}</span>
            <span className="shop-class">{prop.shop.class}</span>
        </div>
    </Link>
}

export default ShopCard;