/* eslint-disable no-undef */
import express from 'express'
import { postRoutes } from './routes/postRoutes.js'
import { commentRoutes } from './routes/commentRoutes.js'
import { userRoutes } from './routes/userRoutes.js'
import { sendRecommendation } from './controllers/recommendationController.js'

const app = express()

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        return res.sendStatus(200)
    }
    next()
})

app.use(express.json())

app.use('/post', postRoutes)
app.use('/user', userRoutes)
app.use('/comment', commentRoutes)

app.post('/send-recommendation', sendRecommendation)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
