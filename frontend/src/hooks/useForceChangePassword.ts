import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/AuthService'

export default function useForceChangePassword() {
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        setError('')
        setSuccess(false)

        if (!currentPassword) {
            setError('Current password is required.')
            return
        }

        if (!newPassword) {
            setError('New password is required')
            return
        }

        if (!confirmPassword) {
            setError('Please confirm your new password.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.')
            return
        }

        setLoading(true)

        try {
            await authService.forceChangePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            })

            setSuccess(true)


            await new Promise((resolve) => setTimeout(resolve, 500))// allow success state to render before redirecting

            navigate('/chair')
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Unable to change password.')
            }
        } finally {
            setLoading(false)
        }
    }

    return {
        currentPassword,
        newPassword,
        confirmPassword,
        loading,
        error,
        success,
        setCurrentPassword,
        setNewPassword,
        setConfirmPassword,
        handleSubmit,
    }
}