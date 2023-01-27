import 'solid-js';
import {useStore} from '@nanostores/solid';
import {counter} from '../stores/counter';

const CounterController = () => {
   const counterValue = useStore(counter);

   return (
       <div>
           <button
               onClick={() => {
                   counter.set(counterValue() + 1);
               }}
           >
               +
           </button>
           <button
               onClick={() => {
                   counter.set(counterValue() - 1);
               }}
           >
               -
           </button>
       </div>
   );
};

export default CounterController;
