import { Box, styled } from 'decentraland-ui2'

// The ui2 navbar is `position: fixed`, so this padding is the only thing keeping
// the page out from under it, and it has to track the bar's own heights: 64px
// below 992px and 92px above it. It read 66px, which was the height before ui2
// 3.x and left 26px of every consumer's content sitting behind the bar.
const NavbarContainer = styled(Box)({
  paddingTop: '64px',
  '@media (min-width: 992px)': {
    paddingTop: '92px'
  },
  width: '100%'
})

export { NavbarContainer }
