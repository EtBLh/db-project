import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuth from '../hook/useAuth';
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import asyncJsonFetch from "../func/asyncJsonFetch";

import '../common.scss';
import './transactions.scss';

const Transactions = () => {
    const navigate = useNavigate();
    const [,, checkAuth, auth] = useAuth();
    const [typeFilter, setTypeFilter] = useState("");
    const [recordList, setRecordList] = useState([]);

    useEffect(() => {
        checkAuth().then(res => {
            if (!res) navigate('/');
            else getRecords();
        })
    }, [auth.login]);

    const getRecords = () => {
        asyncJsonFetch("https://ubereat.nycu.me/api/get_transaction_records.php",{
            uid: auth.uid, token: auth.token, filter: {type: typeFilter}
        }).then(body => {
            setRecordList(body.records);
        });
    }

    useEffect(getRecords, [typeFilter]);

    return <div className="container">
        <div className="filter">
            <FontAwesomeIcon icon={faFilter} /> type filter &nbsp;
            <select onChange={e => setTypeFilter(e.target.value)}>
                <option value={""}>all</option>
                <option value={"recharge"}>recharge</option>
                <option value={"income"}>income</option>
                <option value={"outcome"}>outcome</option>
            </select>
        </div>
        <table className="record-list" cellPadding={0} cellSpacing={0}><tbody>
            <tr>
                <th>action</th>
                <th>trader name</th>
                <th>time</th>
                <th>amount</th>
            </tr>
            {
                recordList?.map((record, idx) => {
                    return <tr className={`record ${record.action}`} key={idx}>
                        <td>{record.action}</td>
                        <td>{record.trader}</td>
                        <td>{record.time}</td>
                        <td>${record.amount}</td>
                    </tr>
                })
            }
        </tbody></table>
    </div>
}

export default Transactions;