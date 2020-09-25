import Storage from '@aws-amplify/storage';
import { ConsoleLogger as Logger } from '@aws-amplify/core';
import { get } from 'lodash';

const logger = new Logger('s3/file');

export const removeFileFromS3AndStorage = (file) => {
  const fileKey = get(file, 'file_key');
  const filePrefix = get(file, 'file_prefix');
  URL.revokeObjectURL(file.src);
  Storage
    .remove(fileKey, { filePrefix })
    .then((result) => logger.log(result))
    .catch((err) => logger.log(err));
};
