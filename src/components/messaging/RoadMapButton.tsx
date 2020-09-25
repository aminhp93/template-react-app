import * as Sentry from '@sentry/react';
import * as React from 'react';
import { Tooltip } from 'antd';

import ROADMAP_ICON_URL from '@img/roadmap.svg';


export function RoadMapButton() {
  return (
    <Tooltip placement="right" title="Roadmap">
      <div className="meta-button">
        <a
          href="https://roadmap.insightdata.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={ROADMAP_ICON_URL} alt="Roadmap icon" />
        </a>
      </div>
    </Tooltip>
  );
}
export default Sentry.withProfiler(RoadMapButton, { name: "RoadMapButton"});
