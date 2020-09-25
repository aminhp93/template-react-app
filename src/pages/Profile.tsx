import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { isEqual } from 'lodash';
import Storage from '@aws-amplify/storage';
import uuid from 'uuid/v4';

import { TUserProfileData } from 'types';
import { RootStateType } from 'store';
import { ProfileService } from 'services/Profile';
import { fetchProfile } from 'reducers/authUser';
import { checkDMG } from 'reducers/conversations';
import { fetchSelectedProfileSuccess } from 'reducers/selectedProfile';

import { UserInfo } from 'utils/userInfo';
import { PageTitle } from 'components/PageTitle';
import ProfileInfo from 'components/ProfileInfo';
import { ProfileEditForm } from 'components/ProfileEditForm';

import EDIT_ICON_URL from '@img/edit_blue.svg';


export function EditIcon() {
  return (
    <img src={EDIT_ICON_URL} alt={'Edit information'} className="mr-2" />
  )
}

export type Props = {
  profile: TUserProfileData
  fetchProfile: () => Promise<any>
  sendMessage: () => Promise<any>
  setSelectedProfile: any
}

export function Profile({
  profile, fetchProfile, sendMessage, setSelectedProfile
}: Props) {
  const [form] = Form.useForm();
  const [editing, setEditing] = React.useState(false);
  const [changed, setChanged] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setSelectedProfile(profile);
  });

  const info = new UserInfo(profile);

  // FIXME: switch to API v3 to avoid this conversion
  const _profile = {
    profileImage: profile.profile?.profile_image,
    firstName: profile.first_name,
    lastName: profile.last_name,
    position: profile.profile?.position,
    employer: profile.profile?.employer,
    linkedin: profile.linkedin,
  }

  const onStartEditing = () => setEditing(true);

  const onCancelEditing = () => {
    if (changed) {
      // FIXME: consider using `/messaging/ConfirmDialog`
      Modal.confirm({
        title: 'Discard draft',
        content: (
          <span>
            You haven’t finished yet. Are you sure you want to leave and discard
            changes you made?
          </span>
        ),
        okText: 'Back',
        cancelText: 'Discard',
        onCancel: () => {
          setEditing(false);
          form.resetFields();
          setChanged(false);
        },
        className: 'modal-confirm--edit-profile-form',
        width: 356,
        centered: true
      });
      return
    }
    setEditing(false);
    form.resetFields();
    setChanged(false);
  }

  const onFinishEditing = async () => {
    const values = await form.validateFields();

    setLoading(true);
    // Skip `profileImage` if it has not been updated by user
    delete values.profileImage;
    if (form.isFieldTouched('profileImage')) {
      const imageFile = form.getFieldValue('profileImage');
      const imageFileKey = `profile-images/${profile.id}-${uuid()}`;
      const image = await Storage.put(imageFileKey, imageFile, {
        customPrefix: {
          public: ''
        },
        contentType: imageFile.type
      });
      values.profileImage = image['key'];
    }

    await ProfileService.updateInfo(values);
    await fetchProfile();

    setLoading(false);
    setEditing(false);
    setChanged(false);
  }

  const onFormChange = async (_name: string, { forms }) => {
    // It is a bit weird that `onFormChange` is triggered multiple times during
    // one change. The behavior is documented here:
    // https://ant.design/components/form/?locale=en-US#Why-onFieldsChange-triggers-three-times-on-change-when-field-sets-rules
    const form = forms.profileEditForm as FormInstance
    const hasErrors = form.getFieldsError().some(f => f.errors.length > 0)
    const values = form.getFieldsValue()
    setChanged(!hasErrors && !isEqual(values, _profile))
  }

  const editProfileButton = (
    <div className="mt-2">
      <Button type="link" icon={<EditIcon />} onClick={onStartEditing}>
        Edit information
      </Button>

      <Modal
        title="Edit information"
        visible={editing}
        onCancel={onCancelEditing}
        okText="Save"
        onOk={onFinishEditing}
        okButtonProps={{
          disabled: !changed
        }}
        width={800}
        confirmLoading={loading}
        className="m-modal profile-edit-modal"
      >
        <Form.Provider onFormChange={onFormChange}>
          <ProfileEditForm form={form} profile={_profile} />
        </Form.Provider>
      </Modal>
    </div>
  )

  return (
    <div className="main-page">
      <PageTitle title={info.getUserName()} />
      <ProfileInfo
        selectedProfile={profile}
        authUser={profile}
        checkDMG={sendMessage}
      >
        {/* profileEditButton */}
      </ProfileInfo>
    </div>
  )
}

export default connect((state: RootStateType) => ({
  profile: state.authUser
}), {
  fetchProfile,
  sendMessage: checkDMG,
  setSelectedProfile: fetchSelectedProfileSuccess
})(Profile);
