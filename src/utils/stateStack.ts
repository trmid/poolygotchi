import { readable, Readable, Subscriber } from "svelte/store"

export interface StateStack<T> extends Readable<T> {
  push: Subscriber<T>
  pop: () => T
  replace: (value: T) => T
  rebase: (value: T) => void
  length: () => number
}

/**
 * Extended Readable Object with specific push, pop, replace, and rebase capabilities.
 * 
 * @param value Starting value
 * @returns new StateStack Readable Object
 */
export function stateStack<T>(value: T) {
  let _set: Subscriber<T>;
  let stack: T[] = [value];
  const stateStack: StateStack<T> = {
    push: (value: T) => {
      console.trace(`push:`, value, stack);
      stack.push(value);
      _set(value);
    },
    pop: () => {
      console.trace(`pop`, stack);
      if(stack.length < 2) throw new Error("Cannot pop stack: Stack only has one entry left");
      const popped = stack.pop() as T;
      _set(stack[stack.length - 1]);
      return popped;
    },
    replace: (value: T) => {
      const replaced = stack.pop() as T;
      stack.push(value);
      _set(value);
      return replaced;
    },
    rebase: (value: T) => {
      stack = [value];
      _set(value);
    },
    length: () => stack.length,
    ...(readable(value, set => {
      _set = set;
    }))
  };
  return stateStack;
}