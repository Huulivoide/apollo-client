import { useEffect, useState } from 'react';
import { ReactiveVar } from '../../core';

export function useReactiveVar<T>(rv: ReactiveVar<T>): T {
  const value = rv();

  // We don't actually care what useState thinks the value of the variable
  // is, so we take only the update function from the returned array.
  const setValue = useState(value)[1];

  useEffect(() => {
    // Catch any potential state changes that might have happened
    // between when this useReactiveVar was called and this useEffect
    // cb was scheduled for async execution.
    setValue(rv());

    // We need a stable handle to function passed into rv.onNextChange.
    // Se that we can clean it up properly. RV clears the CB by reference,
    // by reusing the same CB instance everytime, we can reuse the initial
    // clean-up fn returned by onNextChange, without having to register
    // the new clean-up fn, generated by nested onNextChange call, with useEffect.
    // See ReactiveVar implementation for more details:
    // src/client/cache/inmemory/reactiveVars.js
    return rv.onNextChange(function onNext(v) {
      setValue(v);
      rv.onNextChange(onNext);
    });
  }, [rv]);

  return value;
}
