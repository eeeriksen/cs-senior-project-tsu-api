 
import bcrypt from 'bcrypt'
import { client } from '../config/database.js'
import { collegeByEmail } from '../consts/collegeByEmail.js'

let emailVerificationStorage = {}

export const sendVerificationEmail = async (req, res) => {
    const { email } = req.body
    const verificationCode = Math.floor(100000 + Math.random() * 900000)

    try {
        const response = await fetch('http://sendmail.eriksend.com/index.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, verificationCode }),
        })

        emailVerificationStorage[email] = verificationCode.toString()

        const data = await response.json()
        res.json({ message: data.message })
    } catch (error) {
        console.error('Error sending email:', error)
        res.status(500).json({ message: 'Error al enviar el correo', error })
    }
}

export const verifyCode = async (req, res) => {
    const { email, code } = req.body
    const storedCode = emailVerificationStorage[email]

    if (!storedCode || storedCode !== code) {
        return res.status(400).json({ success: false, message: 'Invalid verification code' })
    }

    res.status(200).json({ success: true, message: 'Email verified' })
}

export const signupUser = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const domain = email.split('@')[1]

    // if (!Object.keys(collegeByEmail).includes(domain)) {
    //     return res.status(400).json({ message: 'Sign up with a valid academic email' })
    // }

    try {
        const existingUserByUsername = await client.execute({
            sql: 'SELECT * FROM User WHERE username = ?',
            args: [username],
        })

        if (existingUserByUsername.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' })
        }

        const existingUserByEmail = await client.execute({
            sql: 'SELECT hashed_email FROM User',
            args: [],
        })

        const emailExists = existingUserByEmail.rows.some(user => 
            bcrypt.compareSync(email, user.hashed_email)
        )

        if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' })
        }

        const hashedEmail = await bcrypt.hash(email, 10)
        const hashedPassword = await bcrypt.hash(password, 10)

        delete emailVerificationStorage[email]

        const sql = `
          INSERT INTO User (username, hashed_email, password, domain)
          VALUES (?, ?, ?, ?)
        `
        await client.execute({
            sql,
            args: [username, hashedEmail, hashedPassword, domain],
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
            sql: 'SELECT username, password, createdAt, domain FROM User WHERE username = ?',
            args: [username],
        })

        if (result.rows.length > 0) {
            const user = result.rows[0]
            const match = await bcrypt.compare(password, user.password)
            const { username, domain, createdAt } = user

            if (match) {
                res.status(200).json({ message: 'Login successful', user: {username, domain, createdAt} })
            } else {
                res.status(401).json({ message: 'Invalid credentials' })
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' })
        }
    } catch (error) {
        res.status(500).json({ message: 'Error querying database, try again later.', error })
    }
}

export const deleteAccount = async (req, res) => {
    console.log(1)
    const { username } = req.body

    console.log('username:', username)
    if (!username) {
        return res.status(400).json({ message: 'Username is required' })
    }

    try {
        const existingUser = await client.execute({
            sql: 'SELECT username FROM User WHERE username = ?',
            args: [username],
        })

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' })
        }

        await client.execute({
            sql: 'DELETE FROM User WHERE username = ?',
            args: [username],
        })

        res.status(200).json({ message: 'User and associated posts deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        res.status(500).json({ message: 'Failed to delete user' })
    }
}
