import { readable, Readable, Subscriber } from "svelte/store"

/**
 * A readable store gated by a lock.
 * 
 * @param value initial value
 * @returns a new Lockable store
 */
export function lockable<T>(value: T) {
  let _set: Subscriber<T>;
  let _locked = false;
  const lockable: Lockable<T> = {
    set: (v, throwIfLocked = true) => {
      if(_locked && throwIfLocked) throw new LockableError("Lockable: locked");
      _set(v);
      return !_locked;
    },
    lock: () => {
      if(_locked) throw new LockableError("Lockable: already locked");
      _locked = true;
      return {
        unlock: () => _locked = false,
        set: _set
      };
    },
    isLocked: () => _locked,
    ...(readable(value, set => {
      _set = set;
    }))
  };
  return lockable;
}

export interface Lockable<T> extends Readable<T> {
  set: (value: T, throwIfLocked?: boolean) => boolean
  lock: () => ({ unlock: () => void, set: (value: T) => void })
  isLocked: () => boolean
}

export class LockableError extends Error {
  public readonly isLockableError = true;
}