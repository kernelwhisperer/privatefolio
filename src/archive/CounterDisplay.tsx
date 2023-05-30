import { useStore } from "@nanostores/react";
import React from "react";

import { counter } from "../stores/counter";

const CounterDisplay = () => {
  const counterValue = useStore(counter);

  return <div>{counterValue}</div>;
};

export default CounterDisplay;
