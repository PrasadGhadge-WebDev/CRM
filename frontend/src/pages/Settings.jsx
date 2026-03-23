import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/auth'
import { useTheme } from '../context/ThemeContext'
import { companiesApi } from '../services/companies'
import PageHeader from '../components/PageHeader.jsx'

export default function Settings() {
  const { user, refreshUser, updateUser } = useAuth()
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyDigest: false,
  })
  const { theme, toggleTheme } = useTheme()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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
  const [savingOrg, setSavingOrg] = useState(false)
  const isAdmin = user?.role === 'Admin'

  useEffect(() => {
    let cancelled = false

    refreshUser()
      .then((nextUser) => {
        if (cancelled) return
        setPreferences({
          emailNotifications: nextUser?.settings?.emailNotifications ?? true,
          weeklyDigest: nextUser?.settings?.weeklyDigest ?? false,
        })

        if (isAdmin && nextUser?.company_id) {
          companiesApi.get(nextUser.company_id.id || nextUser.company_id).then((company) => {
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
          })
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load settings')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [refreshUser])

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

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password must match')
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

  async function handleOrgSubmit(e) {
    e.preventDefault()
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
      const companyId = user.company_id.id || user.company_id
      await companiesApi.update(companyId, payload)
      setMessage('Organization settings updated successfully')
    } catch (err) {
      setError(err.message || 'Failed to update organization settings')
    } finally {
      setSavingOrg(false)
    }
  }

  if (loading) {
    return <div className="muted">Loading settings...</div>
  }

  return (
    <div className="accountPage stack">
      <PageHeader
        title="Settings"
        description="Control your account preferences and security options."
        backTo="/"
        actions={
          <div className="accountBadge">
          <div className="avatar accountAvatar">
            {user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className="accountBadgeTitle">{user?.username || 'Admin'}</div>
            <div className="muted">{user?.email || '-'}</div>
          </div>
          </div>
        }
      />

      {error ? <div className="alert error">{error}</div> : null}
      {message ? <div className="alert">{message}</div> : null}

      <div className="accountGrid">
        <form className="card stack" onSubmit={handlePreferencesSubmit}>
          <div className="row">
            <h2>Preferences</h2>
            <button className="btn primary" type="submit" disabled={savingPrefs}>
              {savingPrefs ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <label className="settingRow">
            <div>
              <div className="settingTitle">Email notifications</div>
              <div className="muted">Receive account and CRM activity updates by email.</div>
            </div>
            <input
              className="settingCheckbox"
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, emailNotifications: e.target.checked }))
              }
            />
          </label>

          <label className="settingRow">
            <div>
              <div className="settingTitle">Weekly digest</div>
              <div className="muted">Get a weekly summary of customer and lead activity.</div>
            </div>
            <input
              className="settingCheckbox"
              type="checkbox"
              checked={preferences.weeklyDigest}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, weeklyDigest: e.target.checked }))
              }
            />
          </label>
        </form>

        <form className="card stack" onSubmit={handlePasswordSubmit}>
          <div className="row">
            <h2>Security</h2>
            <button className="btn primary" type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
          <div className="accountFormGrid">
            <label className="accountField">
              <span>Current Password</span>
              <input
                className="input"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
              />
            </label>
            <label className="accountField">
              <span>New Password</span>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              />
            </label>
            <label className="accountField">
              <span>Confirm New Password</span>
              <input
                className="input"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              />
            </label>
          </div>
        </form>

        <div className="card stack">
          <h2>Appearance</h2>
          <div className="settingRow">
            <div>
              <div className="settingTitle">Theme Mode</div>
              <div className="muted">Switch between light and dark visual themes.</div>
            </div>
            <button className="btn" onClick={toggleTheme}>
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>

        {isAdmin && (
          <form className="card stack" onSubmit={handleOrgSubmit} style={{ gridColumn: 'span 2' }}>
            <div className="row">
              <h2>Organization Settings</h2>
              <button className="btn primary" type="submit" disabled={savingOrg}>
                {savingOrg ? 'Saving...' : 'Save System Settings'}
              </button>
            </div>
            <div className="grid2">
              <label className="accountField">
                <span>Company Name</span>
                <input
                  className="input"
                  value={orgSettings.company_name}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, company_name: e.target.value }))}
                />
              </label>
              <label className="accountField">
                <span>System Email</span>
                <input
                  className="input"
                  type="email"
                  value={orgSettings.email}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, email: e.target.value }))}
                />
              </label>
              <label className="accountField">
                <span>Currency</span>
                <select
                  className="input"
                  value={orgSettings.currency}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, currency: e.target.value }))}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </label>
              <label className="accountField">
                <span>Timezone</span>
                <select
                  className="input"
                  value={orgSettings.timezone}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, timezone: e.target.value }))}
                >
                  <option value="UTC">UTC</option>
                  <option value="GMT">GMT</option>
                  <option value="IST">IST</option>
                </select>
              </label>
            </div>
            <h3 style={{ marginTop: 24 }}>Email (SMTP) Configuration</h3>
            <div className="grid2">
              <label className="accountField">
                <span>SMTP Host</span>
                <input
                  className="input"
                  value={orgSettings.smtp_host}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, smtp_host: e.target.value }))}
                  placeholder="smtp.example.com"
                />
              </label>
              <label className="accountField">
                <span>SMTP Port</span>
                <input
                  className="input"
                  value={orgSettings.smtp_port}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, smtp_port: e.target.value }))}
                  placeholder="587"
                />
              </label>
              <label className="accountField">
                <span>SMTP User</span>
                <input
                  className="input"
                  value={orgSettings.smtp_user}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, smtp_user: e.target.value }))}
                />
              </label>
              <label className="accountField">
                <span>SMTP Password</span>
                <input
                  className="input"
                  type="password"
                  value={orgSettings.smtp_password}
                  onChange={(e) => setOrgSettings((p) => ({ ...p, smtp_password: e.target.value }))}
                />
              </label>
            </div>
          </form>
        )}


      </div>
    </div>
  )
}
