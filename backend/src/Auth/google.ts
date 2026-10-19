// src/auth/google.ts
import { Hono } from 'hono'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { getDbPool } from '../db/config.js'
import { sendWelcomeEmail } from '../utils/nodemailer.js'

const auth = new Hono()
const sign = jwt.sign

// Helper: Generate JWT
const generateToken = (user: any): string => {
  return sign(
    { user_id: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
}

// Route 1: Start Google Login (redirects to Google)
auth.get('/google', async (c) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
  const state = Buffer.from(JSON.stringify({ redirect: `${frontendUrl}/auth/success` })).toString('base64')

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`)}&` +
    `scope=profile%20email&` +
    `response_type=code&` +
    `state=${state}&` +
    `access_type=offline`

  return c.redirect(authUrl)
})

// Route 2: Google Callback (handles code → token → user)
auth.get('/google/callback', async (c) => {
  const { code, state, error } = c.req.query()

  if (error || !code) {
    return c.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=google_failed`)
  }

  try {
    // Decode state (for security + redirect info)
    const stateData = JSON.parse(Buffer.from(state!, 'base64').toString())
    const redirectUrl = stateData.redirect

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const { access_token, id_token } = tokenResponse.data

    // Get user profile from Google
    const profileResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )

    const profile = profileResponse.data
    const email = profile.email
    const [first_name, ...rest] = profile.name.split(' ')
    const last_name = rest.join(' ') || ''

    // Check/create user in DB
    const pool = await getDbPool()
    const existing = await pool.request()
      .input('email', email)
      .query('SELECT * FROM Users2 WHERE email = @email')

    let user
    let isNew = false

    if (existing.recordset.length > 0) {
      user = existing.recordset[0]
    } else {
      const result = await pool.request()
        .input('first_name', first_name)
        .input('last_name', last_name)
        .input('email', email)
        .input('google_id', profile.id)
        .input('role', 'user')
        .input('contact', profile.phoneNumber || '')  // Google usually doesn't send phone
        .input('profile_picture', profile.picture || '')     // Save profile photo
        .query(`
    INSERT INTO Users
      (first_name, last_name, email, password, google_id, role, contact, profile_picture, created_at)
    OUTPUT INSERTED.*
    VALUES 
      (@first_name, @last_name, @email, '', @google_id, @role, @contact, @profile_picture, GETDATE())
  `)
      user = result.recordset[0]
      isNew = true
    }

    // Send welcome email if new
    if (isNew) {
  try {
    await sendWelcomeEmail(email, first_name)
    console.log(`Welcome email sent to ${email}`)
  } catch (err: any) {
    console.warn(`Welcome email failed (normal in dev): ${err.message}`)
    // Don't crash the login just because email failed
  }
}

    // Generate JWT
    const token = generateToken(user)

    // Redirect to frontend with token & user
    const userData = encodeURIComponent(JSON.stringify({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
    }))

    return c.redirect(`${redirectUrl}?token=${token}&user=${userData}`)
  } catch (err: any) {
    console.error('❌ Google OAuth error:', err.response?.data || err.message)
    return c.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}/login?error=oauth_error`)
  }
})

export default auth