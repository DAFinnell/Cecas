import { useState, type SubmitEvent } from 'react' // Swapped out deprecated FormEvent
import { useNavigate } from 'react-router-dom'
import authService from '../services/AuthService'
import { useLocation } from 'react-router-dom'
import { parseApiError } from '../utils/errorUtils'
import { routes } from '../app/routes'

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(() => location.state?.email ?? '')

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Email is required.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)

    try {
      const user = await authService.login({
        email: normalizedEmail,
        password,
      })

      setSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 500)) // allow success state to render before redirecting

      if (user.role === 'CHAIR') {
        navigate(
          user.mustChangePassword ? routes.chair.forceChangePassword : routes.chair.dashboard,
        )
      } else {
        navigate(routes.student.dashboard)
      }
    } catch (err) {
      const parsedError = await parseApiError(err)
      setError(parsedError.message)
      setFieldErrors(parsedError.fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    password,
    loading,
    error,
    fieldErrors,
    success,
    setEmail,
    setPassword,
    handleSubmit,
  }
}
