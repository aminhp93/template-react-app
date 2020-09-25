import MarkdownIt from 'markdown-it';
import { fromPairs, flow } from 'lodash';


class DisableHeadingsPlugin {
  apply(_, [md]) {
    md.renderer.rules.heading_open = (tokens, i, options) => `${tokens[i].markup} `;
    md.renderer.rules.heading_close = () => '';
  }
}

class ExternalizeLinksPlugin {
  apply(_, [md]) {
    md.renderer.rules.link_open = this.render.bind(this, md.renderer);
  }

  render(renderer, tokens, i, options) {
    tokens[i].attrs.push(['target', '_blank']);
    return renderer.renderToken(tokens, i, options);
  }
}


export interface IUser {
  id: number;
  name?: string;
  full_name?: string;
  is_active?: boolean;
  is_removed?: boolean;
  is_approved?: boolean;
  isRemoved?: boolean;
  fullName?: string;
}

export interface IMentionTarget {
  id: number;
  target?: IUser;
}

export interface IMarkdownMetadata {
  mentions: IMentionTarget[];
}

type MentionTag = 'channel' | 'here' | number;

class MentionsPlugin {
  static MENTION_REGEX = /{{(channel|here|\d+)}}/gm;

  mentions: {
    [id: string]: IUser,
  };

  constructor(mentions) {
    this.mentions = fromPairs(
      mentions
        .filter(({ target }) => target)
        .map(({ target }) => [target.id, target]),
    );
  }

  apply(_, [md]) {
    md.renderer.rules.text = flow([
      md.renderer.rules.text,
      this.render.bind(this),
    ]);
  }

  formatMentionTarget(tag: MentionTag): string {
    if (tag === 'channel' || tag === 'here') {
      return `<span class="channel-mention">@${tag}</span>`;
    }

    const target = this.mentions[tag];
    if (target) {
      if ((target.is_active && !target.is_removed && target.is_approved) || (JSON.stringify(target.isRemoved) === 'false')) {
        return `<a href="/profile/${tag}" target="_blank" rel="noreferrer" class="mention mention--${tag}">${target.name || target.full_name || target.fullName}</a>`;
      }
      return `${target.name || target.full_name || target.fullName}`;
    }


    return '';
  }

  render(text) {
      return text.replace(MentionsPlugin.MENTION_REGEX, (match, capture): string => {
        return this.formatMentionTarget(capture as MentionTag) || match;
      });
  }
}

export interface IMetadata {
  mentions?: IMentionTarget[]
}

export const format = (text: string | null, metadata: IMetadata = {}, html = false) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const md = new MarkdownIt({
    html,
    linkify: true,
  });

  md.use(new DisableHeadingsPlugin());
  md.use(new ExternalizeLinksPlugin());

  if (metadata && metadata.mentions) {
    md.use(new MentionsPlugin(metadata.mentions));
  }
  return md.render(text).trim();
};
