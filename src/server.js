/* eslint-disable no-undef */
import express from 'express'
import { createClient } from '@libsql/client'
import cors from 'cors'
import bcrypt from 'bcrypt'

const app = express()

app.use(cors())
app.use(express.json())

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
})

app.get('/posts/:college', async (req, res) => {
    const { college } = req.params
    console.log(college)
    const sql = `
        SELECT * FROM Post WHERE college = ? ORDER BY createdAt DESC
    `

    try {
        const result = await client.execute({
            sql,
            args: [college]
        })
        const posts = result.rows
        console.log(posts)
        res.status(200).json(posts)
    } catch (error) {
        console.error('Error fetching posts:', error)
        res.status(500).json({ message: 'Failed to fetch posts', error })
    }
})

app.get('/post/:postId', async (req, res) => {
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
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const result = await client.execute({
            sql: 'SELECT email, username, password FROM User WHERE username = ?',
            args: [username],
        })

        if (result.rows.length > 0) {
            const user = result.rows[0]
            const match = await bcrypt.compare(password, user.password)

            if (match) {
                res.status(200).json({ message: 'Login successful', user: result.rows[0] })
            } else {
                res.status(401).json({ message: 'Invalid credentials' })
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Error querying database', error })
    }
})

app.post('/create-post', async (req, res) => {
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
        console.log(result)
        res.status(200).json({ message: 'Post created successfully', post: insertedPost })
    } catch (error) {
        console.error('Error creating post:', error)
        res.status(500).json({ message: 'Failed to create post', error })
    }
})

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    try {
        const existingUser = await client.execute({
            sql: 'SELECT * FROM User WHERE username = ? OR email = ?',
            args: [username, email],
        })

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const sql = `
          INSERT INTO User (username, email, password)
          VALUES (?, ?, ?)
        `
        await client.execute({
            sql,
            args: [username, email, hashedPassword],
        })

        res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
        console.error('Error registering user:', error)
        res.status(500).json({ message: 'Failed to register user' })
    }
})

app.get('/user/:username/posts', async (req, res) => {
    const { username } = req.params
    console.log(username)
    try {
        const result = await client.execute({
            sql: 'SELECT * FROM Post WHERE username = ?',
            args: [username],
        })
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error })
    }
})

app.delete('/posts/:postId', async (req, res) => {
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
})

app.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params

    try {
        const result = await client.execute({
            sql: 'SELECT commentId, username, comment, createdAt FROM Comment WHERE postId = ?',
            args: [postId],
        })

        console.log(result)

        res.status(200).json(result.rows.length > 0 ? result.rows : [])
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments', error })
    }
})


app.post('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params
    const { username, comment, commentId } = req.body

    const sql = `
      INSERT INTO Comment (username, postId, comment, commentId)
      VALUES (?, ?, ?, ?)
    `
    try {
        const result = await client.execute({
            sql,
            args: [username, postId, comment, commentId],
        })
        console.log(result)
        res.status(201).json({ message: 'Comment added successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment', error })
    }
})

app.delete('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params
    console.log({commentId})

    try {
        await client.execute({
            sql: 'DELETE FROM Comment WHERE commentId = ?',
            args: [commentId],
        })
        res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete comment', error })
    }
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
