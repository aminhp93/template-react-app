const dec2hex = (dec) => (`0${dec.toString(16)}`).substr(-2);

export const generateRandomState = () => {
  const arr = new Uint8Array(10);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
};
