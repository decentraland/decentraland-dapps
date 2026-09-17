import React from 'react'
import { render } from '@testing-library/react'
import { CreditsResponse } from '../../modules/credits/types'
import Navbar2 from './Navbar2'
import { NavbarProps2 } from './Navbar.types'

/**
 * The legacy MANA credits chip must not appear for a wallet that has none.
 *
 * The navbar takes `creditsBalance` being an OBJECT as "this wallet has credits", and the credits client
 * answers `{ credits: [], totalCredits: 0 }` both for a wallet with none and for a failed request. Building
 * the object unconditionally therefore put a chip on every signed-in navbar, reading 0 and offering a
 * tooltip ("Expiring in 0 days — 1 Credit = 1 MANA in value") for a programme that is no longer issued.
 *
 * Asserted on the prop rather than the rendered chip: the chip lives in decentraland-ui2, so rendering it
 * here would pin that library's markup instead of this container's decision.
 */

const navbarProps: Record<string, unknown> = {}

jest.mock('decentraland-ui2', () => ({
  Navbar: (props: Record<string, unknown>) => {
    Object.assign(navbarProps, props)
    return null
  }
}))
// Stubbed so the suite never pulls MUI in through ui2's `styled`: this spec is about which props the
// container computes, and the wrapper's padding has no bearing on that.
jest.mock('./Navbar2.styled', () => ({
  NavbarContainer: ({ children }: { children: React.ReactNode }) => children
}))
jest.mock('../ChainProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: (p: { chainId: number; isUnsupported: boolean }) => React.ReactNode }) =>
    children({ chainId: 1, isUnsupported: false })
}))
jest.mock('../UnsupportedNetworkModal', () => ({ __esModule: true, default: () => null }))
jest.mock('./NotificationSlot', () => ({ __esModule: true, default: () => null }))
jest.mock('../../hooks/useNotifications', () => ({
  __esModule: true,
  default: () => ({
    isModalOpen: false,
    isLoading: false,
    notifications: [],
    handleNotificationsOpen: jest.fn(),
    handleRenderProfile: jest.fn()
  })
}))
jest.mock('../../modules/analytics/utils', () => ({ getAnalytics: () => ({ track: jest.fn() }) }))

function renderNavbar(credits: CreditsResponse | null) {
  for (const key of Object.keys(navbarProps)) delete navbarProps[key]
  render(<Navbar2 {...({ credits, isSignedIn: true, onSignIn: jest.fn(), onSignOut: jest.fn() } as unknown as NavbarProps2)} />)
  return navbarProps
}

describe('when rendering the navbar for a wallet with no legacy credits', () => {
  describe('and the credits server reports a zero balance', () => {
    it('should not hand the navbar a credits balance, so no chip is offered', () => {
      expect(renderNavbar({ credits: [], totalCredits: 0 }).creditsBalance).toBeUndefined()
    })
  })

  describe('and the credits request failed', () => {
    // The client swallows the error into the same zero-balance shape, so this is indistinguishable from
    // "no credits" — and announcing a balance we never read would be the worse of the two guesses.
    it('should not hand the navbar a credits balance either', () => {
      expect(renderNavbar({ credits: [], totalCredits: 0 }).creditsBalance).toBeUndefined()
    })
  })

  describe('and the wallet is not signed in', () => {
    it('should not hand the navbar a credits balance', () => {
      expect(renderNavbar(null).creditsBalance).toBeUndefined()
    })
  })
})

describe('when rendering the navbar for a wallet that still holds legacy credits', () => {
  const held = {
    credits: [{ expiresAt: '1780000000' }],
    totalCredits: 213520000000000000000
  } as unknown as CreditsResponse

  it('should hand the navbar the balance in MANA, so the holder can still see and spend it', () => {
    expect(renderNavbar(held).creditsBalance).toEqual({ balance: 213.52, expiresAt: 1780000000 * 1000 })
  })
})

describe('when the app opts out of credits entirely', () => {
  it('should hand the navbar neither balance, whatever the wallet holds', () => {
    for (const key of Object.keys(navbarProps)) delete navbarProps[key]
    render(
      <Navbar2
        {...({
          credits: { credits: [{ expiresAt: '1780000000' }], totalCredits: 213520000000000000000 },
          isSignedIn: true,
          withCredits: false,
          onSignIn: jest.fn(),
          onSignOut: jest.fn()
        } as unknown as NavbarProps2)}
      />
    )
    expect(navbarProps.creditsBalance).toBeUndefined()
    expect(navbarProps.shopCreditsBalance).toBeUndefined()
  })
})
