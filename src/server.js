/* eslint-disable no-undef */
import express from 'express'
import { postRoutes } from './routes/postRoutes.js'
import { commentRoutes } from './routes/commentRoutes.js'
import { userRoutes } from './routes/userRoutes.js'
import { sendRecommendation } from './controllers/recommendationController.js'

const originUrl = process.env.FRONTEND_URL
const app = express()

console.log({originUrl})
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', originUrl)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.sendStatus(200)
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
