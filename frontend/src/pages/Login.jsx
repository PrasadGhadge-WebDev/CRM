import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { validateLoginForm } from '../utils/authValidation'
import { useToastFeedback } from '../utils/useToastFeedback.js'
import '../styles/auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  useToastFeedback({ error })

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const nextErrors = validateLoginForm({ email, password })
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    const result = await login(email, password)

    if (result.success) {
      toast.success('Logged in successfully')
      navigate(from, { replace: true })
    } else {
      setError(result.message || 'Failed to login')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-shell auth-shell-login">
        <section className="auth-panel auth-panel-brand auth-panel-brand-login">
          <div className="auth-panel-top">
            <button
              type="button"
              className="auth-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="auth-theme-toggle-icon" aria-hidden="true">
                {theme === 'dark' ? 'LM' : 'DM'}
              </span>
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <div className="auth-brand-chip">Workspace Access</div>

            <div className="auth-illustration" aria-hidden="true">
              <div className="auth-illustration-gear" />
              <div className="auth-illustration-window">
                <div className="auth-illustration-screen">
                  <div className="auth-illustration-list">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="auth-illustration-bars">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
              <div className="auth-illustration-card auth-illustration-card-left" />
              <div className="auth-illustration-card auth-illustration-card-right" />
            </div>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-title">Quick and secure access</span>
              <span className="auth-feature-copy">
                Sign in to continue managing leads, customers, and account activity.
              </span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-title">Role-based workflow</span>
              <span className="auth-feature-copy">
                Keep admin actions and day-to-day work separated with controlled access.
              </span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-title">Faster daily flow</span>
              <span className="auth-feature-copy">
                Jump back into deals, notes, tasks, and follow-ups without extra navigation.
              </span>
            </div>
          </div>
        </section>

        <section className="auth-card auth-card-login">
          <div className="auth-header auth-header-login">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in with your existing account.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-form-grid">
              <div className="auth-group">
                <label className="auth-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors((current) => ({ ...current, email: '' }))
                  }}
                  className={`auth-input${fieldErrors.email ? ' auth-input-invalid' : ''}`}
                  placeholder="example@email.com"
                />
                {fieldErrors.email && <small className="auth-field-error">{fieldErrors.email}</small>}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors((current) => ({ ...current, password: '' }))
                  }}
                  className={`auth-input${fieldErrors.password ? ' auth-input-invalid' : ''}`}
                  placeholder="Password"
                />
                {fieldErrors.password && (
                  <small className="auth-field-error">{fieldErrors.password}</small>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
          <div className="auth-footer">
            Need an account?
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
