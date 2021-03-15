import React from 'react'

interface Props {
  size?: string
}

export const IconXdai = (props: Props) => {
  const { size = '24' } = props
  return (
    <svg fill="none" height={size} viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM13.483 12.2016L17.4683 7.30713H14.4988L11.9984 10.3784L9.49792 7.30713H6.52878L10.5138 12.2016L6.53118 17.0923H9.50066L11.9984 14.0247L14.4961 17.0923H17.4656L13.483 12.2016Z"
        fill="url(#paint0_linear)"
        fillRule="evenodd"
      />
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="0" x2="0" y1="24" y2="0">
          <stop stopColor="#FDAC42" />
          <stop offset="1" stopColor="#FDD341" />
        </linearGradient>
      </defs>
    </svg>
  )
}
