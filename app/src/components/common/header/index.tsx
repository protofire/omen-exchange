import * as React from 'react'
import { Link } from 'react-router-dom'

import { ConnectWallet, ConnectionStatus } from '../../../components'
import { ConnectedWeb3 } from '../../../hooks/connectedWeb3'
import { Logo } from '../logo'

export const Header = () => (
  <div className="nav horizontal-align">
    <div className="col-3">
      <Logo className="nav-logo" />
    </div>
    <div className="col-9 right">
      <Link className="nav-item" to="/">
        Home
      </Link>
      <ConnectedWeb3>
        <Link className="nav-item" to="/create">
          Create market
        </Link>
      </ConnectedWeb3>
      <ConnectWallet className="nav-item" />
      <ConnectedWeb3>
        <ConnectionStatus className="nav-item" />
      </ConnectedWeb3>
    </div>
  </div>
)
