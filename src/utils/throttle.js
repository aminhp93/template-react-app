export function throttle(callback, limit) {
  let wait = false;
  return function throttled(...arg) {
    if (!wait) {
      callback.call(...arg);
      wait = true;
      setTimeout(() => { wait = false; }, limit);
    }
  };
}
