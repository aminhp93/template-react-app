import React from 'react';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import uniqBy from 'lodash/unionBy';
import PropTypes from 'prop-types';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import LoadingIndicator from 'components/LoadingIndicator';
import GiphyItem from './GiphyItem';
import { giphySearch, giphyTrending } from './utils';

const logger = new Logger('pages/GiphySuggestion');

class GiphySuggestions extends React.Component {
  constructor(props) {
    super(props);

    this.fetchGifWithQueryChanged = debounce(this.fetchGifWithQueryChanged, 500);
    this.fetchGif = debounce(this.fetchGif, 500);
    this.gifListRef = React.createRef();
    this.suggestionRef = React.createRef();
  }

  state = {
    query: undefined,
    gifList: [],
    limit: 10,
    offset: 0,
    isEndOfResults: false,
    loading: true,
  };

  componentDidMount() {
    this.fetchGif();

    if (this.gifListRef) {
      this.gifListRef.current.addEventListener('scroll', this.handleScroll);
    }

    if (this.suggestionRef) {
      this.suggestionRef.current.addEventListener('mouseenter', this.preventPageScrolling);
      this.suggestionRef.current.addEventListener('mouseleave', this.allowPageScrolling);
    }
  }

  componentWillUnmount() {
    if (this.gifListRef) {
      this.gifListRef.current.removeEventListener('scroll', this.handleScroll);
    }

    if (this.suggestionRef) {
      this.suggestionRef.current.removeEventListener('mouseenter', this.preventPageScrolling);
      this.suggestionRef.current.removeEventListener('mouseleave', this.allowPageScrolling);
    }

    this.allowPageScrolling();
  }

  preventPageScrolling = () => {
    document.body.classList.add('overflow-hidden');
  };

  allowPageScrolling = () => {
    document.body.classList.remove('overflow-hidden');
  };

  handleScroll = ({ target }) => {
    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      const { query, isEndOfResults } = this.state;
      if (isEndOfResults) return;
      this.fetchGif(query);
    }
  };

  handleGifClick = (gif) => {
    const { onSelect } = this.props;
    onSelect(gif);
  };

  detectEndOfResults = (res) => {
    const { pagination } = res.data;
    return pagination.offset + pagination.count >= pagination.total_count;
  };

  fetchGif = (value) => {
    const { limit, offset } = this.state;
    this.setState({ loading: true });

    let queried;
    if (value) {
      queried = giphySearch(value, limit, offset);
    } else {
      queried = giphyTrending(limit, offset);
    }

    queried
      .then((res) => {
        this.setState(({ gifList, offset: prevOffset }) => ({
          /**
           * Since Gihpy API does not know about the client context,
           * it usually get duplicated GIFs (2 GIFs placed next to each other) due to
           *  - Client calls one, and the next call happens in number of seconds or a minute
           *  - Giphy DB has one or more GIF inserted
           */
          gifList: uniqBy([...gifList, ...res.data.data], 'id'),
          offset: prevOffset + limit,
          loading: false,
          isEndOfResults: this.detectEndOfResults(res),
        }));
      })
      .catch((err) => {
        this.setState({ loading: false });
        logger.log(err);
      });
  };

  fetchGifWithQueryChanged = (changedValue) => {
    this.setState({
      query: changedValue,
      gifList: [],
      offset: 0,
      loading: true,
      isEndOfResults: false,
    }, () => this.fetchGif(changedValue));
  };

  render() {
    const { position } = this.props;
    const { gifList, loading } = this.state;

    return (
      <div
        className={`giphy-select__suggestions p-2 border rounded shadow-sm giphy-select__suggestions--${position}`}
        ref={this.suggestionRef}
      >
        <div className="pb-2">
          <input
            className="form-control"
            onChange={(e) => this.fetchGifWithQueryChanged(e.target.value)}
            placeholder="Trending"
          />
        </div>
        <div ref={this.gifListRef} className="giphy-select__suggestions__list">
          {map(gifList, (gif) => <GiphyItem key={gif.id} data={gif} onClick={this.handleGifClick} />)}
          {
            loading && (
              <LoadingIndicator containerClass="giphy-select__suggestions__loading d-flex mt-0 mb-3 justify-content-center w-100" />
            )
          }
          {
            !loading
            && isEmpty(gifList)
            && (
            <div className="mt-4 text-center">
              There is no results for
              <br />
              this keyword
            </div>
            )
          }
        </div>
      </div>
    );
  }
}

GiphySuggestions.propTypes = {
  onSelect: PropTypes.func.isRequired,
  position: PropTypes.string,
};

GiphySuggestions.defaultProps = {
  position: 'top',
};

export default GiphySuggestions;
