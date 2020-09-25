import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import toastr from 'toastr';
import { format } from 'date-fns';

import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import { makeExcerpt } from 'utils/string';
import { makeFullUrl } from 'utils/url';
import ProjectTitle from 'components/ProjectTitle';
import emitter, { EVENT_KEYS } from 'utils/event';
import ScoreProject from 'components/Modals/ScoreProject';
import ProjectScoreService from 'services/ProjectScore';
import LoadingIndicator from 'components/LoadingIndicator';
import userInfo from 'utils/userInfo';
import ScoreItem from './ScoreItem';


class Project extends React.Component {
  state = {
    projectDescriptionLength: 270,
    showScoreModal: false,
    viewScore: false,
    scores: [],
    scoreLoading: false,
    creating: false,
  };

  componentDidMount() {
    this.setProjectDescriptionLength();
  }

  setProjectDescriptionLength() {
    const projectDescription = document.getElementById('project-description');
    if (projectDescription && projectDescription.offsetWidth) {
      this.setState({
        projectDescriptionLength: Math.floor(projectDescription.offsetWidth / 2.5),
      });
    }
  }

  fetchProjectScore = () => {
    this.setState({ scoreLoading: true });

    ProjectScoreService.getScoreOfProject(this.props.slug)
      .then((res) => {
        this.setState({
          scores: res.data.results,
          scoreLoading: false,
        });
      })
      .catch((err) => {
        this.setState({ scoreLoading: false });
        toastr.error(err);
      });
  };

  handleShowProjectScore = () => {
    this.setState({ viewScore: !this.state.viewScore });
    this.fetchProjectScore();
  };

  handleCloseProjectScore = () => {
    if (this.state.showScoreModal) {
      this.setState({ showScoreModal: false });
    }
  };

  handleDeleteScoreRecordSuccess = (scoreId) => {
    if (this.state.scores) {
      const scores = this.state.scores.filter((score) => score.id !== scoreId);

      this.setState({ scores });
    }
  };

  handleCreateScoreRecordSuccess = (score) => {
    this.setState({ scores: this.state.scores ? [...this.state.scores, score] : [score] });
  };

  handleEditScoreRecordSuccess = (score) => {
    const { scores } = this.state;
    const scoreIndex = scores.findIndex((scoreItem) => scoreItem.id === score.id);
    scores[scoreIndex] = score;

    this.setState({ scores });
  };

  switchCreateStatus = () => {
    this.setState({ creating: !this.state.creating });
  };

  render() {
    return (
      <>
        <tr className="project-row">
          <td
            className="text-center px-3 left-border-cell"
            style={{ position: 'relative' }}
          >
            {(!this.props.owner) ? (
              <img
                className="profile--image"
                src={DEFAULT_PROFILE_IMAGE_URL}
                width="45px"
                alt="Alumni"
              />
            ) : (
              <Link className="owner-info" to={`/profile/${this.props.owner.id}`} target="_blank" rel="noreferrer">
                <img
                  className="profile--image pointer"
                  src={this.props.owner.profile_image || DEFAULT_PROFILE_IMAGE_URL}
                  width="45px"
                  alt="Alumni"
                />
                <div className="mt-1">
                  {`${this.props.owner.first_name} ${this.props.owner.last_name}`}
                  <br />
                  {this.props.session_name
                    && <span className="text-secondary">{`${this.props.session_name}.${this.props.session_program}.${this.props.session_location}`}</span>}
                </div>
              </Link>
            )}
          </td>
          <td className="pl-3" id="project-description" style={{ paddingBottom: 0 }}>
            <div className="mb-1">
              {this.props.disabled ? (
                <b><ProjectTitle title={this.props.title} tagLine={this.props.tag_line} /></b>
              ) : (
                <Link to={`/projects/${this.props.slug}`} onClick={() => emitter.emit(EVENT_KEYS.VIEW_PROJECT)} target="_blank" rel="noreferrer">
                  <b><ProjectTitle title={this.props.title} tagLine={this.props.tag_line} /></b>
                </Link>
              )}
            </div>
            <div>
              {format(this.props.modified, 'MMM DD, YYYY')}
            </div>
            <div className="pr-5 mb-1">{makeExcerpt(this.props.description, this.state.projectDescriptionLength)}</div>
          </td>
          <td className="pr-2 text-left">
            {this.props.slide_url
            && <a href={makeFullUrl(this.props.slide_url)} target="_blank" rel="noreferrer" className="text-link d-block"><b>Slide</b></a>}
            {this.props.codebase_url
            && <a href={makeFullUrl(this.props.codebase_url)} target="_blank" rel="noreferrer" className="text-link d-block"><b>Codebase</b></a>}
            {this.props.demo_url
            && <a href={makeFullUrl(this.props.demo_url)} target="_blank" rel="noreferrer" className="text-link d-block"><b>Live Demo</b></a>}
          </td>
        </tr>
        {userInfo.isStaff() && (
          <tr>
            <td style={{ border: 0, padding: 0 }} />
            <td style={{ border: 0, padding: 0, paddingBottom: '5px' }}>
              <div className="view-score-project mt-2">
                <span
                  style={{ display: 'flex' }}
                  className="pointer pl-3"
                  onClick={this.handleShowProjectScore}
                >
                  <span style={{ paddingTop: '2px' }}>View Scores</span>
                  {' '}
                  {this.state.viewScore ? (
                    <i className="fa fa-caret-up fa-2x pointer d-block ml-2" />
                  ) : (
                    <i className="fa fa-caret-down fa-2x pointer d-block ml-2" />
                  )}
                </span>
              </div>
            </td>
            <td style={{
              border: 0, padding: 0, paddingLeft: '8px', paddingBottom: '5px',
            }}
            >
              <button className="btn btn-default mb-1 grade-project-btn float-left">
                <span
                  onClick={() => { this.setState({ showScoreModal: true }); }}
                >
                  Score
                </span>
              </button>
            </td>
          </tr>
        )}
        {this.state.viewScore && (
          this.state.scoreLoading ? (
            <LoadingIndicator />
          ) : (
            this.state.scores ? (
              this.state.scores && this.state.scores.map((score, index) => (
                <ScoreItem
                  key={score.id}
                  score={score}
                  index={index}
                  onDeleteScoreRecordSuccess={this.handleDeleteScoreRecordSuccess}
                  onEditScoreRecordSuccess={this.handleEditScoreRecordSuccess}
                  {...this.props}
                />
              ))
            ) : (
              <tr>
                <td style={{ border: 0 }} />
                <td
                  style={{ border: 0, paddingBottom: '10px' }}
                  className="font-italic"
                >
                  This project has not been evaluated yet.
                </td>
                <td style={{ border: 0 }} />
              </tr>
            )
          )
        )}
        {this.state.showScoreModal && (
          <ScoreProject
            isOpen={this.state.showScoreModal}
            close={this.handleCloseProjectScore}
            {...this.props}
            onCreateScoreRecordSuccess={this.handleCreateScoreRecordSuccess}
            creating={this.state.creating}
            switchCreateStatus={this.switchCreateStatus}
          />
        )}
      </>
    );
  }
}

Project.propTypes = {
  disabled: PropTypes.bool,
  slug: PropTypes.string,
  title: PropTypes.string,
  tag_line: PropTypes.string,
  description: PropTypes.string,
  slide_url: PropTypes.string,
  codebase_url: PropTypes.string,
  demo_url: PropTypes.string,
  owner: PropTypes.objectOf(PropTypes.any),
  session_name: PropTypes.string,
  session_program: PropTypes.string,
  session_location: PropTypes.string,
  modified: PropTypes.string,
  technologies: PropTypes.string,
};

export default Project;
