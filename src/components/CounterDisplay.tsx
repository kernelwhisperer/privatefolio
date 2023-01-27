import React from 'react';
import {useStore} from '@nanostores/react';
import {counter} from '../stores/counter';

const CounterDisplay = () => {
   const counterValue = useStore(counter);

   return <div>{counterValue}</div>;
};

export default CounterDisplay;
