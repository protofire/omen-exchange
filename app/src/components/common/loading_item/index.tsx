import React from 'react'
import styled from 'styled-components'
import { ChevronRightIcon } from '../chevron_right_icon'

const StyledLoadingItem = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-content: center;

  [class*='Rectangle-'] {
    margin: 4px 1%;
    background-color: #efefef;
    border-radius: 8px;
  }

  .rectangle-container {
    flex: 1 0 auto;
    display: flex;
    flex-wrap: wrap;
    padding-right: 50px;
  }

  .Rectangle-1 {
    width: 20%;
    height: 16px;
    -webkit-animation: loading 1s ease-in infinite both;
    animation: loading 1s ease-in infinite both;
  }

  .Rectangle-2 {
    width: 76%;
    height: 16px;
    -webkit-animation: loading 1s ease-in infinite both;
    animation: loading 1s ease-in infinite both;
  }

  .Rectangle-3 {
    width: 5%;
    height: 11px;
    -webkit-animation: loading 1s ease-in infinite both;
    animation: loading 1s ease-in infinite both;
  }

  .Rectangle-4 {
    width: 91%;
    height: 11px;
    -webkit-animation: loading 1s ease-in infinite both;
    animation: loading 1s ease-in infinite both;
  }

  .Rectangle-5 {
    width: 20%;
    height: 11px;
    -webkit-animation: loading 1s ease-in infinite both;
    animation: loading 1s ease-in infinite both;
  }

  .Rectangle-6 {
    width: 76%;
    height: 11px;
    -webkit-animation: loading 1s ease-in infinite both;
    animation: loading 1s ease-in infinite both;
  }

  @-webkit-keyframes loading {
    0% {
      -webkit-transform: scaleX(0.4);
      transform: scaleX(0.4);
      -webkit-transform-origin: 0% 0%;
      transform-origin: 0% 0%;
    }
    100% {
      -webkit-transform: scaleX(1);
      transform: scaleX(1);
      -webkit-transform-origin: 0% 0%;
      transform-origin: 0% 0%;
    }
  }
  @keyframes loading {
    0% {
      -webkit-transform: scaleX(0.4);
      transform: scaleX(0.4);
      -webkit-transform-origin: 0% 0%;
      transform-origin: 0% 0%;
    }
    100% {
      -webkit-transform: scaleX(1);
      transform: scaleX(1);
      -webkit-transform-origin: 0% 0%;
      transform-origin: 0% 0%;
    }
  }
`

const Chevron = styled(ChevronRightIcon)`
  flex-grow: 0;
  flex-shrink: 0;
  align-items: center;
  display: flex;
  padding-right: 18px;
  opacity: 0.3;
`

export const LoadingItem: React.FC = () => {
  return (
    <StyledLoadingItem>
      <div className="rectangle-container">
        <div className="Rectangle-1"></div>
        <div className="Rectangle-2"></div>
        <div className="Rectangle-3"></div>
        <div className="Rectangle-4"></div>
        <div className="Rectangle-5"></div>
        <div className="Rectangle-6"></div>
      </div>
      <Chevron />
    </StyledLoadingItem>
  )
}
