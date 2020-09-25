import * as React from 'react';
import PropTypes from 'prop-types';
import Recommendation from './Recommendation';

class RecommendationsList extends React.Component {
  static propTypes = {
    onDelete: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.recommendations !== prevState.recommendations) {
      return {
        recommendations: nextProps.recommendations,
      };
    }

    return null;
  }

  state = {
    recommendations: [],
  };

  render() {
    const { onDelete } = this.props;
    const { recommendations } = this.state;
    return (
      <>
        {recommendations.map((rec, index) => (
          <Recommendation item={rec} key={index} onDelete={onDelete} />
        ))}
      </>
    );
  }
}

export default RecommendationsList;
