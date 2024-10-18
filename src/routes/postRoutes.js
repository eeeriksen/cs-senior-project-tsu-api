import express from 'express'
import {
    createPost,
    deletePost,
    getDomainPosts,
    getPost,
    getUserPosts
} from '../controllers/postController.js'

export const postRoutes = express.Router()

postRoutes.get('/:postId', getPost)
postRoutes.get('/domain/:domain', getDomainPosts)
postRoutes.get('/user/:username', getUserPosts)
postRoutes.post('/create-post', createPost)
postRoutes.delete('/:postId', deletePost)
