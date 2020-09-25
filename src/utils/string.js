export const cleanSuffix = (text, suffix) => (text && text.length > suffix.length && text.endsWith(suffix)
  ? text.slice(0, text.length - text.length) : text);

export const makeExcerpt = (text = '', length = 20) => {
  const cleanedString = (text || '').trimRight();
  if (cleanedString.length <= length) {
    return cleanedString;
  }
  return `${cleanedString.substring(0, length)}...`;
};

export const contains = (text, sub) => String(text).toLocaleLowerCase().includes(String(sub).toLocaleLowerCase());
