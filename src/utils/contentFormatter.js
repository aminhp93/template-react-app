import {
  URL_ELE_REGEX, BOLD_TEXT_ELE_REGEX, EMAIL_ELE_REGEX, TAGGED_USER_REGEX,
} from 'constants/regex';
import {
  formatElement, formatLink, formatBoldText, formatCode, formatTaggedUser,
} from 'utils/content';

export const formatUrl = (content) => formatElement(content, URL_ELE_REGEX, formatLink, null, 'post-link');
export const formatTextBold = (content) => formatElement(content, BOLD_TEXT_ELE_REGEX, formatBoldText);
export const formatEmail = (content) => formatElement(content, EMAIL_ELE_REGEX, formatLink, 'mailto:', 'post-link');
export const formatMentionedUsers = (content, mentions) => formatElement(content, TAGGED_USER_REGEX, formatTaggedUser(mentions), null, 'post-link');

export const formatParagraphs = (content) => content
  .split('\n\n')
  .map((paragraph) => `<p>${paragraph}</p>`)
  .join('');

// Use composition
export function createFormatter(...formatters) {
  return function format(content, mentions) {
    let formatted = content;
    for (let index = 0; index < formatters.length; index += 1) {
      formatted = formatters[index](formatted, mentions);
    }
    return formatted;
  };
}

// Use builder
class ContentFormatter {
  constructor(formatters) {
    this.format = createFormatter(...formatters);
  }

  static get Builder() {
    class Builder {
      constructor(formatters = []) {
        this.formatters = formatters;
      }

      withFormatUrl() {
        this.formatters.push(formatUrl);
        return this;
      }

      withFormatEmail() {
        this.formatters.push(formatEmail);
        return this;
      }

      withFormatCode() {
        this.formatters.push(formatCode);
        return this;
      }

      withFormatTextBold() {
        this.formatters.push(formatTextBold);
        return this;
      }

      withFormatParagraphs() {
        this.formatters.push(formatParagraphs);
        return this;
      }

      withFormatMentionedUsers() {
        this.formatters.push(formatMentionedUsers);
        return this;
      }

      build() {
        return new ContentFormatter(this.formatters);
      }
    }

    return Builder;
  }
}

export default ContentFormatter;
