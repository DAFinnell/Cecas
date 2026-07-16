import Button from '../components/Button'
import { useRegister } from '../hooks/useRegister'

export default function RegisterPage() {
  const {
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
  } = useRegister()

  return (
    <div className="mx-auto max-w-md">
      <div
        className={`rounded-lg border-2 bg-white p-8 shadow-sm transition-colors ${
          error ? 'border-red-500' : 'border-slate-200'
        }`}
      >
        <h1 className="mb-2 text-center text-3xl font-semibold">
          Register
        </h1>

        <p className="mb-6 text-center text-slate-600">
          Create your CECAS account.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none 
                        ${fieldErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
              placeholder="Enter your full name"
              required
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none 
                        ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
              placeholder="Enter your email"
              required
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="program" className="mb-2 block text-sm font-medium">
              Program
            </label>
            <input
              id="program"
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none 
            ${fieldErrors.program ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
              placeholder="Enter your program"
              required
            />
            {fieldErrors.program && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.program}</p>
            )}
          </div>

          <div>
            <label htmlFor="studentId" className="mb-2 block text-sm font-medium">
              Student ID
            </label>
            <input
              id="studentId"
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 focus:outline-none 
            ${fieldErrors.studentId ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
              placeholder="Enter your student ID"
              required
            />
            {fieldErrors.studentId && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.studentId}</p>
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
              className={`w-full rounded-md border px-3 py-2 focus:outline-none 
            ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
              placeholder="Enter your password"
              required
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Re-enter your password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </div>
    </div>
  )
}
