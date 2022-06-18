import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './stores/store'
import Home from './pages/home'
import Shop from './pages/shop'
import Orders from './pages/orders'
import MyShop from './pages/myShop'
import MyShopOrders from './pages/myShopOrders'
import Transactions from './pages/transactions'
import Header from './components/header'
import Alert from './components/alert'

const App = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Header/>
                <Alert/>
                <Routes>
                    <Route path="/" element={<Home/>} />
                    <Route path="/signup" element={<Home/>}/>
                    <Route path="/login" element={<Home/>}/>
                    <Route path="/userdata" element={<Home/>}/>
                    <Route path="/myshop" element={<MyShop/>}/>
                    <Route path="/myshoporders" element={<MyShopOrders/>}/>
                    <Route path="/orders" element={<Orders/>}/>
                    <Route path="/transactions" element={<Transactions/>}/>
                    <Route path="/shop/:storeid" element={<Shop/>}/>
                </Routes>
            </BrowserRouter>
        </Provider>
      
    );
}

export default App;