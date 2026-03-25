import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { validateRegisterForm } from '../utils/authValidation'
import { useToastFeedback } from '../utils/useToastFeedback.js'
import '../styles/auth.css'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldError, setFieldError] = useState({})
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  useToastFeedback({ error, success })

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value

    setFormData((current) => ({ ...current, [name]: nextValue }))
    setFieldError((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const errors = validateRegisterForm(formData)
    setFieldError(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setLoading(true)
    const result = await register(formData)

    if (result.success) {
      const successMessage =
        result.message || 'Registration submitted. Wait for admin approval before logging in.'
      setSuccess(successMessage)
      toast.success(successMessage)
      setFormData({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
      })
      setTimeout(() => navigate('/login'), 1500)
    } else {
      setError(result.message || 'Failed to register')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-shell auth-shell-register">
        <section className="auth-panel auth-panel-brand">
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
              <span className="auth-feature-title">Quick and free sign-up</span>
              <span className="auth-feature-copy">
                Enter your account details to create a secure CRM workspace for your team.
              </span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-title">Automate your work</span>
              <span className="auth-feature-copy">
                Manage onboarding, sales activity, and user permissions from one streamlined flow.
              </span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-title">Something for everyone</span>
              <span className="auth-feature-copy">
                Keep admins, managers, accountants, and employees on the same platform.
              </span>
            </div>
          </div>
        </section>

        <section className="auth-card auth-card-register">
          <div className="auth-header auth-header-register">
            <h2 className="auth-title">Create account</h2>
            <p className="auth-subtitle">Join us by creating your account.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="alert">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-form-grid">
              <div className="auth-group">
                <label className="auth-label" htmlFor="register-username">
                  Username
                </label>
                <input
                  id="register-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`auth-input${fieldError.username ? ' auth-input-invalid' : ''}`}
                  placeholder="jane.doe"
                />
                {fieldError.username && (
                  <small className="auth-field-error">{fieldError.username}</small>
                )}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="register-full-name">
                  Full Name
                </label>
                <input
                  id="register-full-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`auth-input${fieldError.fullName ? ' auth-input-invalid' : ''}`}
                  placeholder="John Chris"
                />
                {fieldError.fullName && (
                  <small className="auth-field-error">{fieldError.fullName}</small>
                )}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="register-email">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`auth-input${fieldError.email ? ' auth-input-invalid' : ''}`}
                  placeholder="example@email.com"
                />
                {fieldError.email && (
                  <small className="auth-field-error">{fieldError.email}</small>
                )}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="register-phone">
                  Phone Number
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`auth-input${fieldError.phone ? ' auth-input-invalid' : ''}`}
                  placeholder="9876543210"
                  inputMode="numeric"
                  maxLength={10}
                />
                {fieldError.phone && (
                  <small className="auth-field-error">{fieldError.phone}</small>
                )}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`auth-input${fieldError.password ? ' auth-input-invalid' : ''}`}
                  placeholder="Password"
                />
                {fieldError.password && (
                  <small className="auth-field-error">{fieldError.password}</small>
                )}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`auth-input${fieldError.confirmPassword ? ' auth-input-invalid' : ''}`}
                  placeholder="Confirm password"
                />
                {fieldError.confirmPassword && (
                  <small className="auth-field-error">{fieldError.confirmPassword}</small>
                )}
              </div>

              <div className="auth-group">
                <label className="auth-label" htmlFor="register-role">
                  Role
                </label>
                <select
                  id="register-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`auth-input${fieldError.role ? ' auth-input-invalid' : ''}`}
                >
                  <option value="">Select Role</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Employee">Employee</option>
                </select>
                {fieldError.role && <small className="auth-field-error">{fieldError.role}</small>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login" className="auth-link">
              Log in
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
