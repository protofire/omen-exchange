import * as React from 'react'
import { CONNECTOR } from '../../common/constants'

export const Home: React.FC = () => {
  return (
    <div className="row">
      <div className="col center">Connect with {CONNECTOR} to proceed.</div>
    </div>
  )
}
