import { client } from '../config/database.js'

export const createComment = async (req, res) => {
    const { postId } = req.params
    const { username, comment, commentId } = req.body

    const insertCommentSql = `
      INSERT INTO Comment (username, postId, comment, commentId)
      VALUES (?, ?, ?, ?)
    `

    const selectCommentSql = `
      SELECT * FROM Comment WHERE commentId = ?
    `

    const updateCommentCountSql = `
      UPDATE Post
      SET commentCount = commentCount + 1
      WHERE postId = ?
    `

    try {
        await client.execute({
            sql: insertCommentSql,
            args: [username, postId, comment, commentId],
        })
        await client.execute({
            sql: updateCommentCountSql,
            args: [postId],
        })
        const result = await client.execute({
            sql: selectCommentSql,
            args: [commentId],
        })
        const insertedComment = result.rows[0] 

        res.status(201).json({
            message: 'Comment added successfully',
            comment: insertedComment,
        })
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error })
    }
}

export const getComments = async (req, res) => {
    const { postId } = req.params

    try {
        const result = await client.execute({
            sql: 'SELECT commentId, username, comment, createdAt FROM Comment WHERE postId = ?',
            args: [postId],
        })

        res.status(200).json(result.rows.length > 0 ? result.rows : [])
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments', error })
    }
}

export const deleteComment = async (req, res) => {
    const { commentId } = req.params

    const selectPostIdSql = `
        SELECT postId FROM Comment WHERE commentId = ?
    `

    const deleteCommentSql = `
        DELETE FROM Comment WHERE commentId = ?
    `
    const updateCommentCountSql = `
        UPDATE Post
        SET commentCount = commentCount - 1
        WHERE postId = ?
    `

    try {
        const result = await client.execute({
            sql: selectPostIdSql,
            args: [commentId],
        })
        const postId = result.rows[0]?.postId

        if (!postId) {
            return res.status(404).json({ message: 'Comment not found' })
        }

        await client.execute({
            sql: deleteCommentSql,
            args: [commentId],
        })

        await client.execute({
            sql: updateCommentCountSql,
            args: [postId],
        })
        res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error })
    }
}