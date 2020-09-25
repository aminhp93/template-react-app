import * as Sentry from '@sentry/react';
import { SetS3Config } from 'config/s3';
import { S3_BUCKET_PREFIX, TEAM_URL_PREFIX } from 'constants/common';
import { get } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import {
  createTeam,
  updateTeam,
} from 'reducers/teams';
import { removeFileFromS3AndStorage } from 'services/S3';
import { ModalKey } from 'types';
import { normalizeWhitespacesTyping } from './utils';
import { IMAGE_TYPES, uploadImages } from 'utils/media';

import FileProgressBar from '../NewsFeed/FileProgressBar';
import ConfirmModal from './ConfirmModal';

export type IProps = {
  appendToTeamList?: any;
  createTeam?: any;
  selectedTeamId?: number;
  teams?: any;
  onModalClose?: any;
  isEditable?: boolean;
  modalData?: any;
  selectTeam?: any;
  updateTeam?: any;
  selectedTeam?: any;
};

export type IState = {
  displayName: string;
  image: any;
  submitting: boolean;
};

class CreateTeamWrapper extends React.PureComponent<IProps, IState> {
  imageInput: React.RefObject<unknown>;
  imageDisplay: React.RefObject<unknown>;

  constructor(props) {
    super(props);
    const { isEditable, selectedTeam } = this.props;

    this.imageInput = React.createRef();
    this.imageDisplay = React.createRef();
    this.configS3Bucket();

    this.state = {
      displayName: isEditable ? selectedTeam.displayName : '',
      image: isEditable ? { src: selectedTeam.image, default: true } : null,
      submitting: false,
    };
  }

  configS3Bucket = () => {
    const customPrefix = {
      public: S3_BUCKET_PREFIX.TEAM,
    };

    SetS3Config('public', customPrefix);
  };

  handleTeamNameChange = (e) => {
    const normalized = normalizeWhitespacesTyping(e.target.value);
    this.setState({
      displayName: normalized,
    });
  };

  handleFileSelect = (e) => {
    this.setState({ submitting: true });
    const file = get(e, 'target.files[0]');
    if (file) {
      uploadImages(
        [file],
        (uploadedImage) => this.setState({ image: uploadedImage }),
        this.handleProgressCallback,
        this.handleFileResult
      );
    }
  };

  handleProgressCallback = (progress) => {
    this.setState(({ image }) => ({
      image: {
        ...image,
        loaded: Math.ceil((progress.loaded * 100) / progress.total),
      },
    }));
  };

  handleFileResult = (result) => {
    this.setState(({ image }) => ({
      image: {
        ...image,
        file_key: result.key,
      },
    }));
    this.setState({ submitting: false })
  };

  handleRemoveImage = () => {
    const { image } = this.state;
    if (image) {
      removeFileFromS3AndStorage({
        ...image,
        file_prefix: S3_BUCKET_PREFIX.TEAM,
      });
      this.setState({ image: null });
    }
  };

  handleFileClick = (e) => {
    e.target.value = '';
  };

  selectTeamImage = () => {
    this.imageInput.click();
  };

  handleOk = () => {
    const { createTeam, updateTeam, isEditable } = this.props;
    const { displayName, image } = this.state;
    const imageObj = image || {};
    if (isEditable) {
      const imageToUpload = image && {
        ...image,
        file_type: image.type,
      };
      return updateTeam({
        displayName,
        image: image && !image.default && imageToUpload ? imageToUpload : image,
      });
    } else {
      return createTeam({
        displayName,
        image: {
          name: imageObj.name,
          file_key: imageObj.file_key,
          file_type: imageObj.type,
          size: imageObj.size,
        },
      });
    }
  };

  render() {
    const { onModalClose, isEditable, selectedTeam } = this.props;
    const { submitting, displayName, image } = this.state;
    const previewImage = get(image, 'src');
    const loaded = image && image.loaded;

    return (
      <ConfirmModal
        modalKey={isEditable ? ModalKey.EDIT_TEAM : ModalKey.CREATE_TEAM}
        okText={isEditable ? 'Save changes' : 'Create team'}
        title={isEditable ? 'Edit team information' : 'Create a team'}
        onOk={this.handleOk}
        onCancel={onModalClose}
        disabled={submitting}
      >
        <div className="form-group">
          <label className="form-control-label">Name</label>
          <input
            type="text"
            name="displayName"
            maxLength={80}
            className="form-control form-control--single"
            value={displayName}
            onChange={this.handleTeamNameChange}
          />
          <span className="mt-2 mb-3 d-block">
            Names must be shorter than 80 characters
          </span>
        </div>
        {isEditable && (
          <div className="form-group">
            <label className="form-control-label">Team’s URL</label>
            <input
              type="text"
              name="url"
              className="form-control form-control--single disabled"
              defaultValue={TEAM_URL_PREFIX + selectedTeam.name}
              disabled
            />
          </div>
        )}
        <div className="form-group">
          <label className="form-control-label d-block mb-3">
            {`Team Image `}
            <span>(Optional)</span>
          </label>
          <div className="logo-team d-flex">
            <button
              className="btn btn-outline-light btn-sm w-auto"
              onClick={this.selectTeamImage}
            >
              Upload an image
            </button>
            <input
              id="team_image"
              type="file"
              style={{ display: 'none' }}
              accept={IMAGE_TYPES}
              multiple={false}
              onChange={this.handleFileSelect}
              onClick={this.handleFileClick}
              ref={(ref) => (this.imageInput = ref)}
            />
            {previewImage && (
              <div className="logo-team__group ml-3 d-flex">
                <img
                  src={previewImage}
                  alt="logo-team"
                  ref={(ref) => (this.imageDisplay = ref)}
                />
                <i
                  className="fa fa-times ml-2"
                  onClick={this.handleRemoveImage}
                />
                {loaded !== null && loaded < 100 && (
                  <FileProgressBar loaded={loaded} />
                )}
              </div>
            )}
          </div>
        </div>
      </ConfirmModal>
    );
  }
}

const mapStateToProps = (state) => {
  const conversations = get(state, 'conversations') || {};
  const teams = get(state, 'teams') || {};
  const selectedConversationId = get(state, 'selectedConversationId');
  const selectedTeamId = get(state, 'selectedTeamId');
  return {
    selectedConversation: conversations[selectedConversationId] || {},
    selectedTeam: teams[selectedTeamId] || {},
    teams,
  };
};

const mapDispatchToProps = {
  createTeam,
  updateTeam
};

export default connect(mapStateToProps, mapDispatchToProps)(Sentry.withProfiler(CreateTeamWrapper, { name: "CreateTeamWrapper"}));
