import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>

export default function Button({ className = '', children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 ${className}`}
    >
      {children}
    </button>
  )
}
