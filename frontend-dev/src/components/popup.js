import { useRef } from "react";
import "../common.scss";
import useOutsideAlerter from "../hook/useOutsideAlerter";

const Popup = props => {
    let popupEle = useRef(null);
    useOutsideAlerter(popupEle, props.deactivate);

    return props.activated?
    <div ref={popupEle} id={props.id} className={`popup ${props.className||""}`}>
        {props.children}
    </div> : null
}

export default Popup;