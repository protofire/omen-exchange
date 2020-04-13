/* eslint-env jest */
import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render } from '@testing-library/react'
import { BigNumber } from 'ethers/utils'
import React from 'react'

import { getLogger } from '../../../../util/logger'

import { BigNumberInput } from './index'

const logger = getLogger('BigNumberInput::Spec')

const noop = () => ({})

const defaultProps = { name: 'test', value: new BigNumber('123'), decimals: 2 }

const renderBigNumberInput = props => render(<BigNumberInput {...defaultProps} {...props} />)

test('should be initialized with value', () => {
  // given
  const expectedValue = '1.23'

  // when
  const { getByTestId } = renderBigNumberInput({ onChange: noop })
  const input: any = getByTestId(defaultProps.name)

  // then
  expect(input.value).toBe(expectedValue)
})

test('should trigger the onChange callback with the proper value', async () => {
  // given
  const changeHandler = jest.fn().mockImplementation(() => {
    logger.log('changeHandler mock triggered')
  })
  const expectedValue = new BigNumber('230')

  // when
  const { container } = renderBigNumberInput({ onChange: changeHandler })
  const input: any = container.querySelector(`input[name="${defaultProps.name}"]`)

  // then
  expect(input).not.toBe(null)
  fireEvent.change(input, { target: { value: '2.30' } })
  expect(changeHandler).toHaveBeenCalledTimes(1)
  expect(changeHandler).toHaveBeenCalledWith({ name: defaultProps.name, value: expectedValue })
})

test('should change when value changes', async () => {
  const changeHandler = jest.fn().mockImplementation(() => {
    logger.log('changeHandler mock triggered')
  })

  expect(
    renderBigNumberInput({ value: new BigNumber('123'), onChange: changeHandler }).container.firstChild.value,
  ).toEqual('1.23')
  expect(
    renderBigNumberInput({ value: new BigNumber('321'), onChange: changeHandler }).container.firstChild.value,
  ).toEqual('3.21')
})

test('should allow entering an empty string', async () => {
  // given
  const changeHandler = jest.fn().mockImplementation(() => {
    logger.log('changeHandler mock triggered')
  })
  const expectedValue = new BigNumber('0')

  // when
  const { container } = renderBigNumberInput({ onChange: changeHandler })
  const input: any = container.querySelector(`input[name="${defaultProps.name}"]`)

  // then
  expect(input).not.toBe(null)
  fireEvent.change(input, { target: { value: '' } })
  expect(changeHandler).toHaveBeenCalledTimes(1)
  expect(changeHandler).toHaveBeenCalledWith({ name: defaultProps.name, value: expectedValue })
})

test('should accept a min value', async () => {
  // given
  const changeHandler = jest.fn().mockImplementation(() => {
    logger.log('changeHandler mock triggered')
  })
  const minValue = new BigNumber('100')
  const expectedValue = '1.23'

  // when
  const { container } = renderBigNumberInput({ min: minValue, onChange: changeHandler })
  const input: any = container.querySelector(`input[name="${defaultProps.name}"]`)

  // then
  expect(input).not.toBe(null)
  fireEvent.change(input, { target: { value: '0.5' } })
  expect(changeHandler).toHaveBeenCalledTimes(0)
  expect(input.value).toBe(expectedValue)
})

test('should accept a max value', async () => {
  // given
  const changeHandler = jest.fn().mockImplementation(() => {
    logger.log('changeHandler mock triggered')
  })
  const maxValue = new BigNumber('200')
  const expectedValue = '1.23'

  // when
  const { container } = renderBigNumberInput({ max: maxValue, onChange: changeHandler })
  const input: any = container.querySelector(`input[name="${defaultProps.name}"]`)

  // then
  expect(input).not.toBe(null)
  fireEvent.change(input, { target: { value: '3.5' } })
  expect(changeHandler).toHaveBeenCalledTimes(0)
  expect(input.value).toBe(expectedValue)
})

test('should allow initialize with an empty string', async () => {
  const changeHandler = jest.fn().mockImplementation(() => {
    logger.log('changeHandler mock triggered')
  })

  expect(renderBigNumberInput({ value: null, onChange: changeHandler }).container.firstChild.value).toEqual('')
  expect(changeHandler).toHaveBeenCalledTimes(0)
})
