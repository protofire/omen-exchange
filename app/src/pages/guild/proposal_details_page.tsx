import React, { useState } from 'react'

interface Props {
  id: number
}

export const ProposalDetailsPage: React.FC<Props> = props => {
  const [someState, setState] = useState('separation of concerns')
  //logic

  return <div>{someState}</div>
}
