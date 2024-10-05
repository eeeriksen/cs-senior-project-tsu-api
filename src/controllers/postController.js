import { client } from '../config/database.js'

export const createPost = async (req, res) => {
    const { postId, username, title, body, college } = req.body

    const sql = `
        INSERT INTO Post (postId, username, title, body, college)
        VALUES (?, ?, ?, ?, ?)
    `
    const selectSql = `
        SELECT * FROM Post WHERE postId = ?
    `

    try {
        await client.execute({
            sql,
            args: [postId, username, title, body, college]
        })
        const result = await client.execute({
            sql: selectSql,
            args: [postId]
        })
        const insertedPost = result.rows[0]

        res.status(200).json({ message: 'Post created successfully', post: insertedPost })
    } catch (error) {
        console.error('Error creating post:', error)
        res.status(500).json({ message: 'Failed to create post', error })
    }
}

export const getPost = async (req, res) => {
    const { postId } = req.params

    const sql = `
        SELECT * FROM Post WHERE postId = ?
    `

    try {
        const result = await client.execute({
            sql,
            args: [postId]
        })
        const posts = result.rows
        res.status(200).json(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ message: 'Failed to fetch posts', error })
    }
}

export const getCollegePosts =  async (req, res) => {
    const { college } = req.params

    const sql = `
        SELECT * FROM Post WHERE college = ? ORDER BY createdAt DESC
    `

    try {
        const result = await client.execute({
            sql,
            args: [college]
        })
        const posts = result.rows

        res.status(200).json(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ message: 'Failed to fetch posts', error })
    }
}

export const getUserPosts = async (req, res) => {
    const { username } = req.params

    try {
        const result = await client.execute({
            sql: 'SELECT * FROM Post WHERE username = ?',
            args: [username],
        })
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error })
    }
}

export const deletePost = async (req, res) => {
    const { postId } = req.params
    try {
        await client.execute({
            sql: 'DELETE FROM Post WHERE postId = ?',
            args: [postId],
        })
        res.status(200).json({ message: 'Post deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error })
    }
}
