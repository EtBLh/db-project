import Signup from './pages/signup'
import Index from './pages/index'
import Home from './pages/home'
import MyShop from './pages/myShop'
import Shop from './pages/shop'
import Header from './components/header'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './stores/store'

const App = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Header/>
                <div className="header-gap"/>
                <Routes>
                    <Route path="/signup" element={<Signup/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/myshop" element={<MyShop/>}/>
                    <Route path="/" element={<Index/>} />
                    <Route path="/shop/:storeid" element={<Shop/>}/>
                </Routes>
            </BrowserRouter>
        </Provider>
      
    );
}

export default App;