import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <label className="w-full">
      {label && <div className="text-sm text-gray-700 mb-1">{label}</div>}
      <input
        className={"w-full h-11 rounded-base border border-gray-200 px-3 text-gray-900 " + (className ?? '')}
        {...props}
      />
    </label>
  )
}

export default Input
