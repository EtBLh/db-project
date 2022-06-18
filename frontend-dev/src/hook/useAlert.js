import React from "react";
import { useDispatch } from "react-redux";
import { show as _show, hide as _hide } from "../stores/alert";

function useAlert() {
    let dispatch = useDispatch();
    const hide = () => dispatch(_hide());
    const show = (message, type="", duration=3000) => {
        dispatch(_show({message: message, type: type}));
        setTimeout(hide, duration);
    };
    return [show, hide];
}

export default useAlert;