import * as Sentry from '@sentry/react';
import * as React from 'react';
import InViewMonitor from 'react-inview-monitor';
import GifPlayer from 'react-gif-player';

import { TFile } from 'types';

import POWERED_BY_GIPHY_URL from '@img/PoweredBy_200px-White_HorizText.png';


export type TProps = {
  file: TFile
}

export class GifMedia extends React.PureComponent<TProps> {
  pause?: () => void
  node?: HTMLElement

  play = () => {
    const player = this.node.querySelector('.gif_player') as HTMLElement
    player.click()
  }

  render() {
    const { file } = this.props

    return (
      <InViewMonitor
        classNameInView="image-layout playing"
        classNameNotInView="image-layout"
        onInView={this.play}
        onNotInView={this.pause}
      >
        <div className="image-layout--image m-image-layout--image--gif" ref={node => this.node = node}>
          <GifPlayer
            gif={file.fileKey}
            still={file.filePreview}
            pauseRef={pause => this.pause = pause}
          />
          <div className="mt-1">
            <img className="pull-right giphy-logo" src={POWERED_BY_GIPHY_URL} alt="giphy logo"/>
          </div>
        </div>
      </InViewMonitor>
    )
  }
}
export default Sentry.withProfiler(GifMedia, { name: "GifMedia"});
