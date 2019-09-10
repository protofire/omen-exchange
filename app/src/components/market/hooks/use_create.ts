import { useState } from 'react'

export const useCreateMarket = ({ initialValues, onSubmit, validate }: any) => {
  const [values, setValues] = useState(initialValues || {})
  const [touchedValues, setTouchedValues] = useState({})
  const [errors, setErrors] = useState({})

  const handleChange = (event: any) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    setValues({
      ...values,
      [name]: value,
    })
  }

  const handleBlur = (event: any) => {
    const target = event.target
    const name = target.name
    setTouchedValues({
      ...touchedValues,
      [name]: true,
    })
    const e = validate(values)
    setErrors({
      ...errors,
      ...e,
    })
  }

  const handleSubmit = (event: any) => {
    event.preventDefault()
    const e = validate(values)
    setErrors({
      ...errors,
      ...e,
    })
    onSubmit({ values, e })
  }

  return {
    values,
    touchedValues,
    errors,
    handleChange,
    handleSubmit,
    handleBlur,
  }
}
