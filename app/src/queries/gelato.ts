import gql from 'graphql-tag'

export const GelatoSubmitted = gql`
  query taskReceiptWrappers($user: String!) {
    taskReceiptWrappers(where: { user: $user }) {
      taskReceipt {
        id
        userProxy
        provider {
          addr
          module
        }
        index
        tasks {
          conditions {
            inst
            data
          }
          actions {
            addr
            data
            operation
            dataFlow
            value
            termsOkCheck
          }
          selfProviderGasLimit
          selfProviderGasPriceCeil
        }
        expiryDate
        cycleId
        submissionsLeft
      }
      submissionHash
      status
      submissionDate
      executionDate
      executionHash
      selfProvided
    }
  }
`
