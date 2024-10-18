import express from 'express'
import {
    loginUser,
    sendVerificationEmail,
    signupUser,
    verifyCode,
    deleteAccount
} from '../controllers/userController.js'

export const userRoutes = express.Router()

userRoutes.post('/login', loginUser)
userRoutes.post('/signup', signupUser)
userRoutes.post('/verify-email', sendVerificationEmail)
userRoutes.post('/verify-code', verifyCode)
userRoutes.delete('/delete-account', deleteAccount)