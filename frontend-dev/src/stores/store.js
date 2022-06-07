import { configureStore } from '@reduxjs/toolkit'
import userData from './userData'

export default configureStore({
    reducer: {userData},
})