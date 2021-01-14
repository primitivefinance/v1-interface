import {
  black,
  grey,
  white,
  green,
  red,
  yellow,
  orange,
  percentage,
} from './colors'

const theme = {
  barHeight: 72,
  borderRadius: 4,
  breakpoints: {
    mobile: 400,
  },
  buttonSize: 44,
  color: {
    black,
    grey,
    white,
    green,
    red,
    yellow,
    orange,
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
  flexboxgrid: {
    // Defaults
    gridSize: 12, // columns
    gutterWidth: 1, // rem
    outerMargin: 1, // rem
    mediaQuery: 'only screen',
    container: {
      sm: 64, // rem
      md: 75, // rem
      lg: 100, // rem
    },
    breakpoints: {
      xs: 0, // em
      sm: 48, // em
      md: 64, // em
      lg: 75, // em
    },
  },
  rowHeight: 64,
  sidebarWidth: 25,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 40,
    7: 48,
  },
  tableWidth: 100,
  units: 'em',
}

export default theme
