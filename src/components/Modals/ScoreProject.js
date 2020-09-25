import React from 'react';
import Modal from 'components/Modal';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import toastr from 'toastr';
import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import { format } from 'date-fns';
import emitter, { EVENT_KEYS } from 'utils/event';
import { makeExcerpt } from 'utils/string';
import ProjectTitle from 'components/ProjectTitle';
import clsx from 'clsx';
import ProjectScoreService from 'services/ProjectScore';
import InputErrorMessage from 'components/InputErrorMessage';


const convertScoreObject = (score) => (
  [score.final_score, score.business_score, score.presentation_score, score.execution_score]
);


class ScoreProject extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      scoreList: props.score ? convertScoreObject(props.score) : [null, null, null, null],
      commentProject: props.score ? props.score.comment : '',
      formErrors: '',
    };

    this.handleChangeCommentInput = this.handleChangeCommentInput.bind(this);
    this.validateScoreForm = this.validateScoreForm.bind(this);
  }

  validateScoreForm = () => {
    const { scoreList, commentProject } = this.state;
    const nullIndex = scoreList.indexOf(null);
    const formErrors = (!commentProject.trim() || nullIndex !== -1) ? 'Please fill in all fields above' : '';
    return formErrors;
  };

  handleChangeCommentInput = (event) => {
    this.setState({ commentProject: event.target.value });
  };

  handleChangeScore = (event) => {
    const { scoreList } = this.state;
    scoreList[event.target.value] = +event.target.innerHTML;

    this.setState({ scoreList });
  };

  handleSubmitProjectScore = () => {
    if (this.validateScoreForm()) {
      this.setState({ formErrors: this.validateScoreForm() });
      return false;
    }

    if (this.props.onEditScoreRecordSuccess) {
      this.props.switchEditStatus();

      ProjectScoreService.editScoreOfProject(this.props.score.id, {
        final_score: this.state.scoreList[0],
        business_score: this.state.scoreList[1],
        presentation_score: this.state.scoreList[2],
        execution_score: this.state.scoreList[3],
        comment: this.state.commentProject,
      }).then((res) => {
        this.props.onEditScoreRecordSuccess(res.data);
        toastr.success('Project Score updated successfully!');
        this.props.switchEditStatus();
        this.props.onCloseDropdownMenu();
        this.props.close();
      }).catch((err) => {
        toastr.err(err);
        this.props.switchEditStatus();
      });
    } else {
      this.props.switchCreateStatus();

      ProjectScoreService.createProject({
        final_score: this.state.scoreList[0],
        business_score: this.state.scoreList[1],
        presentation_score: this.state.scoreList[2],
        execution_score: this.state.scoreList[3],
        comment: this.state.commentProject,
        project: this.props.slug,
      }).then((res) => {
        this.props.onCreateScoreRecordSuccess(res.data);
        toastr.success('Project Score created successfully!');
        this.props.switchCreateStatus();
        this.props.close();
      }).catch((err) => {
        this.props.switchCreateStatus();
        toastr.error(err);
      });
    }
    return true;
  };

  render() {
    const {
      isOpen, close, owner,
    } = this.props;

    const { scoreList } = this.state;

    return (
      <Modal isOpen={isOpen} close={close}>
        <div className="form-group">
          <div className="row">
            <div className="col-md-3 text-center">
              {(!owner) ? (
                <img
                  className="profile--image"
                  src={DEFAULT_PROFILE_IMAGE_URL}
                  width="45px"
                  alt="Alumni"
                />
              ) : (
                <Link className="owner-info" to={`/profile/${owner.id}`} target="_blank">
                  <img
                    className="profile--image pointer"
                    src={owner.profile_image || DEFAULT_PROFILE_IMAGE_URL}
                    width="45px"
                    alt="Alumni"
                  />
                  <div className="mt-1">
                    <span className="score-label-list-text">{`${owner.first_name} ${owner.last_name}`}</span>
                    <br />
                    {this.props.session_name
                      && <span className="text-secondary">{`${this.props.session_name}.${this.props.session_program}.${this.props.session_location}`}</span>}
                  </div>
                </Link>
              )}
            </div>
            <div className="border-center-cell" />
            <div className="col-md-8">
              <div className="mb-1">
                {this.props.disabled ? (
                  <span className="project-title"><ProjectTitle title={this.props.title} tagLine={this.props.tag_line} /></span>
                ) : (
                  <Link to={`/projects/${this.props.slug}`} onClick={() => emitter.emit(EVENT_KEYS.VIEW_PROJECT)} target="_blank">
                    <span className="project-title"><ProjectTitle title={this.props.title} tagLine={this.props.tag_line} /></span>
                  </Link>
                )}
              </div>
              <div>
                {format(this.props.modified, 'MMM DD, YYYY')}
              </div>
              <div className="mb-1">{makeExcerpt(this.props.description, 100)}</div>
            </div>
          </div>
          <div className="line-center-cell" />
          <div className="row mt-3">
            <div className="col-md-6" style={{ marginTop: '3px' }}>
              <span className="final-score">FINAL SCORE:</span>
            </div>
            <div className="col-md-6">
              {[0, 1, 2, 3].map((elm) => (
                <button
                  key={elm}
                  value={0}
                  className={
                    clsx(
                      'btn btn-default',
                      { 'ml-3': elm > 0 },
                      { 'score-element-btn': scoreList[0] !== elm },
                      { 'score-element-btn-select': scoreList[0] === elm },
                    )
                  }
                  style={{ color: scoreList[0] !== elm ? '#7f9299' : 'white' }}
                  onClick={this.handleChangeScore}
                >
                  {elm}
                </button>
              ))}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6" style={{ marginTop: '3px' }}>
              <span className="score-label-list-text">Business and product sense:</span>
            </div>
            <div className="col-md-6">
              {[0, 1, 2, 3].map((elm) => (
                <button
                  key={elm}
                  value={1}
                  className={
                    clsx(
                      'btn btn-default score-element-btn',
                      { 'ml-3': elm > 0 },
                      { 'score-element-btn': scoreList[1] !== elm },
                      { 'score-element-btn-select': scoreList[1] === elm },
                    )
                  }
                  style={{ color: scoreList[1] !== elm ? '#7f9299' : 'white' }}
                  onClick={this.handleChangeScore}
                >
                  {elm}
                </button>
              ))}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6" style={{ marginTop: '3px' }}>
              <span className="score-label-list-text">Presentation and delivery:</span>
            </div>
            <div className="col-md-6">
              {[0, 1, 2, 3].map((elm) => (
                <button
                  key={elm}
                  value={2}
                  className={clsx(
                    'btn btn-default score-element-btn',
                    { 'ml-3': elm > 0 },
                    { 'score-element-btn': scoreList[2] !== elm },
                    { 'score-element-btn-select': scoreList[2] === elm },
                  )}
                  style={{ color: scoreList[2] !== elm ? '#7f9299' : 'white' }}
                  onClick={this.handleChangeScore}
                >
                  {elm}
                </button>
              ))}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-6" style={{ marginTop: '3px' }}>
              <span className="score-label-list-text">Execution and implementation:</span>
            </div>
            <div className="col-md-6">
              {[0, 1, 2, 3].map((elm) => (
                <button
                  key={elm}
                  value={3}
                  className={clsx(
                    'btn btn-default score-element-btn',
                    { 'ml-3': elm > 0 },
                    { 'score-element-btn': scoreList[3] !== elm },
                    { 'score-element-btn-select': scoreList[3] === elm },
                  )}
                  style={{ color: scoreList[3] !== elm ? '#7f9299' : 'white' }}
                  onClick={this.handleChangeScore}
                >
                  {elm}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 score-project-comment">
            <span className="score-label-list-text">Comment:</span>
            <textarea
              className="form-control"
              rows={2}
              value={this.state.commentProject}
              onChange={this.handleChangeCommentInput}
            />
          </div>
          {this.state.formErrors && (
            <div className="mt-2">
              <InputErrorMessage>{this.state.formErrors}</InputErrorMessage>
            </div>
          )}
          <div className="mt-2">
            <button
              className="btn btn-primary pull-right ml-3"
              onClick={this.handleSubmitProjectScore}
              disabled={this.props.editing ? this.props.editing : this.props.creating}
            >
              SAVE
            </button>
            <button
              className="btn btn-default pull-right"
              style={{ color: '#7f9299' }}
              onClick={close}
            >
              CANCEL
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

ScoreProject.propTypes = {
  isOpen: PropTypes.bool,
  disabled: PropTypes.bool,
  close: PropTypes.func,
  session_name: PropTypes.string,
  session_program: PropTypes.string,
  session_location: PropTypes.string,
  title: PropTypes.string,
  tag_line: PropTypes.string,
  slug: PropTypes.string,
  modified: PropTypes.string,
  description: PropTypes.string,
  owner: PropTypes.objectOf(PropTypes.any),
  onCreateScoreRecordSuccess: PropTypes.func,
  score: PropTypes.objectOf(PropTypes.any),
  switchEditStatus: PropTypes.func,
  onEditScoreRecordSuccess: PropTypes.func,
  editing: PropTypes.bool,
  onCloseDropdownMenu: PropTypes.func,
  switchCreateStatus: PropTypes.func,
  creating: PropTypes.bool,
};

export default ScoreProject;
