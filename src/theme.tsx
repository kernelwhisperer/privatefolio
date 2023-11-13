import { experimental_extendTheme as extendTheme } from "@mui/material/styles"

// A custom theme for this app
const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: "rgb(40, 40, 40)",
          paper: "transparent",
        },
        // primary: {
        //   main: "#fff",
        // },
        // secondary: {
        //   main: "rgb(0, 211, 149)",
        // },
      },
    },
  },
  // shape: {
  //   borderRadius: 6,
  // },
  // transitions: {
  //   easing: {
  //     // sharp: "cubic-bezier(1.000, 0.000, 0.000, 1.000)",
  //   },
  // },
})
// console.log("📜 LOG > theme:", theme)

export const RobotoSerifFF = "'Roboto Serif', serif"
export const RobotoMonoFF = "'Roboto Mono', monospace"

export default theme
