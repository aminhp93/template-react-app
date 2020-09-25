import React from 'react';
import PropTypes from 'prop-types';
import { getLightGiphyUrl } from './utils';

const GiphyItem = ({ data, onClick }) => (
  <img
    className="giphy-select__suggestions__image mt-2 cursor-pointer"
    src={getLightGiphyUrl(data)}
    alt="gif"
    onClick={() => onClick(data)}
  />
);

GiphyItem.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    images: PropTypes.shape({
      fixed_width_downsampled: PropTypes.shape({
        url: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default GiphyItem;
