import React from 'react'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
}

export const Card: React.FC<CardProps> = ({ children, title, className, ...props }) => {
  return (
    <div className={`bg-white rounded-base shadow-card p-4 ${className ?? ''}`} {...props}>
      {title && <h3 className="text-gray-800 font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  )
}

export default Card
