import { useState, type SubmitEvent } from 'react' // Swapped out deprecated FormEven
import authService from '../services/AuthService'
import { useNavigate } from 'react-router-dom';
import { parseApiError } from '../utils/errorUtils';

export function useRegister() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [program, setProgram] = useState('')
  const [studentId, setStudentId] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const navigate = useNavigate()


  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    // Reset all error displays when a user resubmits the form
    setError('')
    setFieldErrors({})

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true);

    try {
      await authService.register({
        fullName,
        email,
        password,
        program,
        studentId: Number(studentId),
      })

      navigate('/login', {
        state: { email },
      })

    } catch (err) {
      const parsedError = await parseApiError(err)
      
      setError(parsedError.message)
      setFieldErrors(parsedError.fieldErrors)
    } finally {
      setLoading(false)
    }
  }

  return {
    fullName,
    email,
    password,
    confirmPassword,
    program,
    studentId,
    loading,
    error,
    fieldErrors,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setProgram,
    setStudentId,
    handleSubmit,
  }
}