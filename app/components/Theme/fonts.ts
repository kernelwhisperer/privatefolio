// Fonts Example
// eslint-disable-next-line camelcase
import { Roboto_Flex } from "next/font/google";

// https://v-fonts.com/fonts/roboto-flex
const RobotoFlex = Roboto_Flex({
  axes: ["slnt", "YTUC", "wdth", "XTRA"],
  display: "fallback", // TODO: not sure
  subsets: ["latin"],
});

export const RobotoFlexFF = [
  RobotoFlex.style.fontFamily,
  "Helvetica",
  "Arial",
  "sans-serif",
  "system-ui",
].join(",");
