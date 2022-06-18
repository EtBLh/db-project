import { configureStore } from '@reduxjs/toolkit'
import userData from './userData'
import filter from './filter'
import cart from './cart'
import alert from './alert'

export default configureStore({
    reducer: {userData, filter, cart, alert},
})