import bcrypt from 'bcrypt'
import { client } from '../config/database.js'
import { collegeByEmail } from '../consts/collegeByEmail.js'

export const signupUser = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const domain = email.split('@')[1]

        if (!Object.keys(collegeByEmail).includes(domain)) {
            return res.status(400).json({ message: 'Sign up with a valid academic email' })
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
}

export const loginUser = async (req, res) => {
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
}