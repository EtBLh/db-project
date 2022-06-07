import { Link } from "react-router-dom";

import "./shopCard.scss"
import '../common.scss';

const ShopCard = (prop) => {

    return <Link to={"/shop/"+prop.shop.sid}>
        <div className="shop-card">
            <span className="shop-name">{prop.shop.name}</span>
            <span className="shop-class">{prop.shop.class}</span>
            <span className="shop-position">
                distance: {
                    Math.sqrt(Math.pow(prop.shop.longtitude-prop.user.long,2)+
                        Math.pow(prop.shop.latitude-prop.user.lat,2)).toFixed(3)
                }
            </span>
        </div>
    </Link>
}

export default ShopCard;