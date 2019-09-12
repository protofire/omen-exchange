import { StepTypes } from './types'

// Coordinate transitions
export class StepsMachine {
  transitions: { [key: string]: string }

  constructor() {
    this.transitions = {
      [StepTypes.ONE]: StepTypes.TWO,
      [StepTypes.TWO]: StepTypes.THREE,
      [StepTypes.THREE]: StepTypes.FOUR,
    }
  }

  reversed(transitions: { [key: string]: string }): { [key: string]: string } {
    if (typeof transitions === 'object' && transitions !== null) {
      return Object.entries(transitions).reduce(
        (acc: { [key: string]: string }, [key, value]: [string, string]) => {
          acc[value] = key
          return acc
        },
        {},
      )
    } else {
      return {}
    }
  }

  checkStep(availableStep: StepTypes, nextStep: StepTypes) {
    if (availableStep === nextStep) {
      return nextStep
    } else {
      throw new Error(`Step ${nextStep} is not available`)
    }
  }

  transitionTo(currentStep: StepTypes, nextStep: StepTypes): StepTypes {
    const availableStep = this.transitions[currentStep] as StepTypes
    return this.checkStep(availableStep, nextStep)
  }

  transitionFrom(currentStep: StepTypes, nextStep: StepTypes): StepTypes {
    const reversed = this.reversed(this.transitions)
    const availableStep = reversed[currentStep].concat() as StepTypes
    return this.checkStep(availableStep, nextStep)
  }
}
