import * as React from 'react';
import { Prompt } from 'react-router-dom';
import Discard from './Modals/Discard';

export class RoutePreventLeaving extends React.Component {
  state = {
    modalVisible: false,
    lastLocation: null,
    confirmedNavigation: false,
  };

  showModal = (location) => this.setState({
    modalVisible: true,
    lastLocation: location,
  });

  closeModal = (callback) => this.setState({
    modalVisible: false,
  }, callback);

  closeModalSimple = () => this.setState({
    modalVisible: false,
  });

  handleBlockedNavigation = (nextLocation) => {
    const { confirmedNavigation } = this.state;
    const { shouldBlockNavigation } = this.props;

    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      this.showModal(nextLocation);
      return false;
    }

    return true;
  };

  handleConfirmNavigationClick = () => this.closeModal(() => {
    const { navigate } = this.props;
    const { lastLocation } = this.state;

    if (lastLocation) {
      this.setState({
        confirmedNavigation: true,
      }, () => {
        navigate(lastLocation.pathname);
      });
    }
  });

  render() {
    const { modalVisible } = this.state;
    const { when, target } = this.props;

    return (
      <>
        <Prompt
          when={when}
          message={this.handleBlockedNavigation}
        />
        {
          modalVisible && (
            <Discard
              target={target || 'post'}
              isOpen={modalVisible}
              close={this.closeModalSimple}
              confirm={this.handleConfirmNavigationClick}
            />
          )
        }
      </>
    );
  }
}

export default RoutePreventLeaving;
