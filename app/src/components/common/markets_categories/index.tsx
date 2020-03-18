import { useInterval } from '@react-corekit/use-interval'
import React, { HTMLAttributes, useCallback, useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import styled from 'styled-components'

import { ButtonCircle } from '../../common'
import { IconChevronLeft } from '../icons/IconChevronLeft'
import { IconChevronRight } from '../icons/IconChevronRight'

const CategoriesWrapper = styled.div`
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.borders.borderColor};
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  width: 100%;
`

const CategoriesButtons = styled.div`
  flex-grow: 1;
  margin-bottom: 20px;
  overflow: hidden;

  @media (min-width: ${props => props.theme.themeBreakPoints.md}) {
    margin-bottom: 0;
  }
`

const CategoriesButtonsInner = styled.div`
  align-items: center;
  display: flex;
  width: fit-content;
`

const CategoriesControls = styled.div`
  column-gap: 10px;
  display: grid;
  flex-grow: 0;
  flex-shrink: 0;
  grid-template-columns: 1fr 1fr;
  margin-left: 15px;
`

enum SliderDirection {
  left,
  right,
  none,
}

export const MarketsCategories: React.FC<HTMLAttributes<HTMLDivElement>> = props => {
  const { children } = props
  const [sliderXDisplacement, setSliderXDisplacement] = useState<number>(0)
  const [sliderMoving, setSliderMoving] = useState<SliderDirection>(SliderDirection.none)
  const [sliderButtonDisabled, setSliderButtonDisabled] = useState<SliderDirection>(SliderDirection.left)
  const [sliderRange, setSliderRange] = useState<number>(0)
  const categoriesButtonsRef: any = React.createRef()
  const categoriesButtonsInnerRef: any = React.createRef()
  const X_DISPLACEMENT = 3
  const DISPLACEMENT_TIMER = 5

  const resetSliderButtons = useCallback(() => {
    if (sliderButtonDisabled !== SliderDirection.none) {
      setSliderButtonDisabled(SliderDirection.none)
    }
  }, [sliderButtonDisabled])

  const sliderShouldMove = useCallback(
    (sliderDirection: SliderDirection) => {
      return sliderMoving === sliderDirection ? DISPLACEMENT_TIMER : null
    },
    [sliderMoving],
  )

  useEffect(() => {
    if (categoriesButtonsInnerRef.current.clientWidth < categoriesButtonsRef.current.clientWidth) {
      setSliderRange(0)
    } else {
      setSliderRange(categoriesButtonsInnerRef.current.clientWidth - categoriesButtonsRef.current.clientWidth)
    }
  }, [categoriesButtonsInnerRef, categoriesButtonsRef])

  useInterval(() => {
    const moveResult = sliderXDisplacement - X_DISPLACEMENT

    if (Math.abs(moveResult) > sliderRange) {
      setSliderButtonDisabled(SliderDirection.right)
      return
    }

    resetSliderButtons()
    setSliderXDisplacement(moveResult)
  }, sliderShouldMove(SliderDirection.right))

  useInterval(() => {
    const moveResult = sliderXDisplacement + X_DISPLACEMENT

    if (moveResult > 0) {
      setSliderButtonDisabled(SliderDirection.left)
      return
    }

    resetSliderButtons()
    setSliderXDisplacement(moveResult)
  }, sliderShouldMove(SliderDirection.left))

  const cancelSliding = () => {
    setSliderMoving(SliderDirection.none)
  }

  return (
    <CategoriesWrapper>
      <CategoriesButtons ref={categoriesButtonsRef}>
        <Draggable axis="x" defaultPosition={{ x: 0, y: 0 }} disabled position={{ x: sliderXDisplacement, y: 0 }}>
          <CategoriesButtonsInner ref={categoriesButtonsInnerRef}>{children}</CategoriesButtonsInner>
        </Draggable>
      </CategoriesButtons>
      {sliderRange !== 0 && (
        <CategoriesControls onMouseLeave={cancelSliding}>
          <ButtonCircle
            disabled={sliderButtonDisabled === SliderDirection.left}
            onMouseDown={() => setSliderMoving(SliderDirection.left)}
            onMouseLeave={cancelSliding}
            onMouseUp={cancelSliding}
          >
            <IconChevronLeft />
          </ButtonCircle>
          <ButtonCircle
            disabled={sliderButtonDisabled === SliderDirection.right}
            onMouseDown={() => setSliderMoving(SliderDirection.right)}
            onMouseLeave={cancelSliding}
            onMouseUp={cancelSliding}
          >
            <IconChevronRight />
          </ButtonCircle>
        </CategoriesControls>
      )}
    </CategoriesWrapper>
  )
}
