import { black, grey, white, green, red } from "./colors";

const theme = {
    barHeight: 72,
    borderRadius: 4,
    buttonSize: 44,
    color: {
        black,
        grey,
        white,
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
    },
};

export default theme;
