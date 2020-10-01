import { black, grey, white, green, red, yellow, percentage } from './colors'

const theme = {
  barHeight: 72,
  rowHeight: 64,
  borderRadius: 4,
  buttonSize: 44,
  breakpoints: {
    mobile: 400,
  },
  color: {
    black,
    grey,
    white,
    green,
    red,
    yellow,
    percentage,
    primary: {
      light: red[200],
      main: red[500],
    },
    secondary: {
      main: green[500],
    },
  },
  contentWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
    7: 48,
  },
}

export default theme
