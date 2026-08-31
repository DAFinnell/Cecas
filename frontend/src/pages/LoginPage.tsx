import Button from '../components/Button'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const {
    email,
    password,
    loading,
    error,
    fieldErrors,
    success,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLogin()

  return (
    <div className="mx-auto max-w-md">
      <div
        className={`rounded-lg bg-white p-8 shadow-sm border-2 transition-colors ${
          success ? 'border-green-500' : error ? 'border-red-500' : 'border-slate-200'
        }`}
      >
        <h1 className="mb-2 text-center text-3xl font-semibold">Login</h1>

        <p className="mb-6 text-center text-slate-600">Sign in to your CECAS account.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
              }`}
              placeholder="Enter your email"
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                fieldErrors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-sky-500 focus:ring-sky-200'
              }`}
              placeholder="Enter your password"
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Sign in successful! Redirecting...</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing In...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
