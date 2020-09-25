import {
  BOLD_TEXT_ELE_REGEX, EMAIL_ELE_REGEX, TAGGED_USER_REGEX, URL_ELE_REGEX,
} from 'constants/regex';
import { ContentState, convertFromRaw, EditorState } from 'draft-js';
import get from 'lodash/get';
import find from 'lodash/find';
import reduce from 'lodash/reduce';
import has from 'lodash/has';
import { MEDIA_TYPES } from 'utils/media';
import ContentReverser from 'utils/contentReverser';
import { ChannelMentionTypeIds } from 'constants/common';

const contentReverser = new ContentReverser.Builder()
  .withUrlReverser()
  .withEmailReverser()
  .build();

/**
 * This function turns a raw textual link into an anchor tag
 * that could be subsequently rendered into a component
 *
 * E.g.: https://www.google.com/ would be turn to
 * <a href="https://www.google.com/" target="_blank" class="link">https://www.google.com/</a>
 */
export const formatLink = (text, prefix = null, cssClass = null) => {
  let prefixStr = '';
  if (prefix) {
    // eslint-disable-next-line
    prefixStr = prefix + '';
  }
  let cssClassStr = '';
  if (cssClass) {
    // eslint-disable-next-line
    cssClassStr = cssClass + '';
  }
  return `<a href="${prefixStr}${text}" target="_blank" rel="noreferrer" class="${cssClassStr}">${text}</a>`;
};

export const formatBoldText = (text) => `<strong>${text}</strong>`;

export const formatCode = (text) => `<code>${text}</code>`;

export const formatElement = (text, regex, formatFunc, prefix = null, cssClass = null) => {
  let content = text;
  let matches;
  do {
    matches = regex.exec(content);
    if (matches) {
      // Refer to TAGGED_USER_REGEX
      const partialFormat = formatFunc(matches[1] || matches[2] || matches[3]);
      content = content.replace(matches[0], partialFormat, prefix, cssClass);
    }
  } while (matches);
  return content;
};

export const formatTaggedUser = (mentions) => (text, prefix, cssClass) => {
  if (mentions && mentions.length > 0) {
    const target = mentions.find((mention) => `${get(mention, 'target.id')}` === text);

    if (target) {
      if (has(ChannelMentionTypeIds, target.target.id)) {
        return `<span class="channel-mention">@${target.target.name}</span>`;
      }
      if (!target.target.is_active || target.target.is_removed || !target.target.is_approved) {
        return `@${target.target.name}`;
      }
      return `<a href="/profile/${text}" target="_blank" rel="noreferrer" class="${cssClass} mention--${target.target.id}">${target.target.name || target.target.full_name}</a>`;
    }
  }
  return null;
};

export const formatRichContent = (text, mentions) => {
  if (!text || text === '') return '';
  let content = text;
  content = formatElement(content, URL_ELE_REGEX, formatLink, null, 'post-link');
  content = formatElement(content, BOLD_TEXT_ELE_REGEX, formatBoldText);
  content = formatElement(content, EMAIL_ELE_REGEX, formatLink, 'mailto:', 'post-link');
  content = formatElement(content, TAGGED_USER_REGEX, formatTaggedUser(mentions), null, 'post-link');

  return content;
};
/**
 * Get mention by mention target ID
 * @param {String} targetId Mention target is treated as String and can be numeric string, "channel", or "here"
 * @param {Object} data message
 */
const getMentionByTargetId = (targetId, data) => {
  const { mentions } = data;

  return find(mentions, (mention) => {
    if (targetId && targetId.match(/\d+/)) {
      return mention.target && mention.target.id === Number(targetId);
    }
    return mention.target && mention.target.id === targetId;
  });
};

const getMentionTargetNameById = (id, data) => {
  const foundMention = getMentionByTargetId(id, data);

  return get(foundMention, 'target.name');
};

const replaceIdByFullNameInBlockText = (text, data) => {
  if (!text) return text;

  let content = text;
  const matches = text.match(/{{(\d+)}}|{{(here)}}|{{(channel)}}/g);
  if (!(matches && matches.length)) return content;
  matches.forEach((match) => {
    content = content.replace(match, `@${getMentionTargetNameById(match.match(/\d+|here|channel/)[0], data)}`);
  });

  return content;
};

const buildRawBlockMap = (blocks, data) => reduce(blocks, (final, block) => {
  const entityRanges = [];
  const patt = /{{(\d+)}}|{{(here)}}|{{(channel)}}/igm;
  let count = 0;
  let match;
  let accumulatedOffset = 0;

  while (match = patt.exec(block.getText())) { // eslint-disable-line
    if (match && match.length) {
      const matchLength = patt.lastIndex - match.index;
      const userFullName = getMentionTargetNameById(match[0].match(/\d+|here|channel/)[0], data);
      const currentOffset = count === 0 ? match.index : (match.index + accumulatedOffset);
      entityRanges.push({ key: count, offset: currentOffset, length: userFullName.length + 1 });
      accumulatedOffset += ((userFullName.length + 1) - matchLength);
      count += 1;
    }
  }
  return [
    ...final,
    {
      key: block.getKey(),
      type: block.getType(),
      text: replaceIdByFullNameInBlockText(block.getText(), data),
      depth: block.getDepth(),
      data: block.getData(),
      entityRanges,
    },
  ];
}, []);

const buildEntityMap = (blocks, data) => {
  const blockTexts = blocks.map((block) => block.getText());

  let mapIndex = 0;
  let entityMap = {};
  for (let i = 0; i < blockTexts.length; i += 1) {
    const blockText = blockTexts[i];
    const matches = blockText.match(/{{(\d+)}}|{{(here)}}|{{(channel)}}/g);

    if (matches && matches.length) {
      for (let j = 0; j < matches.length; j += 1) {
        const match = matches[j];
        const mention = getMentionByTargetId(match.match(/\d+|here|channel/)[0], data);
        entityMap = {
          ...entityMap,
          [mapIndex]: {
            type: 'mention',
            mutability: 'SEGMENTED',
            data: {
              mention: mention.target,
            },
          },
        };
        mapIndex += 1;
      }
    }
  }

  return entityMap;
};

export const deserializeEditorState = (content, data) => {
  const contentState = ContentState.createFromText(contentReverser.reverse(content === null ? '' : content));
  const blocks = contentState.getBlocksAsArray();
  const nextRawBlocks = buildRawBlockMap(blocks, data);
  const rawContent = { blocks: nextRawBlocks, entityMap: buildEntityMap(blocks, data) };
  const createdContent = EditorState.createWithContent(convertFromRaw(rawContent));
  return EditorState.createWithContent(createdContent.getCurrentContent());
};

export const getInitialState = (data) => {
  const hasGifAttachment = get(data.files, '[0].file_type') === MEDIA_TYPES.GIF;
  const original = deserializeEditorState(data.content, data);
  const selectedGif = hasGifAttachment ? {
    images: {
      original: { url: get(data.files, '[0].file_key') },
      original_still: { url: get(data.files, '[0].file_sub_key') },
    },
  } : null;

  return {
    contentOriginal: original,
    content: original,
    selectedGifOriginal: selectedGif,
    selectedGif,
    hasGifAttachment,
  };
};
