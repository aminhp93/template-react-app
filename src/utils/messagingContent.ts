/**
 * New utilities for dealing with the transformation from raw message content
 * to formatted representation and vice versa.
 */
import store from 'store';
import {forEach, reduce} from 'lodash';
import {ContentState, convertFromRaw, EditorState} from 'draft-js';
import ContentReverser from 'utils/contentReverser';

const contentReverser = new ContentReverser.Builder()
  .withUrlReverser()
  .withEmailReverser()
  .build();

const getUserByIdFromStore = (id: number) => {
  const { users } = store.getState();
  return users[id];
};

const getMentionName = (key: string | number, message: any) => {
  if (key === 'here' || key === 'channel') {
    return key;
  }
  if (!message.mentions.includes(Number(key))) {
    return '';
  }
  const user = getUserByIdFromStore(Number(key));
  if (!user) return '';
  const { fullName } = user;
  return fullName;
};

const getMentionByUserId = (target: string | number, message: any) => {
  if (target === 'here') {
    return { id: 'here', name: 'here' };
  }
  if (target === 'channel') {
    return { id: 'channel', name: 'channel' };
  }
  const { mentions } = message;
  if (!(mentions && mentions.includes(Number(target)))) {
    return null;
  }
  const user = getUserByIdFromStore(Number(target));
  return {
    id: user.id,
    name: user.fullName,
    avatar: user.profileImage,
  };
};

const replaceIdByFullNameInBlockText = (text, message) => {
  if (!text) return text;

  let content = text;
  const matches = text.match(/{{(\d+)}}|{{(here)}}|{{(channel)}}/g);
  if (!(matches && matches.length)) return content;
  matches.forEach((match) => {
    content = content.replace(
      match,
      `@${getMentionName(match.match(/\d+|here|channel/)[0], message)}`
    );
  });

  return content;
};

const buildRawBlockMap = (blocks, message) => {
  let entityMapIndex = 0;
  return blocks.reduce((final, block) => {
    const entityRanges = [];
    const patt = /{{(\d+)}}|{{(here)}}|{{(channel)}}/gim;
    let count = 0;
    let match;
    let accumulatedOffset = 0;
    // tslint:disable-next-line
    while ((match = patt.exec(block.getText()))) {
      if (match && match.length) {
        const matchLength = patt.lastIndex - match.index;
        const userFullName = getMentionName(
          match[0].match(/\d+|here|channel/)[0],
          message
        );
        const currentOffset = count === 0 ? match.index : match.index + accumulatedOffset;
        entityRanges.push({
          key: entityMapIndex,
          offset: currentOffset,
          length: userFullName.length + 1,
        });
        accumulatedOffset += userFullName.length + 1 - matchLength;
        entityMapIndex += 1;
        count += 1;
      }
    }
    return [
      ...final,
      {
        key: block.getKey(),
        type: block.getType(),
        text: replaceIdByFullNameInBlockText(block.getText(), message),
        depth: block.getDepth(),
        data: block.getData(),
        entityRanges,
      },
    ];
  }, [])
};

const buildEntityMap = (blocks, data) => {
  const blockTexts = blocks.map((block) => block.getText());
  let entityMap = {};
  let entityMapIndex = 0;
  forEach(blockTexts, (blockText) => {
    const matches = blockText.match(/{{(\d+)}}|{{(here)}}|{{(channel)}}/g);
    if (matches && matches.length) {
      forEach(matches, (match) => {
        const mention = getMentionByUserId(
          match.match(/\d+|here|channel/)[0],
          data
        );
        if (mention) {
          entityMap = {
            ...entityMap,
            [entityMapIndex]: {
              type: 'mention',
              mutability: 'IMMUTABLE',
              data: { mention },
            },
          };
          entityMapIndex += 1
        }
      });
    }
  });

  return entityMap;
};

/**
 * Build a editorState from raw message content
 * @param content string: content of the message
 * @param message TMessage
 */
export const deserializeEditorState = (
  content: string | null,
  message: any
) => {
  const contentState = ContentState.createFromText(
    contentReverser.reverse(content === null ? '' : content)
  );
  const blocks = contentState.getBlocksAsArray();
  const nextRawBlocks = buildRawBlockMap(blocks, message);
  const rawContent = {
    blocks: nextRawBlocks,
    entityMap: buildEntityMap(blocks, message),
  };
  const createdContent = EditorState.createWithContent(
    convertFromRaw(rawContent)
  );
  return EditorState.createWithContent(
      createdContent.getCurrentContent()
  );
};

/**
 * This function extract user id from mentions in a message
 * Input: Hi {{channel}}, I want to introduce {{2609}} and {{1135}}
 * Output: [2609, 1135] and the modified content
 * @param messageContent
 */
export const extractMentionIdFromRawText = (messageContent: string): any => {
  let content = messageContent;
  const { users } = store.getState();
  const mentions = [];
  const REGEX = /{{(\d+)}}/g;
  let matches;
  do {
    matches = REGEX.exec(content);
    if (matches) {
      const [mentionTag, mentionId] = matches;
      const id = Number(mentionId);
      if (id && users[id]) {
        mentions.push(id);
      } else {
        content = content.replace(mentionTag, '');
      }
    }
  } while (matches);

  return {
    mentions,
    content,
  };
};
