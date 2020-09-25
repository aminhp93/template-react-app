import React from 'react';
import PropTypes from 'prop-types';
import LoadingIndicator from 'components/LoadingIndicator';
import GifPlayer from 'react-gif-player';
import get from 'lodash/get';

const GifInEditor = (props) => {
  const {
    loadingGif, selectedGif, gifURL, removeGif,
  } = props;

  return (
    <div className="post-input__text-editor-container border-bottom">
      {
        loadingGif ? (
          <div className="position-relative d-inline-block">
            <LoadingIndicator containerClass="giphy-select__suggestions__loading d-flex mt-0 mb-3 justify-content-center w-100" />
          </div>
        ) : (
          <div className="position-relative d-inline-block">
            <GifPlayer
              gif={get(selectedGif, 'images.original.url')}
              still={gifURL}
            />
            <i className="fa fa-times gallery__image__remove" onClick={removeGif} />
          </div>
        )
      }
    </div>
  );
};

GifInEditor.propTypes = {
  gifURL: PropTypes.string,
  loadingGif: PropTypes.bool.isRequired,
  removeGif: PropTypes.func.isRequired,
  selectedGif: PropTypes.shape({}).isRequired,
};

GifInEditor.defaultProps = {
  gifURL: null,
};

export default GifInEditor;
