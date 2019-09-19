import * as React from 'react'
import { Link } from 'react-router-dom'

import { ConnectWallet, ConnectionStatus } from '../../../components'
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
      <Link className="nav-item" to="/create">
        Create market
      </Link>
      <ConnectWallet className="nav-item" />
      <ConnectionStatus className="nav-item" />
    </div>
  </div>
)
