// import React from 'react';
// import PropTypes from 'prop-types';
// import { has } from 'lodash';
// import clsx from 'clsx';

// import {
//   DEFAULT_PROFILE_IMAGE_URL,
//   ChannelMentionTypeIds,
//   BROADCAST_ICON,
// } from 'constants/common';

// const MentioningEntry = (props) => {
//   const {
//     mention,
//     isFocused,
//     theme,
//     searchValue,
//     ...parentProps
//   } = props;

//   if (!mention) return null;

//   const hasChannelMention = has(ChannelMentionTypeIds, mention.id);
//   const avatar = hasChannelMention ? BROADCAST_ICON : (mention.avatar || DEFAULT_PROFILE_IMAGE_URL);

//   return (
//     <div {...parentProps} className={`mentionSuggestions--entry ${isFocused ? 'focus' : ''}`}>
//       <div className="mentionSuggestions--entry__container">
//         <div className="mentionSuggestions--entry__container--left">
//           <img
//             src={avatar}
//             className={clsx('mentionSuggestions--entry__avatar', { 'mentionSuggestions--entry__avatar--channel': hasChannelMention })}
//             role="presentation"
//             alt="avatar"
//           />
//         </div>

//         <div className="mentionSuggestions--entry__container--right">
//           <div className="mentionSuggestions--entry__text d-flex flex-row">
//             <div className={clsx({ 'font-weight-bold': hasChannelMention })}>
//               { hasChannelMention ? '@' : null}
//               {mention.name}
//             </div>
//             <div className="ml-1">
//               {
//                 mention.id === ChannelMentionTypeIds.here
//                   && 'Notify every online member in this channel.'
//               }
//               {
//                 mention.id === ChannelMentionTypeIds.channel
//                   && 'Notify everyone in this channel.'
//               }
//             </div>
//           </div>
//           {
//             mention.position && (
//               <div className="mentionSuggestions--entry__title">
//                 {mention.position}
//               </div>
//             )
//           }
//         </div>
//       </div>
//     </div>
//   );
// };

// MentioningEntry.propTypes = {
//   mention: PropTypes.shape().isRequired,
//   isFocused: PropTypes.bool.isRequired,
//   theme: PropTypes.shape().isRequired,
//   searchValue: PropTypes.string,
// };

// export default MentioningEntry;
