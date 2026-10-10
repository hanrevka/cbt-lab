import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ModuleHeader({
  index,
  title,
  subtitle,
}: {
  index: string
  title: string
  subtitle: string
}) {
  return (
    <header className="mb-6 px-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
        Module {index}
      </p>
      <h2 className="mt-1 text-[28px] font-semibold leading-none tracking-tight text-[#111111]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-black/60 text-pretty">{subtitle}</p>
    </header>
  )
}

export function MonoLabel({
  children,
  className,
  htmlFor,
}: {
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  const classes = cn('font-mono text-[10px] uppercase tracking-[0.18em]', className)
  return htmlFor ? (
    <label htmlFor={htmlFor} className={classes}>
      {children}
    </label>
  ) : (
    <span className={classes}>{children}</span>
  )
}

export function BracketButton({
  children,
  variant = 'dark',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'dark' | 'light' | 'ghost' }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'flex h-12 items-center justify-center rounded-full px-5 font-mono text-xs font-semibold uppercase tracking-[0.16em] transition-[background-color,color,opacity,transform] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2',
        variant === 'dark' && 'bg-[#111111] text-white focus-visible:outline-[#111111]',
        variant === 'light' && 'bg-white text-[#111111] focus-visible:outline-white',
        variant === 'ghost' &&
          'border border-[#111111]/20 text-[#111111] hover:border-[#111111] focus-visible:outline-[#111111]',
        className,
      )}
    >
      {children}
    </button>
  )
}

export const fieldClass =
  'w-full resize-none rounded-xl border border-[#111111]/15 bg-white px-4 py-3 text-[15px] leading-snug text-[#111111] placeholder:text-black/35 outline-none transition-colors focus:border-[#111111]'
