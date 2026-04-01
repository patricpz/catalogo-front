import React from 'react'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({ children, className, ...props }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 ${className ?? ''}`}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
