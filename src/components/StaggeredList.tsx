"use client"
import { Stack, StackProps } from "@mui/material"
import { animated, AnimationConfig, useTrail } from "@react-spring/web"
import React, { Children } from "react"

import { SPRING_CONFIGS } from "../utils/utils"

export type StaggeredListProps = StackProps & {
  config?: Partial<AnimationConfig>
  show?: boolean
}

const SHOW_STATE = { opacity: 1, y: 0 }
const HIDE_STATE = { opacity: 0, y: -10 }
const INIT_STATE = { opacity: 0, y: -10 }

export function StaggeredList(props: StaggeredListProps) {
  const { children, show = true, config = SPRING_CONFIGS.quick, ...rest } = props

  const items = Children.toArray(children)
  const trails = useTrail(items.length, {
    config: show ? config : SPRING_CONFIGS.quicker,
    from: show ? INIT_STATE : HIDE_STATE,
    reverse: !show,
    to: show ? SHOW_STATE : HIDE_STATE,
  })

  return (
    <Stack {...rest}>
      {trails.map((props, index) => (
        <animated.div key={index} style={props}>
          {items[index]}
        </animated.div>
      ))}
    </Stack>
  )
}
