import '../common.scss';
import './order.scss'

import { useState } from 'react';

const OrderItem = (props) => {

    const [selected, setSelected] = useState(false);

    return <tr className={`order-item ${selected&&props.order.status===1?"selected":""} ${"_"+props.order.status}`}
            onClick={e => {
                let newSelected = !selected;
                setSelected(newSelected);
                props.itemHandle(props.order, newSelected);
            }}>
            {
                props.order.useraccount?
                    <td className="user-ac">{props.order.useraccount}</td> :null
            }
            <td className="store-name">{props.order.storename}</td>
            <td className="total">${props.order.total}</td>
            <td className="status">{['','not finished','canceled','done'][props.order.status]}</td>
            <td className="start date">{props.order.start}</td>
            <td className="end date">{props.order.end?props.order.end:"-"}</td>
            <td className="detail" onClick={() => {props.viewDetail(props.order.items)}}>view detail</td>
    </tr>
}

export default OrderItem;