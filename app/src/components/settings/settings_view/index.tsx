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

const MainContent = styled.div<{ borderTop?: boolean }>`
  display: flex;
  justify-content: center;
  border-top: ${props => (props.borderTop ? props.theme.borders.borderLineDisabled : '')};
`

const BottomContent = styled(MainContent as any)`
  display: flex;
  justify-content: center;
`

const Column = styled.div``

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatusSection = styled(Row as any)`
  justify-content: flex-start;
  margin-top: 6px;
`

// const Text = styled.p`
//   color: ${props => props.theme.colors.textColorDark};
//   font-size: 16px;
//   line-height: 18.75px;
//   letter-spacing: 0.4px;
//   margin: 0;
// `

const TextLighter = styled.p`
  color: ${props => props.theme.colors.textColorLighter};
  font-size: 12px;
  line-height: 14.06px;
  margin: 0;
`

// const ButtonRow = styled.div`
//   display: flex;
//   margin-left: auto;

//   button:first-child {
//     margin-right: 12px;
//   }
// `

const SetAndSaveButton = styled(ButtonRound)`
  letter-spacing: 0.4px;
  width: 166px;
  height: 40px;
  margin: 8px;
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
  margin-top: 20px;

  ${TextfieldCSS};
`

const ImageWrap = styled.div`
  margin-right: 10px;
`

const TopCardHeader = styled.div<{ borderTop?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  width: 100%;
  border-top: ${props => (props.borderTop ? props.theme.borders.borderLineDisabled : '')};
`

interface Props {
  history?: any

  networkId?: any
}

const SettingsViewContainer = (props: Props) => {
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
      <ModalCard style={{ minHeight: '146px' }}>
        <TopCardHeader>
          <Row>
            <Column>
              RPC Endpoint
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

        {current === dropdownItems.length - 1 && (
          <TopCardHeader borderTop={true}>
            <Row>
              <Column>
                Custom RPC URL
                <Input
                  onChange={event => {
                    setUrl(event.target.value)
                    if (current === dropdownItems.length - 1) setCustomUrl(event.target.value)
                  }}
                  placeholder={'Paste your RPC URL'}
                  value={customUrl}
                ></Input>
              </Column>
            </Row>
          </TopCardHeader>
        )}
      </ModalCard>

      <BottomContent>
        <SetAndSaveButton
          onClick={() => {
            setCurrent(0)
            urlObject && setUrl(urlObject[0].rpcUrl)
          }}
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
        >
          Save
        </SetAndSaveButton>
      </BottomContent>
    </>
  )
}

export default SettingsViewContainer
