import * as Sentry from '@sentry/react';
import * as React from 'react'
import { connect } from 'react-redux';
import { Tooltip, Spin } from 'antd';

import FAVORITE_ICON_URL from '@img/favorites.png';
import UNFAVORITE_ICON_URL from '@img/un_favorites.png';


type TProps = {
  selectedConversation: any,
  onToggleFavorite: (id: number) => Promise<void>,
  authUser: any,
};

class FavoriteButton extends React.PureComponent<TProps> {
  state = {
    loading: false
  };

  onToggleFavorite = async () => {
    const { selectedConversation, onToggleFavorite, authUser } = this.props;
    const inPreviewMode = !(selectedConversation.members || []).includes(
      authUser.id
    );
    if (inPreviewMode || selectedConversation.isArchived) return;

    this.setState({ loading: true });
    try {
      await onToggleFavorite(selectedConversation.id);
      this.setState({ loading: false });
    } catch (e) {
      this.setState({ loading: false });
    }
  };

  render() {
    const { selectedConversation } = this.props;
    const { loading } = this.state;
    const { isFavorite } = selectedConversation;

    const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    const icon = isFavorite ? FAVORITE_ICON_URL : UNFAVORITE_ICON_URL;

    return (
      <Spin indicator={null} spinning={loading}>
        <Tooltip title={title} placement="bottom">
          <img
            src={icon} width={16} height={16}
            alt={title}
            className={loading ? 'loading' : ''}
            onClick={this.onToggleFavorite}
          />
        </Tooltip>
      </Spin>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = state.conversations || {};
  const selectedConversationId = state.selectedConversationId || -1;

  return {
    selectedConversation: conversations[selectedConversationId] || {},
    authUser: state.authUser
  }
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(FavoriteButton, { name: "FavoriteButton"}))
