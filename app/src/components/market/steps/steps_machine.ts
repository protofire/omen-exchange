import { StepType } from './types'

// Coordinate transitions
export class StepsMachine {
  transitions: { [key: string]: string }

  constructor() {
    this.transitions = {
      [StepType.ONE]: StepType.TWO,
      [StepType.TWO]: StepType.THREE,
      [StepType.THREE]: StepType.FOUR,
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

  checkStep(availableStep: StepType, nextStep: StepType) {
    if (availableStep === nextStep) {
      return nextStep
    } else {
      throw new Error(`Step ${nextStep} is not available`)
    }
  }

  transitionTo(currentStep: StepType, nextStep: StepType): StepType {
    const availableStep = this.transitions[currentStep] as StepType
    return this.checkStep(availableStep, nextStep)
  }

  transitionFrom(currentStep: StepType, nextStep: StepType): StepType {
    const reversed = this.reversed(this.transitions)
    const availableStep = reversed[currentStep].concat() as StepType
    return this.checkStep(availableStep, nextStep)
  }
}
