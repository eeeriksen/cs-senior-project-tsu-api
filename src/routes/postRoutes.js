import express from 'express'
import {
    createPost,
    deletePost,
    getCollegePosts,
    getPost,
    getUserPosts
} from '../controllers/postController.js'

export const postRoutes = express.Router()

postRoutes.get('/:postId', getPost)
postRoutes.get('/college/:college', getCollegePosts)
postRoutes.get('/user/:username', getUserPosts)
postRoutes.post('/create-post', createPost)
postRoutes.delete('/:postId', deletePost)
