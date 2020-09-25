import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toastr from 'toastr';
import Delete from 'components/Modals/Delete';
import ProjectScoreService from 'services/ProjectScore';
import ScoreProject from 'components/Modals/ScoreProject';
import UserInfo from 'utils/userInfo';
import { makeExcerpt } from 'utils/string';


class ScoreItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showDropDown: false,
      deleting: false,
      showModalDelete: false,
      editing: false,
      showModalEdit: false,
      hiddenCommend: true,
    };
  }

  componentDidMount = () => {
    window.document.addEventListener('click', (e) => this.handleCloseDropdownMenu(e));
  };

  componentWillUnmount = () => {
    window.document.removeEventListener('click', (e) => this.handleCloseDropdownMenu(e));
  };

  showConfirmDelete = () => {
    this.setState({ showModalDelete: true });
  };

  handleCloseDropdownMenu = (event) => {
    if (this.state.showDropDown && this.dropDownToggleRef
      && !this.dropDownToggleRef.contains(event.target)) {
      this.setState({ showDropDown: false });
    }
  };

  delete = () => {
    this.setState({ deleting: true });

    ProjectScoreService.deleteScoreOfProject(this.props.score.id)
      .then(() => {
        this.props.onDeleteScoreRecordSuccess(this.props.score.id);
        toastr.success('The Score Record was deleted successfully!');
        this.setState({
          deleting: false,
          showModalDelete: false,
        });
      })
      .catch((err) => {
        toastr.error(err);
        this.setState({
          deleting: false,
          showModalDelete: false,
        });
      });
  };

  switchEditStatus = () => {
    this.setState({ editing: !this.state.editing });
  };

  render() {
    const { score, index } = this.props;

    const renderComment = () => {
      let readMore = '';
      const { hiddenCommend } = this.state;
      // eslint-disable-next-line prefer-destructuring
      let comment = score.comment;

      if (hiddenCommend) {
        if (score.comment.length > 270) {
          readMore = (
            <span
              className="text-primary pointer"
              onClick={() => this.setState({ hiddenCommend: false })}
            >
              Read more
            </span>
          );

          comment = (<span>{`${makeExcerpt(score.comment, 270)}...`}</span>);
        }
      }

      return (
        <p className="break-word">
          {comment}
          {readMore}
        </p>
      );
    };

    return (
      <React.Fragment
        key={score.id}
      >
        <tr className="project-score-list">
          <td
            colSpan={3}
            style={{ border: 0, paddingTop: 0, paddingBottom: 0 }}
          >
            {index === 0
              && <div className="line-center-cell-project" />}
            <div className="row col-md-12 mt-3">
              <div className="score-label-list text-left col-md-5 pl-4">
                <div className="final-score">OVERALL SCORE:</div>
                <div className="score-label-list-text mt-1">Business and product sense:</div>
                <div className="score-label-list-text mt-1">Presentation and delivery:</div>
                <div className="score-label-list-text mt-1">Execution and implementation:</div>
              </div>
              <div className="score-value-list col-md-2">
                <div className="final-score">
                  {score.final_score}
                  /3
                </div>
                <div className="score-label-list-text mt-1">
                  {score.business_score}
                  /3
                </div>
                <div className="score-label-list-text mt-1">
                  {score.presentation_score}
                  /3
                </div>
                <div className="score-label-list-text mt-1">
                  {score.execution_score}
                  /3
                </div>
              </div>
              <div className="col-md-5 pr-3">
                {score.creator.id === UserInfo.getUserId()
                  && (
                  <div className="float-right ">
                    <i
                      ref={(ref) => this.dropDownToggleRef = ref}
                      className="fa fa-ellipsis-v fa-lg pointer ml-2"
                      onClick={() => this.setState({ showDropDown: !this.state.showDropDown })}
                    />
                  </div>
                  )}
                {this.state.showDropDown && (
                  <div className="post-container--dropdown">
                    <div className="card bg-white">
                      <div
                        className="post-container--dropdown--item pointer"
                        onClick={() => this.setState({ showModalEdit: true })}
                      >
                        Edit
                      </div>
                    </div>
                    <div className="card bg-white">
                      <div
                        className="post-container--dropdown--item pointer"
                        onClick={this.showConfirmDelete}
                      >
                        Delete
                      </div>
                    </div>
                  </div>
                )}
                <div className="float-right" style={{ fontSize: '12px' }}>
                  <p>
                    Evaluated by
                    <Link className="text-primary" to={`/profile/${score.creator.id}/`} target="_blank">
                      {` ${score.creator.first_name} ${score.creator.last_name}`}
                    </Link>
                  </p>
                  <p className="float-right">{format(score.modified, 'MMM DD, YYYY')}</p>
                </div>
              </div>
            </div>
            <div className="row col-md-12 pl-4 mt-2">
              <div className="pl-3">
                <label className="score-label-list-text">Comment:</label>
                {renderComment()}
              </div>
            </div>
          </td>
        </tr>
        {this.state.showModalDelete && (
          <Delete
            isOpen={this.state.showModalDelete}
            close={() => this.setState({ showModalDelete: false })}
            targetType="Score Record"
            deleting={this.state.deleting}
            delete={this.delete}
          />
        )}
        {this.state.showModalEdit && (
          <ScoreProject
            score={score}
            isOpen={this.state.showModalEdit}
            editing={this.state.editing}
            switchEditStatus={this.switchEditStatus}
            close={() => this.setState({ showModalEdit: false })}
            {...this.props}
            onEditScoreRecordSuccess={this.props.onEditScoreRecordSuccess}
            onCloseDropdownMenu={this.handleCloseDropdownMenu}
          />
        )}
      </React.Fragment>
    );
  }
}

ScoreItem.propTypes = {
  score: PropTypes.objectOf(PropTypes.any),
  index: PropTypes.number,
  onDeleteScoreRecordSuccess: PropTypes.func,
  onEditScoreRecordSuccess: PropTypes.func,
};

export default ScoreItem;
