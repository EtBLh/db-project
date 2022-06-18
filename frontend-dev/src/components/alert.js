import '../common.scss';
import { useSelector } from "react-redux";
import { selectAlert } from '../stores/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBolt, faExclamation } from '@fortawesome/free-solid-svg-icons';

const Alert = () => {
    const alert = useSelector(selectAlert);

    return <div className={`alert ${alert.activated?"show":"hide"} ${alert.type}`}>
        <div className="icon">
            {alert.type==="danger"?<FontAwesomeIcon icon={faBolt}/>:null}
            {alert.type==="secondary"?<FontAwesomeIcon icon={faExclamation}/>:null}
            {alert.type==="warn"?<FontAwesomeIcon icon={faExclamation}/>:null}
            {alert.type===""?<FontAwesomeIcon icon={faBell}/>:null}
        </div>
        {alert.message}
    </div>
}

export default Alert;