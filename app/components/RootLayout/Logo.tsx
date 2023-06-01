import React, { ReactNode, SVGTextElementAttributes } from "react";

import { RobotoFlexFF } from "../Theme/fonts";

interface CustomTextProps extends SVGTextElementAttributes<SVGTextElement> {
  children: ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  ...rest
}) => (
  <text
    fill="var(--mui-palette-background-default)"
    stroke="var(--mui-palette-primary-main)"
    strokeWidth="4"
    strokeLinejoin="miter"
    strokeLinecap="square"
    fontFamily={RobotoFlexFF}
    fontSize="40px"
    fontWeight="1000"
    paintOrder="stroke"
    style={{
      // fontStyle: "oblique 10deg",
      fontVariationSettings: "'YTUC' 500",
      ...style,
    }}
    {...rest}
  >
    {children}
  </text>
);

export function Logo() {
  return (
    <svg
      width="256"
      height="72"
      viewBox="0 0 256 72"
      xmlns="http://www.w3.org/2000/svg"
    >
      <CustomText
        x="8"
        y="32"
        style={{
          filter: `drop-shadow(-4px 0px 0px var(--mui-palette-primary-main))`,
        }}
      >
        TRADE
      </CustomText>
      <CustomText
        x="32"
        y="64"
        style={{
          filter: `drop-shadow(4px 0px 0px var(--mui-palette-primary-main))`,
        }}
      >
        JOURNAL
      </CustomText>
    </svg>
  );
}
