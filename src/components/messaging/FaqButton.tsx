import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Tooltip } from 'antd';
import { FAQ_LINK } from 'constants/common';

import QUESTION_ICON_URL from '@img/question.svg';


export function FaqButton() {
  return (
    <Tooltip placement="right" title="FAQ">
      <div className="meta-button">
        <a href={FAQ_LINK} target="_blank" rel="noreferrer">
          <img src={QUESTION_ICON_URL} alt="question icon" />
        </a>
      </div>
    </Tooltip>
  );
}
export default Sentry.withProfiler(FaqButton, { name: "FaqButton"});
