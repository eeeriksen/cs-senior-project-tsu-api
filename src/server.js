/* eslint-disable no-undef */
import express from 'express'
import cors from 'cors'
import { postRoutes } from './routes/postRoutes.js'
import { commentRoutes } from './routes/commentRoutes.js'
import { userRoutes } from './routes/userRoutes.js'
import { sendRecommendation } from './controllers/recommendationController.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/post', postRoutes)
app.use('/user', userRoutes)
app.use('/comment', commentRoutes)

app.post('/send-recommendation', sendRecommendation)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
