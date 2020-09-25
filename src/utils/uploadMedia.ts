import config from 'config';
import request from 'utils/request';
import { downloadLinkUrl } from 'config/api';
import { IMAGE_SIZES } from 'constants/common';

export const getImageURL = (key, edits) => {
  const imageRequest = JSON.stringify({
    bucket: config.s3.bucket,
    key,
    edits,
  });

  return `${config.cloudFrontEndpoint.url}/${btoa(imageRequest)}`;
};

export const getFileUrl = async (key, type, download = false) =>
  request({
    method: 'GET',
    url: downloadLinkUrl,
    params: {
      fileKey: key,
      fileType: type,
      download: download ? '1' : '0',
    },
  });

export const getUploadedImages = (files) =>
  files.map((file) => {
    const edits = {
      resize: {
        width: IMAGE_SIZES.normal.width,
        height: IMAGE_SIZES.normal.height,
        fit: 'inside',
      },
      rotate: null
    };
    const src = getImageURL(file.fileKey, edits);

    return {
      ...file,
      type: file.fileType,
      loaded: 100,
      src,
      key: file.fileKey.substr(0, file.fileKey.indexOf('.')),
    };
  });
