import { URL_ELE_REGEX, EMAIL_ELE_REGEX } from 'constants/regex';

export const formatByRegex = (text, regex) => {
  let content = text;
  const matches = text.match(regex);
  if (!(matches && matches.length)) return content;
  matches.forEach((match) => {
    content = content.replace(match, match.replace(/[<>]/g, ''));
  });
  return content;
};

export const urlReverser = (content) => formatByRegex(content, URL_ELE_REGEX);

export const emailReverser = (content) => formatByRegex(content, EMAIL_ELE_REGEX);

// Use composition
export const createContentReverser = (...reversers) => (raw) => {
  let reversed = raw;
  for (let index = 0; index < reversers.length; index += 1) {
    reversed = reversers[index](reversed);
  }
  return reversed;
};

// Use builder
class ContentReverser {
  constructor(reversers) {
    this.reverse = createContentReverser(...reversers);
  }

  static get Builder() {
    class Builder {
      constructor(reversers = []) {
        this.reversers = reversers;
      }

      withUrlReverser() {
        this.reversers.push(urlReverser);
        return this;
      }

      withEmailReverser() {
        this.reversers.push(emailReverser);
        return this;
      }

      build() {
        return new ContentReverser(this.reversers);
      }
    }

    return Builder;
  }
}

export default ContentReverser;
