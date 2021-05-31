import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { getChainSpecificAlternativeUrls, getInfuraUrl } from '../../../util/networks'
import { checkRpcStatus, getNetworkFromChain, isValidHttpUrl } from '../../../util/tools'
import { ButtonRound } from '../../button'
import { Dropdown, DropdownPosition } from '../../common/form/dropdown/index'
import { TextfieldCSS } from '../../common/form/textfield'
import { IconBlockscout, IconCloudflare, IconInfura } from '../../common/icons'
import { IconXdai } from '../../common/icons/IconXdai'
import { ModalCard } from '../../modal/common_styled'

const Column = styled.div`
  width: 100%;
`

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatusSection = styled(Row as any)`
  justify-content: flex-start;
  margin-top: 5px;
`

const TextLighter = styled.p`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 12px;
  line-height: 14.06px;
  margin: 0;
`

const SetAndSaveButton = styled(ButtonRound)`
  flex: 1;
  padding: 12px 17px;
`

const FiltersControls = styled.div<{ disabled?: boolean }>`
  align-items: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};

  @media (min-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
  }
`

const NodeDropdown = styled(Dropdown)`
  min-width: 170px;
`

const CustomDropdownItem = styled.div`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  font-size: ${props => props.theme.fonts.defaultSize};
  line-height: ${props => props.theme.fonts.defaultLineHeight};
  display: flex;
  align-items: center;
  letter-spacing: 0.4px;
  height: 24px;
  color: ${props => props.theme.colors.textColorDark};

  img {
    margin-right: 10px;
  }
`

const StatusBadge = styled.div<{ status: boolean }>`
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 3px;
  background-color: ${props => (props.status ? props.theme.message.colors.ok : props.theme.message.colors.error)};
`

const Input = styled.input`
  margin: 12px 0px;
  ${TextfieldCSS};
  padding: 12px 20px;
  width: 100%;
`

const ImageWrap = styled.div`
  margin-right: 10px;
`

const TopCardHeader = styled.div<{ borderTop?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.cards.paddingVertical};
  width: 100%;
  border-top: ${props => (props.borderTop ? props.theme.borders.borderLineDisabled : '')};
`

const RPCTextWrapper = styled.span`
  line-height: ${props => props.theme.fonts.defaultLineHeight};
`

const SettingsButtonWrapper = styled.div`
  display: flex;
  margin-top: auto;
  width: 100%;
`

interface Props {
  history?: any
  theme?: any
  networkId?: any
}

export const SettingsViewContainer = (props: Props) => {
  const networkId = props.networkId

  const network = getNetworkFromChain(networkId)

  const [current, setCurrent] = useState(0)
  const [url, setUrl] = useState<string>('')
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false)
  const [onlineStatus, setOnlineStatus] = useState<boolean>(false)
  const [customUrl, setCustomUrl] = useState<string>('')

  const urlObject = getChainSpecificAlternativeUrls(network)
  let dropdownItems: any[] = []
  if (urlObject) {
    dropdownItems = urlObject.map((item, index) => {
      return {
        title: item.name,
        image:
          item.name === 'Infura' ? (
            <IconInfura />
          ) : item.name === 'Cloudflare' ? (
            <IconCloudflare />
          ) : item.name === 'Blockscout' ? (
            <IconBlockscout />
          ) : item.name === 'xDai' ? (
            <IconXdai />
          ) : (
            undefined
          ),
        onClick: () => {
          setCurrent(index)
          setUrl(item.rpcUrl)
        },
      }
    })
  }

  dropdownItems.push({
    title: 'Custom',
    image: undefined,
    onClick: () => {
      setCurrent(dropdownItems.length - 1)
      setUrl('')
    },
  })

  const filterItems = dropdownItems.map(item => {
    return {
      content: (
        <CustomDropdownItem onClick={item.onClick}>
          {item.image && <ImageWrap>{item.image}</ImageWrap>}
          {item.title}
        </CustomDropdownItem>
      ),
      secondaryText: '',
      onClick: item.onClick,
    }
  })

  const isDropDownActive = current === dropdownItems.length - 1

  useEffect(() => {
    if (url.length === 0 && current !== dropdownItems.length - 1 && urlObject) {
      setUrl(urlObject[current].rpcUrl)
    }
    const isValid = isValidHttpUrl(url)
    setIsValidUrl(isValid)
    if (!isValid) {
      setOnlineStatus(false)
      return
    }

    checkRpcStatus(urlObject && urlObject[current] ? urlObject[current].rpcUrl : url, setOnlineStatus, network)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])
  useEffect(() => {
    if (localStorage.getItem('rpcAddress')) {
      const data = JSON.parse(localStorage.getItem('rpcAddress') as string)
      setUrl(data.url)
      if (data.network === getNetworkFromChain(networkId)) {
        setCurrent(data.index)
        if (data.index === dropdownItems.length - 1) {
          setCustomUrl(data.url)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <ModalCard>
        <TopCardHeader>
          <Row>
            <Column>
              <RPCTextWrapper>RPC Endpoint</RPCTextWrapper>
              <StatusSection>
                <StatusBadge status={onlineStatus} />

                <TextLighter>Status: {onlineStatus ? 'OK' : 'Unavailable'}</TextLighter>
              </StatusSection>
            </Column>
            <FiltersControls>
              <NodeDropdown
                currentItem={current}
                dirty
                dropdownPosition={DropdownPosition.center}
                items={filterItems}
              />
            </FiltersControls>
          </Row>
        </TopCardHeader>

        {isDropDownActive && (
          <TopCardHeader borderTop={true} style={{ paddingBottom: '10px' }}>
            <Row>
              <Column>
                <RPCTextWrapper>Custom RPC URL</RPCTextWrapper>
                <Input
                  onChange={event => {
                    setUrl(event.target.value)
                    if (isDropDownActive) setCustomUrl(event.target.value)
                  }}
                  placeholder={'Paste your RPC URL'}
                  value={customUrl}
                ></Input>
              </Column>
            </Row>
          </TopCardHeader>
        )}
      </ModalCard>

      <SettingsButtonWrapper>
        <SetAndSaveButton
          onClick={() => {
            setCurrent(0)
            urlObject && setUrl(urlObject[0].rpcUrl)
          }}
          style={{ marginRight: '8px' }}
        >
          Set to Default
        </SetAndSaveButton>
        <SetAndSaveButton
          disabled={
            url.length === 0 || !isValidUrl || (network !== -1 && getInfuraUrl(network) === url) || !onlineStatus
          }
          onClick={async () => {
            if (!(await checkRpcStatus(url, setOnlineStatus, network))) return

            localStorage.setItem(
              'rpcAddress',
              JSON.stringify({
                url: url,
                network: network,
                index: current,
              }),
            )
            window.location.reload()
          }}
          style={{ marginLeft: '8px' }}
        >
          Save
        </SetAndSaveButton>
      </SettingsButtonWrapper>
    </>
  )
}

export default SettingsViewContainer
