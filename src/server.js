/* eslint-disable no-undef */
import express from 'express'
import cors from 'cors'
import { postRoutes } from './routes/postRoutes.js'
import { commentRoutes } from './routes/commentRoutes.js'
import { userRoutes } from './routes/userRoutes.js'
import { sendRecommendation } from './controllers/recommendationController.js'

const originUrl = process.env.FRONTEND_URL
const app = express()

const corsOptions = {
    origin: originUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}

console.log({originUrl})
app.use(cors(corsOptions))
app.use(express.json())

app.use('/post', postRoutes)
app.use('/user', userRoutes)
app.use('/comment', commentRoutes)

app.post('/send-recommendation', sendRecommendation)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
