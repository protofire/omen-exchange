import React from 'react'

export const IconOmen = () => {
  return (
    <svg fill="none" height="56" viewBox="0 0 56 56" width="56" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d)">
        <path
          d="M4 26C4 12.7452 14.7452 2 28 2C41.2548 2 52 12.7452 52 26C52 39.2548 41.2548 50 28 50C14.7452 50 4 39.2548 4 26Z"
          fill="url(#paint0_radial)"
        />
        <path
          clipRule="evenodd"
          d="M42.4234 34.536C42.7881 34.3453 43.1797 34.7714 42.9111 35.0833C39.791 38.7061 35.1703 40.9999 30.014 40.9999C20.6174 40.9999 13 33.3825 13 23.986C13 18.8296 15.2938 14.209 18.9167 11.0889C19.2285 10.8203 19.6546 11.2119 19.464 11.5766C18.2331 13.9306 17.5371 16.6085 17.5371 19.449C17.5371 28.8455 25.1545 36.4629 34.551 36.4629C37.3915 36.4629 40.0693 35.7668 42.4234 34.536ZM26.4276 27.5723C24.4343 25.579 24.4343 22.3472 26.4276 20.3539C28.8338 17.9478 37.8568 15.3411 38.2578 15.7422C38.6588 16.1432 36.0522 25.1662 33.646 27.5723C32.667 28.5513 31.3893 29.0495 30.1063 29.0668C28.777 29.0848 27.4419 28.5866 26.4276 27.5723Z"
          fill="white"
          fillRule="evenodd"
        />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="56"
          id="filter0_d"
          width="56"
          x="0"
          y="0"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0509804 0 0 0 0 0.278431 0 0 0 0 0.631373 0 0 0 0.2 0" />
          <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" mode="normal" result="shape" />
        </filter>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform="translate(28 26) rotate(90) scale(24)"
          gradientUnits="userSpaceOnUse"
          id="paint0_radial"
          r="1"
        >
          <stop stopColor="#0D47A1" />
          <stop offset="1" stopColor="#1565C0" />
        </radialGradient>
      </defs>
    </svg>
  )
}
