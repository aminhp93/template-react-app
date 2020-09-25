import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Tooltip } from 'antd';

import CHANGELOG_ICON_URL from '@img/changelog.svg';


export function ChangeLogButton() {
  return (
    <Tooltip placement="right" title="Changelog">
      <div className="meta-button">
        <a href="https://docs.google.com/document/d/1-HtylYJOcXoZMNQBGGvipnAjqtg-r0w0aWlxn7U3mkU/edit?usp=sharing" target="_blank" rel="noreferrer">
          <img src={CHANGELOG_ICON_URL} alt="changelog icon" />
        </a>
      </div>
    </Tooltip>
  );
}
export default Sentry.withProfiler(ChangeLogButton, { name: "ChangeLogButton"});
