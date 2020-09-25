import { groupBy } from 'lodash';
import { URL_REGEX, EMAIL_REGEX } from 'constants/regex';

export const formatByRegex = (text, regex) => {
  let content = text;
  const matches = text.match(regex);
  if (!(matches && matches.length)) return content;
  matches.forEach((match) => {
    content = content.replace(match, `<${match}>`);
  });
  return content;
};

export const getEntities = (editorState, entityType = null) => {
  const content = editorState.getCurrentContent();
  const entities = [];
  content.getBlocksAsArray().forEach((block) => {
    let selectedEntity = null;
    block.findEntityRanges(
      (character) => {
        if (character.getEntity() !== null) {
          const entity = content.getEntity(character.getEntity());
          if (!entityType || (entityType && entity.getType() === entityType)) {
            selectedEntity = {
              entityKey: character.getEntity(),
              blockKey: block.getKey(),
              entity: content.getEntity(character.getEntity()),
            };
            return true;
          }
        }
        return false;
      },
      (start, end) => {
        entities.push({ ...selectedEntity, start, end });
      },
    );
  });
  return entities;
};

export const formatMentionedUser = (text, blocks, entityMap, entities) => {
  let formattedText = '';
  let entityMapIndex = 0;
  const entitiesByBlockKey = groupBy(entities, 'blockKey');
  blocks.forEach((block, blockIndex) => {
    if (block.entityRanges.length > 0) {
      let index = 0;
      const currentEntities = entitiesByBlockKey[block.key] || [];
      do {
        const entityRange = currentEntities[index];
        switch (entityMap[entityMapIndex].type) {
          case 'mention': {
            let top = '';
            let end = '';

            if (index === 0) {
              top = block.text.substring(0, entityRange.start);
            }
            const mid = `{{${entityMap[entityMapIndex].data.mention.id}}}`;
            if (currentEntities[index + 1]) {
              end = block.text.substring(entityRange.end, currentEntities[index + 1].start);
            } else {
              end = block.text.substring(entityRange.end);
            }
            formattedText += `${top}${mid}${end}`;
            index += 1;
            entityMapIndex += 1;
            break;
          }
          default: {
            let top = '';

            if (index === 0) {
              top = block.text.substring(0, entityRange.start);
            }
            if (currentEntities[index + 1]) {
              formattedText += (top + block.text.substring(entityRange.start, currentEntities[index + 1].start));
            } else {
              formattedText += (top + block.text.substring(entityRange.start));
            }
            index += 1;
            entityMapIndex += 1;
            break;
          }
        }
      } while (index < block.entityRanges.length);
    } else {
      formattedText += block.text;
    }
    if (blockIndex < blocks.length - 1) {
      formattedText += '\n';
    }
  });

  return formattedText;
};

export const urlEnhancer = (content) => formatByRegex(content, URL_REGEX);

export const emailEnhancer = (content) => formatByRegex(content, EMAIL_REGEX);

export const mentionEnhancer = (content, blocks, entityMap, entities) => formatMentionedUser(content, blocks, entityMap, entities);

// Use composition
export const createContentEnhancer = (...enhancers) => (raw, blocks, entityMap, entities) => {
  let enhanced = raw;
  for (let index = 0; index < enhancers.length; index += 1) {
    enhanced = enhancers[index](enhanced, blocks, entityMap, entities);
  }
  return enhanced;
};

// Use builder
class ContentEnhancer {
  constructor(enhancers) {
    this.enhance = createContentEnhancer(...enhancers);
  }

  static get Builder() {
    class Builder {
      constructor(enhancers = []) {
        this.enhancers = enhancers;
      }

      withUrlEnhancer() {
        this.enhancers.push(urlEnhancer);
        return this;
      }

      withEmailEnhancer() {
        this.enhancers.push(emailEnhancer);
        return this;
      }

      withMentionEnhancer() {
        this.enhancers.push(mentionEnhancer);
        return this;
      }

      build() {
        return new ContentEnhancer(this.enhancers);
      }
    }

    return Builder;
  }
}

export default ContentEnhancer;
