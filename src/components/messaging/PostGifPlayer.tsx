import * as Sentry from '@sentry/react';
import * as React from 'react';
import GifPlayer from 'react-gif-player';
import inView from 'in-view';
import { generateRandomState } from 'utils/random';

import POWERED_BY_GIPHY_URL from '@img/PoweredBy_200px-White_HorizText.png';


interface IProps {
  size: any;
}

class PostGifPlayer extends React.PureComponent<IProps> {
  constructor(props) {
    super(props);
    this.key = generateRandomState();
  }

  componentDidMount() {
    inView.threshold(1);
    inView(`#_${this.key}`)
      .on('enter', this.play)
      .on('exit', this.pause);
  }

  play = () => {
    const gif = this.gifPlayerRef.querySelector('.gif_player');
    if (gif) {
      gif.click();
    }
  };

  render() {
    return (
      <div
        id={`_${this.key}`}
        ref={(ref) => this.gifPlayerRef = ref}
        className="image-layout--image image-layout--image--gif"
      >
        <GifPlayer
          {...this.props}
          pauseRef={(pause) => this.pause = pause}
        />
        <img src={POWERED_BY_GIPHY_URL} alt="giphy logo" height={12} />
      </div>
    );
  }
}

export default Sentry.withProfiler(PostGifPlayer, { name: "PostGifPlayer"});
