import * as React from 'react';
import { Form, Input, Button, Avatar } from 'antd';
import { FormInstance } from 'antd/lib/form';

import { DEFAULT_PROFILE_IMAGE_URL } from 'constants/common';
import CAMERA_ICON_URL from '@img/camera.svg';
import { validateMaxFileSize } from 'utils/media';


export type ImageUploadInputProps = {
  value?: string,
  onChange?: (file: File) => void
}

export function ImageUploadInput({ value, onChange }: ImageUploadInputProps) {
  const [imageUrl, setImageUrl] = React.useState('');

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageUrl(reader.result as string);
      onChange(input.files[0]);
    })
    reader.readAsDataURL(input.files[0]);
  };

  return (
    <div>
      <Avatar
        src={imageUrl || value || DEFAULT_PROFILE_IMAGE_URL}
        size={100}
      />
      <div className="input-image-upload">
        <input type="file" accept="image/*" onChange={onImageChange} />
        <Button type="link">
          <img src={CAMERA_ICON_URL} alt="Upload an image" className="mr-2" />
          Upload an image
        </Button>
      </div>
    </div>
  );
}



export type Props = {
  form: FormInstance
  profile: {
    profileImage: string
    firstName: string
    lastName: string
    employer: string
    position: string
    linkedin: string
  }
  children?: React.ReactElement
}

export function ProfileEditForm({ form, profile, children }: Props) {
  const requireFirstName = {
    required: true,
    message: 'Please enter your first name'
  };

  const requireLastName = {
    required: true,
    message: 'Please enter your last name'
  }

  const validLinkedInURL = {
    pattern: /https.+linkedin.com.+/,
    message: 'Please enter a valid LinkedIn URL'
  };

  const profileImageRules = [{
    validator: validateMaxFileSize(3 * 1024 * 1024)
  }];

  return (
    <Form
      name="profileEditForm"
      layout="vertical"
      form={form}
      initialValues={profile}
    >
      <Form.Item
        name="profileImage"
        className="text-center mb-4"
        rules={profileImageRules}
      >
        <ImageUploadInput />
      </Form.Item>

      <Form.Item
        name="firstName"
        label="First Name"
        rules={[requireFirstName]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="lastName"
        label="Last Name"
        rules={[requireLastName]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="position"
        label="Current Position">
        <Input />
      </Form.Item>

      <Form.Item
        name="employer"
        label="Current Company">
        <Input />
      </Form.Item>

      <Form.Item
        name="linkedin"
        label="LinkedIn Profile"
        rules={[validLinkedInURL]}>
        <Input />
      </Form.Item>

      {children}
    </Form>
  )
}
