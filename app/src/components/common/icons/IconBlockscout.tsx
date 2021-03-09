import React from 'react'

interface Props {
  size?: string
}

export const IconBlockscout = (props: Props) => {
  const { size = '24' } = props
  return (
    <svg fill="none" height={size} viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M-6.10352e-05 12C-6.10352e-05 5.37258 5.37252 0 11.9999 0V0C18.6274 0 23.9999 5.37258 23.9999 12V12C23.9999 18.6274 18.6274 24 11.9999 24V24C5.37252 24 -6.10352e-05 18.6274 -6.10352e-05 12V12Z"
        fill="#48A9A6"
      />
      <path
        clipRule="evenodd"
        d="M10.7999 6H5.99994V8.4H10.7999V6ZM17.9999 6H13.1999V8.4H17.9999V6ZM13.1999 15.6H15.5999V13.2H17.9999V18H13.1999V15.6ZM8.39994 13.2H5.99994V18H10.7999V15.6H8.39994V13.2Z"
        fill="white"
        fillRule="evenodd"
      />
    </svg>
  )
}
