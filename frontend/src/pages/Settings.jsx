import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/auth'
import { useTheme } from '../context/ThemeContext'
import { companiesApi } from '../services/companies'
import PageHeader from '../components/PageHeader.jsx'
import { useToastFeedback } from '../utils/useToastFeedback.js'

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/

export default function Settings() {
  const { user, refreshUser, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyDigest: false,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [orgSettings, setOrgSettings] = useState({
    company_name: '',
    email: '',
    currency: 'USD',
    timezone: 'UTC',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
  })

  const [loading, setLoading] = useState(true)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingOrg, setSavingOrg] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useToastFeedback({ error, success: message })

  // ✅ FIXED ADMIN CHECK (robust)
  const adminRoles = ['Admin', 'SuperAdmin']
  const isAdmin =
    adminRoles.includes(user?.role) ||
    user?.isAdmin === true ||
    user?.isSuperAdmin === true

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const nextUser = await refreshUser()
        if (cancelled) return

        // Preferences load
        setPreferences({
          emailNotifications: nextUser?.settings?.emailNotifications ?? true,
          weeklyDigest: nextUser?.settings?.weeklyDigest ?? false,
        })

        // Org settings load (only admin)
        if (isAdmin && nextUser?.company_id) {
          const companyId = nextUser.company_id?.id || nextUser.company_id
          const company = await companiesApi.get(companyId)

          if (cancelled) return

          setOrgSettings({
            company_name: company.company_name || '',
            email: company.email || '',
            currency: company.settings?.currency || 'USD',
            timezone: company.settings?.timezone || 'UTC',
            smtp_host: company.settings?.smtp?.host || '',
            smtp_port: company.settings?.smtp?.port || '',
            smtp_user: company.settings?.smtp?.user || '',
            smtp_password: company.settings?.smtp?.password || '',
          })
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [refreshUser, isAdmin]) // ✅ FIXED dependency

  // =========================
  // Preferences Submit
  // =========================
  async function handlePreferencesSubmit(e) {
    e.preventDefault()
    setSavingPrefs(true)
    setMessage('')
    setError('')

    try {
      const res = await authApi.updateSettings(preferences)
      updateUser(res.user)
      setMessage(res.message || 'Settings updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setSavingPrefs(false)
    }
  }

  // =========================
  // Password Submit
  // =========================
  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Fill in all password fields')
      return
    }

    if (!PASSWORD_RULE.test(passwordForm.newPassword)) {
      setError('New password must be at least 6 characters and include letters and numbers')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('New password must be different from current password')
      return
    }

    setSavingPassword(true)

    try {
      const res = await authApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      setMessage(res.message || 'Password updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  // =========================
  // Org Submit (Admin only)
  // =========================
  async function handleOrgSubmit(e) {
    e.preventDefault()

    if (!isAdmin) {
      setError('Access denied')
      return
    }

    setSavingOrg(true)
    setMessage('')
    setError('')

    try {
      const payload = {
        company_name: orgSettings.company_name,
        email: orgSettings.email,
        settings: {
          currency: orgSettings.currency,
          timezone: orgSettings.timezone,
          smtp: {
            host: orgSettings.smtp_host,
            port: orgSettings.smtp_port,
            user: orgSettings.smtp_user,
            password: orgSettings.smtp_password,
          },
        },
      }

      const companyId = user.company_id?.id || user.company_id

      await companiesApi.update(companyId, payload)

      setMessage('Organization settings updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update organization settings')
    } finally {
      setSavingOrg(false)
    }
  }

  // =========================
  // UI
  // =========================
  if (loading) return <div className="muted">Loading settings...</div>

  return (
    <div className="accountPage stack">
      <PageHeader
        title="Settings"
        description="Control your account preferences and security options."
        backTo="/"
      />

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert">{message}</div>}

      <div className="accountGrid">

        {/* Preferences */}
        <form className="card stack" onSubmit={handlePreferencesSubmit}>
          <div className="row">
            <h2>Preferences</h2>
            <button className="btn primary" disabled={savingPrefs}>
              {savingPrefs ? 'Saving...' : 'Save'}
            </button>
          </div>

          <label>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) =>
                setPreferences((p) => ({ ...p, emailNotifications: e.target.checked }))
              }
            />
            Email Notifications
          </label>

          <label>
            <input
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={(e) =>
                setPreferences((p) => ({ ...p, weeklyDigest: e.target.checked }))
              }
            />
            Weekly Digest
          </label>
        </form>

        {/* Password */}
        <form className="card stack" onSubmit={handlePasswordSubmit}>
          <h2>Change Password</h2>
          <p className="muted">
            Use a strong password with at least 6 characters, including letters and numbers.
          </p>

          <input
            type="password"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
            }
          />

          <input
            type="password"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
            }
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
            }
          />

          <button className="btn primary" type="submit" disabled={savingPassword}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* Theme */}
        <div className="card">
          <h2>Theme</h2>
          <button onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Organization (Admin only) */}
        {isAdmin && (
          <form className="card stack" onSubmit={handleOrgSubmit}>
            <h2>Organization Settings</h2>

            <input
              placeholder="Company Name"
              value={orgSettings.company_name}
              onChange={(e) =>
                setOrgSettings((p) => ({ ...p, company_name: e.target.value }))
              }
            />

            <input
              placeholder="Email"
              value={orgSettings.email}
              onChange={(e) =>
                setOrgSettings((p) => ({ ...p, email: e.target.value }))
              }
            />

            <button className="btn primary">
              {savingOrg ? 'Saving...' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
