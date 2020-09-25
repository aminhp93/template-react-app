import Storage from '@aws-amplify/storage';
import config from 'config';

/**
 Functions that affect global state like this are discoraged. Please
 use local config instead, for example `Storage` has already been configured
 globally with the correct `bucket`, `region` and `identityPoolId`. To configure
 your level and prefixes, please pass these values along with `Storage.put`.

 Instead of

 ```
 SetS3Config(level, customPrefix)
 Storage.put(key, file, { contentType: ... })
 ```

 Please do

 ```
 Storage.put(key, file, { contentType: ..., level: ..., customPrefix: ... })
 ```

 @deprecated
 */
export function SetS3Config(level, customPrefix) {
  console.warn('SetS3Config is deprecated');

  Storage.configure({
    bucket: config.s3.bucket,
    level,
    customPrefix,
    region: config.s3.region,
    identityPoolId: config.s3.identityPoolId,
  });
}
