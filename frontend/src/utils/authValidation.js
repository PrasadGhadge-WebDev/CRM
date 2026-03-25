const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[6-9]\d{9}$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/

function normalizeText(value) {
  return String(value ?? '').trim()
}

export function validateLoginForm(values) {
  const errors = {}
  const email = normalizeText(values.email).toLowerCase()
  const password = String(values.password ?? '')

  if (!email) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}

export function validateRegisterForm(values) {
  const errors = {}
  const username = normalizeText(values.username)
  const fullName = normalizeText(values.fullName)
  const email = normalizeText(values.email).toLowerCase()
  const phone = normalizeText(values.phone)
  const password = String(values.password ?? '')
  const confirmPassword = String(values.confirmPassword ?? '')
  const role = normalizeText(values.role)

  if (!username) {
    errors.username = 'Username is required'
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
  }

  if (!fullName) {
    errors.fullName = 'Full name is required'
  } else if (fullName.length < 3) {
    errors.fullName = 'Full name must be at least 3 characters'
  }

  if (!email) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!phone) {
    errors.phone = 'Phone is required'
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = 'Enter a valid 10-digit mobile number'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.password = 'Use at least 6 characters with letters and numbers'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (!role) {
    errors.role = 'Role is required'
  }

  return errors
}
