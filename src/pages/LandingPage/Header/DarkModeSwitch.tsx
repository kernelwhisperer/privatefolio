// Copyright belongs to https://github.com/JoseRFelix/react-toggle-dark-mode/tree/master

import { animated, useSpring } from "@react-spring/web"
import * as React from "react"

export const defaultProperties = {
  dark: {
    circle: {
      r: 9,
    },
    lines: {
      opacity: 0,
    },
    mask: {
      cx: "50%",
      cy: "23%",
    },
    svg: {
      transform: "rotate(40deg)",
    },
  },
  light: {
    circle: {
      r: 5,
    },
    lines: {
      opacity: 1,
    },
    mask: {
      cx: "100%",
      cy: "0%",
    },
    svg: {
      transform: "rotate(90deg)",
    },
  },
  springConfig: { friction: 35, mass: 4, tension: 250 },
}

let REACT_TOGGLE_DARK_MODE_GLOBAL_ID = 0

type SVGProps = Omit<React.HTMLAttributes<HTMLOrSVGElement>, "onChange">

export interface Props extends SVGProps {
  animationProperties?: typeof defaultProperties
  checked: boolean
  onChange: (checked: boolean) => void
  size?: number | string
  style?: React.CSSProperties
}

export const DarkModeSwitch: React.FC<Props> = ({
  onChange,
  checked = false,
  size = 24,
  animationProperties = defaultProperties,
  style,
  ...rest
}) => {
  const [id, setId] = React.useState(0)

  React.useEffect(() => {
    REACT_TOGGLE_DARK_MODE_GLOBAL_ID += 1
    setId(REACT_TOGGLE_DARK_MODE_GLOBAL_ID)
  }, [setId])

  const properties = React.useMemo(() => {
    if (animationProperties !== defaultProperties) {
      return Object.assign(defaultProperties, animationProperties)
    }

    return animationProperties
  }, [animationProperties])

  const { circle, svg, lines, mask } = properties[checked ? "dark" : "light"]

  const svgContainerProps = useSpring({
    ...svg,
    config: animationProperties.springConfig,
  })
  const centerCircleProps = useSpring({
    ...circle,
    config: animationProperties.springConfig,
  })
  const maskedCircleProps = useSpring({
    ...mask,
    config: animationProperties.springConfig,
  })
  const linesProps = useSpring({
    ...lines,
    config: animationProperties.springConfig,
  })

  const toggle = () => onChange(!checked)

  const uniqueMaskId = `circle-mask-${id}`

  return (
    <animated.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      color={"var(--mui-palette-primary-main)"}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      onClick={toggle}
      style={{
        cursor: "pointer",
        ...svgContainerProps,
        ...style,
      }}
      {...rest}
    >
      <mask id={uniqueMaskId}>
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <animated.circle style={maskedCircleProps as any} r="9" fill="black" />
      </mask>

      <animated.circle
        cx="12"
        cy="12"
        fill={"var(--mui-palette-primary-main)"}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={centerCircleProps as any}
        mask={`url(#${uniqueMaskId})`}
      />
      <animated.g stroke="currentColor" style={linesProps}>
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </animated.g>
    </animated.svg>
  )
}
