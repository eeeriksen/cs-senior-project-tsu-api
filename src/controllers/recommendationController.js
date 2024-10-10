
/* eslint-disable no-undef */
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export const sendRecommendation = async (req, res) => {
    const { username, email, message } = req.body

    if (!username || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    try {
        const result = await resend.emails.send({
            from: 'onboarding@resend.dev',  // sender's email
            to: 'eriksen.lezama@gmail.com', // the email where the form data should be sent
            subject: `Campus Voices - New Recommendation from ${username}`,
            html: `<p><strong>username:</strong> ${username}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Message:</strong> ${message}</p>`,
        })

        res.status(200).json({ message: 'Recommendation sent successfully', result: result })
    } catch (error) {
        console.error('Error sending email:', error)
        res.status(500).json({ message: 'Failed to send recommendation', error })
    }
}