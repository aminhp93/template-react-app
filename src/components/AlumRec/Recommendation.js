import * as React from 'react';
import * as PropTypes from 'prop-types';
import UserInfo from 'utils/userInfo';


class Recommendation extends React.Component {
  static propTypes = {
    item: PropTypes.objectOf(PropTypes.any),
    onDelete: PropTypes.func,
  };

  state = {
    showMenu: false,
  };

  onDelete = () => {
    this.setState({ showMenu: false });
    this.props.onDelete(this.props.item.id);
  };

  toggleAction = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  renderAction = () => (
    <div className="dropdown">
      <div className="card bg-white">
        <div
          className="dropdown--item pointer"
          onClick={this.onDelete}
        >
          Delete
        </div>
      </div>
    </div>
  );

  render() {
    const { item } = this.props;
    const { showMenu } = this.state;
    return (
      <div className="card recommendation">
        <div className="card-header">
          <div className="card-title">
            <h5>
              Recommendation for
              <span className="text-blue">
                {item.referree_first_name}
                {' '}
                {item.referree_last_name}
              </span>
            </h5>
            <p>{item.created}</p>
          </div>
          <div className="card-menu">
            {UserInfo.isStaff() && (
              <i
                className="fa fa-ellipsis-v fa-2x pointer ml-2 pull-right mt-1"
                onClick={() => this.toggleAction()}
              />
            )}
            {UserInfo.isStaff() && showMenu && this.renderAction()}
          </div>
        </div>
        <div className="card-body two-columns">
          <div className="left">
            <div>Candidate information</div>
          </div>
          <div className="right">
            <div className="two-columns--inline">
              <div className="left">
                <p>First name:</p>
                <p>Last name:</p>
                <p>Email:</p>
              </div>
              <div className="right">
                <p className="text-blue">{item.referree_first_name}</p>
                <p className="text-blue">{item.referree_last_name}</p>
                <p className="text-blue">{item.referree_email}</p>
              </div>
            </div>
            <div className="mt-2">
              <p>Which program do you think this person is the best fit for?</p>
              <ul>
                {item.programs.map((program, key) => (
                  <li key={`program-${key}`} className="program text-blue">{program.name}</li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <p>Why do you think this person would make a great Insight Fellow? (2-3 sentences)</p>
              <div className="note"><span>{item.note}</span></div>
            </div>
          </div>

        </div>
        <div className="card-footer two-columns">
          <div className="left">
            <div>Recommender</div>
          </div>
          <div className="right">
            <div className="two-columns--inline">
              <div className="left">
                <p>Full name:</p>
                <p>Email:</p>
              </div>
              <div className="right">
                <a className="text-blue" href={`/profile/${item.creator.id}`} target="_blank" rel="noreferrer">{item.referrer_full_name}</a>
                <p className="text-blue">{item.referrer_email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Recommendation;
