import React from 'react'
interface Props {
  size?: string
}

export const DaiIcon = (props: Props) => {
  const { size = '24' } = props
  return (
    <svg fill="none" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
      <path
        d="m11 22c6.0751 0 11-4.9249 11-11 0-6.0751-4.9249-11-11-11-6.0751 0-11 4.9249-11 11 0 6.0751 4.9249 11 11 11z"
        fill="url(#a)"
      />
      <path
        d="m17.523 9.185h-1.3053c-0.7187-1.9947-2.651-3.3623-5.1994-3.3623h-4.191v3.3623h-1.4557v1.2063h1.4557v1.265h-1.4557v1.2063h1.4557v3.322h4.191c2.519 0 4.4367-1.3566 5.1737-3.322h1.331v-1.2063h-1.0377c0.0257-0.2127 0.0404-0.4327 0.0404-0.6527v-0.0293c0-0.198-0.011-0.3923-0.0294-0.583h1.0304v-1.2063h-0.0037zm-9.5223-2.288h3.0176c1.87 0 3.2597 0.92033 3.9014 2.2843h-6.919v-2.2843zm3.0176 8.2023h-3.0176v-2.2403h6.9116c-0.6453 1.342-2.0313 2.2403-3.894 2.2403zm4.2937-4.07c0 0.2127-0.0147 0.4217-0.044 0.6233h-7.2673v-1.265h7.271c0.0256 0.198 0.0403 0.4034 0.0403 0.6124v0.0293z"
        fill="#fff"
      />
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="a" x1="11" x2="11" y1="-3.1167" y2="24.31">
          <stop offset="0" stopColor="#F9A606" />
          <stop offset="1" stopColor="#FBCC5F" />
        </linearGradient>
      </defs>
    </svg>
  )
}
