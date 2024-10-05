import { client } from '../config/database.js'

export const createComment = async (req, res) => {
    const { postId } = req.params
    const { username, comment, commentId } = req.body

    const sql = `
      INSERT INTO Comment (username, postId, comment, commentId)
      VALUES (?, ?, ?, ?)
    `
    const selectSql = `
      SELECT * FROM Comment WHERE commentId = ?
    `

    try {
        await client.execute({
            sql,
            args: [username, postId, comment, commentId],
        })
        const result = await client.execute({
            sql: selectSql,
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

    try {
        await client.execute({
            sql: 'DELETE FROM Comment WHERE commentId = ?',
            args: [commentId],
        })
        res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error })
    }
}