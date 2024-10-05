import express from 'express'
import {
    createComment,
    deleteComment,
    getComments,
} from '../controllers/commentController.js'

export const commentRoutes = express.Router()

commentRoutes.get('/:postId', getComments)
commentRoutes.post('/:postId', createComment)
commentRoutes.delete('/:commentId', deleteComment)