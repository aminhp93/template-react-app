import * as Sentry from '@sentry/react';
import styled, { createGlobalStyle } from 'styled-components';
import { BROADCAST_ICON } from 'constants/common';

export const theme = {
  emoji: 'emoji',
  emojiSuggestions: 'emojiSuggestions',
  emojiSuggestionsEntry: 'emojiSuggestionsEntry',
  emojiSuggestionsEntryFocused: 'emojiSuggestionsEntryFocused',
  emojiSuggestionsEntryText: 'emojiSuggestionsEntryText',
  emojiSuggestionsEntryIcon: 'emojiSuggestionsEntryIcon',
  emojiSelect: 'emojiSelect',
  emojiSelectButton: 'emojiSelectButton',
  emojiSelectButtonPressed: 'emojiSelectButtonPressed',
  emojiSelectPopover: 'emojiSelectPopover',
  emojiSelectPopoverClosed: 'emojiSelectPopoverClosed',
  emojiSelectPopoverTitle: 'emojiSelectPopoverTitle',
  emojiSelectPopoverGroups: 'emojiSelectPopoverGroups',
  emojiSelectPopoverGroup: 'emojiSelectPopoverGroup',
  emojiSelectPopoverGroupTitle: 'emojiSelectPopoverGroupTitle',
  emojiSelectPopoverGroupList: 'emojiSelectPopoverGroupList',
  emojiSelectPopoverGroupItem: 'emojiSelectPopoverGroupItem',
  emojiSelectPopoverToneSelect: 'emojiSelectPopoverToneSelect',
  emojiSelectPopoverToneSelectList: 'emojiSelectPopoverToneSelectList',
  emojiSelectPopoverToneSelectItem: 'emojiSelectPopoverToneSelectItem',
  emojiSelectPopoverEntry: 'emojiSelectPopoverEntry',
  emojiSelectPopoverEntryFocused: 'emojiSelectPopoverEntryFocused',
  emojiSelectPopoverEntryIcon: 'emojiSelectPopoverEntryIcon',
  emojiSelectPopoverNav: 'emojiSelectPopoverNav',
  emojiSelectPopoverNavItem: 'emojiSelectPopoverNavItem',
  emojiSelectPopoverNavEntry: 'emojiSelectPopoverNavEntry',
  emojiSelectPopoverNavEntryActive: 'emojiSelectPopoverNavEntryActive',
  emojiSelectPopoverScrollbar: 'emojiSelectPopoverScrollbar',
  emojiSelectPopoverScrollbarThumb: 'emojiSelectPopoverScrollbarThumb',
};

export const StyledEmojiSelectBottomWrapper = styled.div`
  .${theme.emojiSelect} {
      display: inline-block;
    }

  .${theme.emojiSelectButton}, .${theme.emojiSelectButtonPressed} {
    margin: 0;
    padding: 0;
    width: 2.5em;
    height: 1.5em;
    box-sizing: border-box;
    line-height: 1.2em;
    font-size: 1.5em;
    color: #888;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 1.5em;
    cursor: pointer;
  }

  .${theme.emojiSelectButton}:focus, .${theme.emojiSelectButtonPressed}:focus {
    outline: 0;
    /* reset for :focus */
  }

  .${theme.emojiSelectButton}:hover, .${theme.emojiSelectButtonPressed}:hover {
    background: #f3f3f3;
  }

  .${theme.emojiSelectButton}:active, .${theme.emojiSelectButtonPressed}:active {
    background: #e6e6e6;
  }

  .${theme.emojiSelectButtonPressed} {
    background: #ededed;
  }

  .${theme.emojiSelectPopover} {
    margin-top: 10px;
    padding: 0 .3em;
    position: absolute;
    z-index: 1000;
    box-sizing: content-box;
    background: #fff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 30px 0 gainsboro;
    bottom: 87px;
  }

  .${theme.emojiSelectPopoverClosed} {
    display: none;
  }

  .${theme.emojiSelectPopoverTitle} {
    margin: 0 0 .3em;
    padding-left: 1em;
    height: 2.5em;
    line-height: 2.5em;
    font-weight: normal;
    font-size: 1em;
    color: #9e9e9e;
  }

  .${theme.emojiSelectPopoverGroups} {
    margin: 0 0 .3em;
    position: relative;
    z-index: 0;
    width: 21em;
    height: 20em;
  }

  .${theme.emojiSelectPopoverGroup} {
    padding: 0 .5em;
  }

  .${theme.emojiSelectPopoverGroup}:first-child .${theme.emojiSelectPopoverGroupTitle} {
    display: none;
  }

  .${theme.emojiSelectPopoverGroupTitle} {
    margin: 1em 0;
    padding-left: .5em;
    font-weight: normal;
    font-size: 1em;
    color: #9e9e9e;
  }

  .${theme.emojiSelectPopoverGroupList} {
    margin: 0;
    padding: 0;
    display: -webkit-box;
    display: flex;
    list-style: none;
    flex-wrap: wrap;
  }

  .${theme.emojiSelectPopoverGroupItem} {
    width: 2.5em;
    height: 2.5em;
  }

  .${theme.emojiSelectPopoverToneSelect} {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2;
  }

  .${theme.emojiSelectPopoverToneSelectList} {
    margin: .3em;
    padding: .3em;
    position: absolute;
    display: -webkit-box;
    display: flex;
    list-style: none;
    border: 1px solid #e0e0e0;
    border-radius: .5em;
    background: #fff;
    box-shadow: 0 0 0.3em rgba(0, 0, 0, 0.1);
  }

  .${theme.emojiSelectPopoverToneSelectItem} {
    width: 2.5em;
    height: 2.5em;
  }

  .${theme.emojiSelectPopoverToneSelectItem}:first-child {
    border-right: 1px solid #e0e0e0;
  }

  .${theme.emojiSelectPopoverEntry}, .${theme.emojiSelectPopoverEntryFocused} {
    padding: 0;
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    outline: none;
    transition: background-color 0.4s cubic-bezier(0.27, 1.27, 0.48, 0.56);
  }

  .${theme.emojiSelectPopoverEntryFocused} {
    background-color: #efefef;
  }

  .${theme.emojiSelectPopoverEntryIcon} {
    width: 1.5em;
    height: 1.5em;
    vertical-align: middle;
  }

  .${theme.emojiSelectPopoverNav} {
    margin: 0;
    padding: 0 .5em;
    display: -webkit-box;
    display: flex;
    width: 20em;
    list-style: none;
  }

  .${theme.emojiSelectPopoverNavItem} {
    width: 2.5em;
    height: 2.5em;
  }

  .${theme.emojiSelectPopoverNavEntry}, .${theme.emojiSelectPopoverNavEntryActive} {
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 1.2em;
    color: #bdbdbd;
    background: none;
    border: none;
    outline: none;
  }

  .${theme.emojiSelectPopoverNavEntryActive} {
    color: #42a5f5;
  }

  .${theme.emojiSelectPopoverScrollbar} {
    position: absolute;
    right: 0;
    top: .3em;
    bottom: .3em;
    width: .25em;
    background-color: #e0e0e0;
    border-radius: .125em;
    opacity: .1;
    transition: opacity .4s;
  }

  .${theme.emojiSelectPopoverScrollbarThumb} {
    background-color: #000;
    border-radius: .125em;
    cursor: pointer;
  }

  .${theme.emojiSelectPopoverGroups}:hover .${theme.emojiSelectPopoverScrollbar} {
    opacity: .3;
  }

  .${theme.emojiSelectPopoverGroups} .${theme.emojiSelectPopoverScrollbar}:hover,
  .${theme.emojiSelectPopoverGroups} .${theme.emojiSelectPopoverScrollbar}:active {
    opacity: .6;
  }
`;

export const StyledEmojiSelectWrapper = styled.div`
  .${theme.emojiSelect} {
      display: inline-block;
    }

  .${theme.emojiSelectButton}, .${theme.emojiSelectButtonPressed} {
    margin: 0;
    padding: 0;
    width: 2.5em;
    height: 1.5em;
    box-sizing: border-box;
    line-height: 1.2em;
    font-size: 1.5em;
    color: #888;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 1.5em;
    cursor: pointer;
  }

  .${theme.emojiSelectButton}:focus, .${theme.emojiSelectButtonPressed}:focus {
    outline: 0;
    /* reset for :focus */
  }

  .${theme.emojiSelectButton}:hover, .${theme.emojiSelectButtonPressed}:hover {
    background: #f3f3f3;
  }

  .${theme.emojiSelectButton}:active, .${theme.emojiSelectButtonPressed}:active {
    background: #e6e6e6;
  }

  .${theme.emojiSelectButtonPressed} {
    background: #ededed;
  }

  .${theme.emojiSelectPopover} {
    margin-top: 10px;
    padding: 0 .3em;
    position: absolute;
    z-index: 1000;
    box-sizing: content-box;
    background: #fff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 4px 30px 0 gainsboro;
  }

  .${theme.emojiSelectPopoverClosed} {
    display: none;
  }

  .${theme.emojiSelectPopoverTitle} {
    margin: 0 0 .3em;
    padding-left: 1em;
    height: 2.5em;
    line-height: 2.5em;
    font-weight: normal;
    font-size: 1em;
    color: #9e9e9e;
  }

  .${theme.emojiSelectPopoverGroups} {
    margin: 0 0 .3em;
    position: relative;
    z-index: 0;
    width: 21em;
    height: 20em;
  }

  .${theme.emojiSelectPopoverGroup} {
    padding: 0 .5em;
  }

  .${theme.emojiSelectPopoverGroup}:first-child .${theme.emojiSelectPopoverGroupTitle} {
    display: none;
  }

  .${theme.emojiSelectPopoverGroupTitle} {
    margin: 1em 0;
    padding-left: .5em;
    font-weight: normal;
    font-size: 1em;
    color: #9e9e9e;
  }

  .${theme.emojiSelectPopoverGroupList} {
    margin: 0;
    padding: 0;
    display: -webkit-box;
    display: flex;
    list-style: none;
    flex-wrap: wrap;
  }

  .${theme.emojiSelectPopoverGroupItem} {
    width: 2.5em;
    height: 2.5em;
  }

  .${theme.emojiSelectPopoverToneSelect} {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2;
  }

  .${theme.emojiSelectPopoverToneSelectList} {
    margin: .3em;
    padding: .3em;
    position: absolute;
    display: -webkit-box;
    display: flex;
    list-style: none;
    border: 1px solid #e0e0e0;
    border-radius: .5em;
    background: #fff;
    box-shadow: 0 0 0.3em rgba(0, 0, 0, 0.1);
  }

  .${theme.emojiSelectPopoverToneSelectItem} {
    width: 2.5em;
    height: 2.5em;
  }

  .${theme.emojiSelectPopoverToneSelectItem}:first-child {
    border-right: 1px solid #e0e0e0;
  }

  .${theme.emojiSelectPopoverEntry}, .${theme.emojiSelectPopoverEntryFocused} {
    padding: 0;
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    outline: none;
    transition: background-color 0.4s cubic-bezier(0.27, 1.27, 0.48, 0.56);
  }

  .${theme.emojiSelectPopoverEntryFocused} {
    background-color: #efefef;
  }

  .${theme.emojiSelectPopoverEntryIcon} {
    width: 1.5em;
    height: 1.5em;
    vertical-align: middle;
  }

  .${theme.emojiSelectPopoverNav} {
    margin: 0;
    padding: 0 .5em;
    display: -webkit-box;
    display: flex;
    width: 20em;
    list-style: none;
  }

  .${theme.emojiSelectPopoverNavItem} {
    width: 2.5em;
    height: 2.5em;
  }

  .${theme.emojiSelectPopoverNavEntry}, .${theme.emojiSelectPopoverNavEntryActive} {
    padding: 0;
    width: 100%;
    height: 100%;
    font-size: 1.2em;
    color: #bdbdbd;
    background: none;
    border: none;
    outline: none;
  }

  .${theme.emojiSelectPopoverNavEntryActive} {
    color: #42a5f5;
  }

  .${theme.emojiSelectPopoverScrollbar} {
    position: absolute;
    right: 0;
    top: .3em;
    bottom: .3em;
    width: .25em;
    background-color: #e0e0e0;
    border-radius: .125em;
    opacity: .1;
    transition: opacity .4s;
  }

  .${theme.emojiSelectPopoverScrollbarThumb} {
    background-color: #000;
    border-radius: .125em;
    cursor: pointer;
  }

  .${theme.emojiSelectPopoverGroups}:hover .${theme.emojiSelectPopoverScrollbar} {
    opacity: .3;
  }

  .${theme.emojiSelectPopoverGroups} .${theme.emojiSelectPopoverScrollbar}:hover,
  .${theme.emojiSelectPopoverGroups} .${theme.emojiSelectPopoverScrollbar}:active {
    opacity: .6;
  }
`;

export const GlobalStyleForEmojiSelect = createGlobalStyle`
  .${theme.emoji} {
    background-position: center;
    /* make sure the background the image is only shown once */
    background-repeat: no-repeat;
    background-size: contain;
    /* move it a bit further down to align it nicer with the text */
    vertical-align: middle;

    /*
    We need to limit the emoji width because it can be multiple characters
    long if it is a 32bit unicode. Since the proper width depends on the font and
    it's relationship between 0 and other characters it's not ideal. 1.95ch is not
    the best value, but hopefully a good enough approximation for most fonts.
    */
    display: inline-block;
    overflow: hidden;
    max-width: 1.95ch;
    /*
    Needed for iOS rendering to avoid some icons using a lot of height without
    actually needing it.
    */
    max-height: 1em;
    line-height: inherit;
    margin: -.2ex 0em .2ex;
    /*
    In the past we used opacity: 0 to hide the original Emoji icon no matter what
    system it is. Recently we switched to color: transparent since it started to
    work in recent iOS version.
    */
    color: transparent;

    /*
    Some SVG files (say 2764 for :heart:) don't have default width/height, thus
    may not be rendered properly on some platforms/browsers (e.g., Windows 10 +
    Chrome 61).
    */
    min-width: 1em;
  }
  .${theme.emojiSuggestionsEntry} {
    padding: 5px 10px 1px 10px;
    transition: background-color 0.4s cubic-bezier(.27,1.27,.48,.56);
  }

  .${theme.emojiSuggestionsEntry}:active {
    background-color: #cce7ff;
    padding: 5px 10px 1px 10px;
  }

  .${theme.emojiSuggestionsEntryFocused} {
    background-color: #e6f3ff;
    padding: 5px 10px 1px 10px;
  }

  .${theme.emojiSuggestionsEntryText} {
    display: inline-block;
    margin-left: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 368px;
    font-size: 0.9em;
  }

  .${theme.emojiSuggestionsEntryIcon} {
    width: 1em;
    height: 1em;
    margin-left: 0.25em;
    margin-right: 0.25em;
    display: inline-block;
  }
  .${theme.emojiSuggestions} {
    border: 1px solid #eee;
    margin-top: 1.75em;
    position: absolute;
    min-width: 220px;
    max-width: 440px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0px 4px 30px 0px rgba(220,220,220,1);
    cursor: pointer;
    padding-top: 8px;
    padding-bottom: 8px;
    z-index: 2;
    display: -webkit-box;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
            flex-direction: column;
    box-sizing: border-box;
    -webkit-transform: scale(0);
            transform: scale(0);
  }
`;

export const emojiPositionSuggestions = ({ decoratorRect }) => {
  return {
    //left: '0px',
    top: decoratorRect.top < 300 ? '47px' : undefined, // Approximately largest posible height
    bottom: decoratorRect.top >= 300 ? '0px' : undefined,
    display: 'block',
    transform: 'scale(1) translateY(-75px)',
    transformOrigin: '1em 0% 0px',
    transition: 'all 0.25s cubic-bezier(0.3, 1.2, 0.2, 1)',
  };
};

export const mentionPositionSuggestions = (settings) => {
  let transform;
  let transition;

  if (settings.state.isActive && settings.props.suggestions.length > 0) {
    transform = 'scaleY(1) translateY(-4%)';
    transition = 'all 0.25s cubic-bezier(.3,1.2,.2,1)';
  } else if (settings.state.isActive) {
    transform = 'scaleY(0) translateY(-9%)';
    transition = 'all 0.25s cubic-bezier(.3,1,.2,1)';
  }

  return {
    transform,
    transition,
    left: 0,
    top: settings.decoratorRect.top < 250 ? '-10px' : undefined, // Approximately largest posible height
    bottom: settings.decoratorRect.top >= 250 ? '75px' : undefined,
    position: 'absolute',
    display: 'block',
  };
};

export const CHANNEL_MENTION = [
  {
    id: 'channel',
    name: 'channel',
    avatar: BROADCAST_ICON,
  },
];

export const HERE_MENTION = [
  {
    id: 'here',
    name: 'here',
    avatar: BROADCAST_ICON,
  }
];
export default Sentry.withProfiler(HERE_MENTION, { name: "HERE_MENTION"});
