import type { ReactNode } from 'react'

export function Alert({
  type = 'info',
  children,
}: {
  type?: 'info' | 'error' | 'ok'
  children: ReactNode
}) {
  return <div className={`alert alert-${type}`}>{children}</div>
}
