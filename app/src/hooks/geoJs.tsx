import React, { useContext, useEffect, useState } from 'react'

import { BLACKLISTED_COUNTRIES, GEO_JS_ENDPOINT } from '../common/constants'

export type GeoJsResponse = {
  organization_name: string
  region: string
  accuracy: number
  asn: number
  organization: string
  timezone: string
  longitude: string
  country_code3: string
  area_code: string
  ip: string
  city: string
  country: string
  continent_code: string
  country_code: string
  latitude: string
}

const GeoJsContext = React.createContext<Maybe<GeoJsResponse>>(null)

export const useIsBlacklistedCountry = (): Maybe<boolean> => {
  const geoJsResponse = useContext(GeoJsContext)

  return geoJsResponse ? BLACKLISTED_COUNTRIES.includes(geoJsResponse.country_code) : null
}

/**
 * Component used to get geojs information an inject it via a context
 */
export const GeoJsProvider: React.FC = props => {
  const [geoJsData, setGeoJsData] = useState<Maybe<GeoJsResponse>>(null)

  useEffect(() => {
    const win: any = window
    const script = document.createElement('script')

    script.src = GEO_JS_ENDPOINT
    script.async = true
    win.geoip = setGeoJsData
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return <GeoJsContext.Provider value={geoJsData}>{props.children}</GeoJsContext.Provider>
}
