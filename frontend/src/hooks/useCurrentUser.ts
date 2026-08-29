import { useEffect, useState } from 'react'
import authService from '../services/AuthService'
import type { CurrentUserResponse } from '../types/auth.types'

const anonymousUser: CurrentUserResponse = {
  authenticated: false,
  email: null,
  role: null,
  mustChangePassword: false,
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUserResponse>(anonymousUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await authService.fetchCurrentUser()
        if (active) setUser(response)
      } catch {
        if (active) setUser(anonymousUser)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    const onAuthChanged = () => {
      void authService
        .fetchCurrentUser()
        .then((resp) => {
          if (active) setUser(resp)
        })
        .catch(() => {
          if (active) setUser(anonymousUser)
        })
    }

    window.addEventListener('auth-changed', onAuthChanged)

    return () => {
      active = false
      window.removeEventListener('auth-changed', onAuthChanged)
    }
  }, [])

  return { user, loading }
}
