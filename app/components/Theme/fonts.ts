// Fonts Example
import { Roboto } from "next/font/google";

const DefaultFont = Roboto({
  display: "swap",
  style: ["normal", "italic"],
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default DefaultFont;

// Local Fonts example
// more details here: https://nextjs.org/docs/app/building-your-application/optimizing/fonts#local-fonts
// import localFont from 'next/font/local';

// const LocalFont = localFont({src: [{path: './path-of-font-file-regular.woff', weight: '400', style: 'normal'}], fallback: ['Arial', 'sans-serif']})

// export default LocalFont;
