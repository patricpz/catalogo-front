import React from 'react'

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'destructive'
  children?: React.ReactNode
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', children, className, ...props }) => {
  const base = 'p-3 rounded-base border'
  const variants: Record<string, string> = {
    default: 'bg-gray-50 text-gray-800 border-gray-100',
    destructive: 'bg-red-50 text-red-700 border-red-100'
  }

  return (
    <div className={`${base} ${variants[variant]} ${className ?? ''}`} {...props}>
      {children}
    </div>
  )
}

export default Alert
