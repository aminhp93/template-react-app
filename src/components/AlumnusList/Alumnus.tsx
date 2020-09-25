import * as React from 'react';

import { TUserProfileData } from 'types';
import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import emitter, { EVENT_KEYS } from 'utils/event';


const handleViewProfile = (id) => emitter.emit(EVENT_KEYS.VIEW_PROFILE, { user_id: id });

export type Props = TUserProfileData & {
  profile_image: string;
  session_name: string;
  session_program: string;
  session_location: string;
  position: string;
  company: string;
  location: string;
  havingEmailField: boolean;
  skills: any[];
}

export function Alumnus(props: Props) {
  return (
  <tr className="alumnus-row">
    <td>
      <a
        href={`/profile/${props.id}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => handleViewProfile(props.id)}
      >
        <img
          className="profile--image pointer ml-2"
          src={props.profile_image || DEFAULT_PROFILE_IMAGE_URL}
          width="40px"
          alt="Alumni"
        />
      </a>
    </td>
    <td>
      <a
        href={`/profile/${props.id}`}
        target="_blank"
        rel="noreferrer"
        onClick={() => handleViewProfile(props.id)}
      >
        {`${props.first_name} ${props.last_name}`}
      </a>
      <br />
      {props.session_name
        && `${props.session_name}.${props.session_program}.${props.session_location}`}
    </td>
    <td>
        {(props.skills || []).map((skill, key) => (
             <p key={`skill-${key}`}>{skill.name}</p>
        ))}
    </td>
    <td>{props.position}</td>
    <td>{props.company}</td>
    <td>{props.location}</td>
    {props.havingEmailField && <td>{props.email}</td>}
  </tr>
  );
}

export default Alumnus;
