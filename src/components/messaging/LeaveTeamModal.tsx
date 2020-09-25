import * as Sentry from '@sentry/react';
import * as React from 'react'
import { Modal } from 'antd'

import { TTeam } from 'types'

import LEFT_NOTICE_URL from '@img/you-left-insight-data.svg'


type IProps = {
  team: TTeam,
  onOk: any
  onCancel: any
}


export class LeaveTeamModal extends React.PureComponent<IProps> {
  state = {
    isLeaving: false,
    previousTeamName: null,
    error: null,
    success: null
  }

  onOk = async () => {
    const { team, onOk } = this.props;

    this.setState({ isLeaving: true });

    try {
      await onOk(team.id)
      this.setState({
        isLeaving: false, success: true, error: null,
        previousTeamName: team.displayName
      });
    } catch (e) {
      this.setState({ isLeaving: false, success: false, error: e.message });
    }
  }

  render() {
    const { team, onCancel } = this.props
    if (!team) return null
    const { isLeaving, previousTeamName, error, success } = this.state

    // Could make these into 3 different components
    let content = (
      <div className="m-modal__body">
        <h5 className="mb-3 mt-3 mb-1 m-modal__title">
          Leave team
        </h5>
        <p className="m-modal__content">
          Everyone in this team will be notified of your departure. <br />
          Are you 100% sure you want to leave {team.displayName} team?
        </p>
      </div>
    )

    if (error) {
      content = (
        <div className="m-modal__body">
          <h5 className="mb-3 mt-3 mb-1 m-modal__title">
            {`You can't leave this team`}
          </h5>
          <p className="m-modal__content">
            {error}
          </p>
        </div>
      )
    }

    if (success) {
      content = (
        <div className="m-modal__body">
          <h5 className="mb-3 mt-3 mb-1 m-modal__title">
            You left {previousTeamName} :(
          </h5>
          <p className="m-modal__content">
            If you want to rejoin the team, please contact our support team at<br/>
            <a href="mailto:community-support@insightdatascience.com">community-support@insightdatascience.com</a>
          </p>
          <p className="text-right" style={{marginBottom: '-2.45rem'}}>
            <img src={LEFT_NOTICE_URL} alt="We are so sorry" />
          </p>
        </div>
      )
    }

    return (
      <Modal
        className="m-modal m-modal--confirm"
        visible={true}
        title={null}
        closeIcon={(
          <i className="fa fa-times fa-2x close-icon-i" />
        )}
        destroyOnClose={true}
        width={960}
        okText="Leave team"
        okType="danger"
        confirmLoading={isLeaving}
        centered={true}
        onCancel={onCancel}
        onOk={this.onOk}
        cancelButtonProps={{ className: 'm-btn-right' }}
        footer={success ? null : undefined}
      >{content}</Modal>
    )
  }
}

export default Sentry.withProfiler(LeaveTeamModal, { name: "LeaveTeamModal"});
