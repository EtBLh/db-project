import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { faXmark, faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import asyncJsonFetch from "../func/asyncJsonFetch";

import '../common.scss';
import '../components/order.scss';
import OrderItem from "../components/orderItem";
import useAuth from '../hook/useAuth';
import useAlert from "../hook/useAlert";

const Orders = () => {
    const navigate = useNavigate();
    const [, , checkAuth, auth] = useAuth();
    const [show, ] = useAlert();
    const [statusFilter, setStatusFilter] = useState(0);
    const [orderList, setOrderList] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [viewingDetail, setViewingDetail] = useState({
        activated: false,
        foodDetail: []
    });

    useEffect(() => {
        checkAuth().then(res => {
            if (!res) navigate('/');
            else getOrderList();
        })
    }, [auth.login]);

    useEffect(() => {
        getOrderList();
    }, [statusFilter]);

    const getOrderList = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_user_order.php",{
            uid: auth.uid, token: auth.token, filter: {type: statusFilter}
        }).then(body => {
            setOrderList(body.orders);
            console.log("orders",body);
        });
    }

    const cancelOrders = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/update_orders_status.php",{
            uid: auth.uid, token: auth.token, orders: selectedOrder.map(ord => ord.oid), action: 0
        }).then(body => {
            if (body.status === 0){
                setSelectedOrder([]);
                show("cancel success!");
            } else show("cancel failed :(","danger");
            getOrderList();
        });
    }

    const itemHandle = (order, _in) => {
        if (_in){
            for (let _order of selectedOrder){
                if (_order.oid === order.oid) return;
            }
            setSelectedOrder([
                ...selectedOrder,
                order
            ]);
        } else {
            let clone = [...selectedOrder];
            clone.forEach((_order, idx) => {
                if (_order.oid === order.oid) {
                    clone.splice(idx,1);
                }
            });
            setSelectedOrder(clone);
        }
    }

    const viewDetail = (detail) => {
        setViewingDetail({
            activated: true,
            foodDetail: detail
        });
    }

    return <div className="container">
            <div className="filter">
                <FontAwesomeIcon icon={faFilter} /> status filter &nbsp;
                <select onChange={e => setStatusFilter(e.target.value)}>
                    <option value={0}>all</option>
                    <option value={1}>not finished</option>
                    <option value={2}>cancel</option>
                    <option value={3}>done</option>
                </select>
            </div>
            {
                viewingDetail.activated?
                <div className="modal">
                    <div className="close" onClick={()=>setViewingDetail({activated: false, foodDetail: []})}>
                        <FontAwesomeIcon icon={faXmark}/>
                    </div>
                    <table cellSpacing="0" cellPadding="0"><tbody>
                    <tr>
                        <th>image</th>
                        <th>name</th>
                        <th>quantity</th>
                        <th>unit price</th>
                    </tr>
                    {
                        viewingDetail.foodDetail?.map((food, idx) => 
                            <tr className="data" key={idx}>
                                <td className="img"><img src={food.thumbnail} alt={food.name}/></td>
                                <td>{food.name}</td>
                                <td>{food.quantity}</td>
                                <td>${food.unit_price}</td>
                            </tr>
                        )
                    }
                    </tbody></table>
                </div>: null
            }
        <table className="order-list" cellSpacing="0" cellPadding="0"><tbody>
            <tr>
                <th className="store-name">store name</th>
                <th className="total">total</th>
                <th className="status">status</th>
                <th className="start date">start</th>
                <th className="end date">end</th>
                <th/>
            </tr>
                {
                    orderList?.map((order, idx) => {
                        return <OrderItem key={idx} order={order} itemHandle={itemHandle} viewDetail={viewDetail}/>
                    })
                }
        </tbody></table>
        <div className="action">
            <button className="update" onClick={cancelOrders}>cancel orders</button>
        </div>
    </div>
}

export default Orders;