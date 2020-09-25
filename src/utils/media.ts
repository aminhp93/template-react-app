import config from 'config';
import isFunction from 'lodash/isFunction';
import request from 'utils/request';
import each from 'lodash/each';
import {
  generateRandomState
} from 'utils/random';
import Storage from '@aws-amplify/storage';
import {
  ConsoleLogger as Logger
} from '@aws-amplify/core';
import GifService from 'services/Gif';
import filter from 'lodash/filter';
import {
  removeFileFromS3AndStorage
} from 'services/S3';
import {
  IMAGE_SIZES
} from 'constants/common';
import {
  downloadLinkUrl
} from 'config/api';
import {
  makeExcerpt
} from './string';
import path from 'path'

const logger = new Logger('upload-files');
const fetchImageLogger = new Logger('fetch-image');

export const MEDIA_TYPES = {
  IMAGE: {
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    PNG: 'image/png',
    BMP: 'image/bmp',
    SVG: 'image/svg+xml',
  },
  GIF: 'image/gif',
  VIDEO: {
    MP4: 'video/mp4',
    FLV: 'video/x-flv',
    MOV: 'video/quicktime',
    AVI: 'video/x-msvideo',
    WMV: 'video/x-ms-wmv',
  },
  AUDIO: {
    MP3: 'audio/mp3',
    MP4: 'audio/mp4',
    M4A: 'audio/m4a',
    MPEG: 'audio/mpeg',
    OGG: 'audio/ogg',
  },
  DOC: {
    PDF: 'application/pdf',
    TEXT: 'text/plain',
    CSV: 'text/csv',
  },
};

export const IMAGE_TYPES = Object.values(MEDIA_TYPES.IMAGE);
export const AUDIO_TYPES = Object.values(MEDIA_TYPES.AUDIO);
export const VIDEO_TYPES = Object.values(MEDIA_TYPES.VIDEO);
export const DOC_TYPES = Object.values(MEDIA_TYPES.DOC);

export const UPLOAD_TYPES = [
  ...IMAGE_TYPES,
  ...AUDIO_TYPES,
  ...VIDEO_TYPES,
  ...DOC_TYPES,
];

export const PREVIEW_TYPES = [
  MEDIA_TYPES.DOC.PDF,
  MEDIA_TYPES.DOC.TEXT,
  ...AUDIO_TYPES,
  MEDIA_TYPES.VIDEO.MP4,
];

import DEFAULT_IMAGE_URL from '@img/place-holder.png';
export const DEFAULT_IMAGE = DEFAULT_IMAGE_URL;

export const MAXIMUM_FILE_SIZE = 50 * 1024 * 1024;

export const MAXIMUM_IMAGE_SIZE = 5 * 1024 * 1014;

export const getMediaTypeFromMimeType = (mimeType) => {
  let type = null;
  const mediaTypes = Object.keys(MEDIA_TYPES);
  for (let i = 0; i < mediaTypes.length; i += 1) {
    if (Object.values(MEDIA_TYPES[mediaTypes[i]]).includes(mimeType)) {
      type = mediaTypes[i];
      break;
    }
  }
  return type;
};

/**
 * Due to latency of generating mutil size of image. We will download image with N times of trial.
 * If a trial of retrieval fails, the next one will be called after 1000ms.
 */
export const downloadImageWithTrial = (url, trialTime = 3, onSuccess, onError) => {
  let trialCount = 0;
  let timeoutKey;

  const fetchImage = () => request({
    url,
    method: 'GET',
    responseType: 'blob',
  }).then((response) => {
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    trialCount = trialTime;
    if (isFunction(onSuccess)) {
      onSuccess(blobUrl);
    }
  }).catch((err) => {
    if (trialCount < trialTime) {
      trialCount += 1;
      timeoutKey = setTimeout(fetchImage, trialCount * 1000);
    } else {
      clearTimeout(timeoutKey);
    }
    if (isFunction(onError)) {
      onError(err);
    }
  });

  fetchImage();
};

export const formatBytes = (bytes, decimals = 2) => {
  // Convert file size to readable format
  // Ref: https://stackoverflow.com/a/18650828/9807807
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
};

export const uploadFiles = (files, storeUploadedFilesToState, handleProgressCallback, handleGetResult, maximumFileSize) => {
  each(files, (file, index) => {
    const key = generateRandomState();
    const uploadedFile = {
      index,
      key,
      loaded: 0,
      src: URL.createObjectURL(file),
      type: file.type,
      name: file.name || '',
      size: file.size,
    };
    const filename = file.name.split('.');

    if (file.size > maximumFileSize) {
      uploadedFile.errorType = `The file ${file.name} is too big, maximum size is ${formatBytes(maximumFileSize, 0)}`;
    }
    storeUploadedFilesToState(uploadedFile);
    if (uploadedFile.errorType) return;

    Storage
      .put(
        `${key}.${filename[filename.length - 1]}`,
        file, {
          contentType: file.type,
          progressCallback: (progress) => handleProgressCallback(progress, key),
        },
      )
      .then((result) => handleGetResult(result, key))
      .catch((err) => {
        logger.log(err);
      });
  });
};

export const uploadImages = (files, storeUploadedImagesToState, handleProgressCallback, handleGetResult) => {
  uploadFiles(files, storeUploadedImagesToState, handleProgressCallback, handleGetResult, MAXIMUM_IMAGE_SIZE);
};

export const selectGif = (selectedGif, handleDownloadingFinish) => {
  const originalStillUrl = ((selectedGif.images || {}).original_still || {}).url;
  if (originalStillUrl) {
    GifService
      .download(originalStillUrl)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));

        handleDownloadingFinish(url);
      })
      .catch(() => handleDownloadingFinish());
  }
};

export const removeImage = (uploadedImages, content, key, isEditing) => {
  const nextUploadedImages = filter(uploadedImages, (image) => image.key !== key);
  const error = nextUploadedImages.find((image) => image.errorType);

  // Remove from S3 immediately in creation mode
  if (!isEditing) {
    const removedFile = uploadedImages.find((file) => file.key === key);
    removeFileFromS3AndStorage(removedFile);
  }

  return {
    uploadedImages: nextUploadedImages,
    buttonDisabled: !!error || (content.getCurrentContent().getPlainText().length === 0 && nextUploadedImages.length === 0),
  };
};

export const getImageURL = (key, edits) => {
  const imageRequest = JSON.stringify({
    bucket: config.s3.bucket,
    key,
    edits,
  });

  return `${config.cloudFrontEndpoint.url}/${btoa(imageRequest)}`;
};

export const getFileUrl = async (key, type, download = false) => (
  request({
    method: 'GET',
    url: downloadLinkUrl,
    params: {
      file_key: key,
      file_type: type,
      download: download ? '1' : '0'
    },
  })
);

export const getUploadedImages = (files) => files.map((file) => {
  const edits = {
    resize: {
      width: IMAGE_SIZES.normal.width,
      height: IMAGE_SIZES.normal.height,
      fit: 'inside',
    },
    rotate: null
  };
  const src = getImageURL(file.file_key, edits);

  return {
    ...file,
    type: file.file_type,
    loaded: 100,
    src,
    key: file.file_key.substr(0, file.file_key.indexOf('.')),
  };
});

export const fetchImageUrl = (source, size, onSuccess, onError) => {
  let sourceFileKey = path.basename(source.file_key);
  if (size && size.width && size.height) {
    const extension = path.extname(sourceFileKey);
    const file = path.basename(sourceFileKey, extension);
    sourceFileKey = `${file}_${size.width}_${size.height}${extension}`;
  }
  const customPrefix = {
    public: source.file_prefix,
  };

  Storage
    .get(sourceFileKey, {
      customPrefix,
    })
    .then((url) => {
      if (isFunction(onSuccess)) {
        onSuccess(url);
      }
    })
    .catch((err) => {
      fetchImageLogger.log(err);
      if (isFunction(onError)) {
        onError(err);
      }
    });
};

export const makeFileName = (name, maxLength) => {
  const fileName = name.split('.');
  const fileExtension = fileName[fileName.length - 1];
  const maxFileNameLength = fileName >= maxLength + fileExtension.length ? maxLength : maxLength + fileExtension.length;
  const showExtension = name.length > maxFileNameLength;
  return `${makeExcerpt(name, maxFileNameLength)}${showExtension ? fileExtension : ''}`;
};


/**
 * Antd `Form.Item` wraps `async-validator`, so we can define reusable
 * validation rules.
 *
 * Reference: https://www.npmjs.com/package/async-validator
 */
export const validateMaxFileSize = (
  size: number
) => async (_rule: any, file: File) => {
  if (file.size > size) {
    throw new Error(`Please upload a picture smaller than ${formatBytes(size)}.`);
  }
};
