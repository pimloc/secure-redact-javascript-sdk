# Secure Redact Javascript SDK

[![NPM version](https://img.shields.io/npm/v/@secure-redact/javascript-sdk.svg)](https://www.npmjs.com/package/@secure-redact/javascript-sdk)

Built and maintained by the Pimloc team.

This repo provides a Javascript SDK wrapper for talking to the Secure Redact API. For more information see the [API Reference](https://docs.secureredact.co.uk)

## Table of Contents

- [Installation](#installation)
- [Upload Media](#upload-media)
- [Fetch Media Status](#fetch-media-status)
- [Redact Media](#redact-media)
- [Download Media](#download-media)
- [Delete Media](#delete-media)
- [Create User](#create-user)
- [Login User](#login-user)
- [Generic Types](#generic-types)

## Installation

Install via NPM

```cli
npm i @secure-redact/javascript-sdk
```

## Usage

The package needs to be configured with your account's clientId and clientSecret, which is available in the [Secure Redact App](https://app.secureredact.co.uk/app)

```js
import { SecureRedactSDK } from '@secure-redact/javascript-sdk';

const secureRedact = new SecureRedact({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
});

const data = await secureRedact.uploadMedia({
  mediaPath: 'PRESIGNED_URL'
});

console.log(data.mediaId);
```

### Usage with Typescript

```ts
import { SecureRedactSDK } from '@secure-redact/javascript-sdk';
import type {
  SecureRedactUploadMediaParams,
  SecureRedactUploadMediaResponse
} from '@secure-redact/javascript-sdk';

const secureRedact = new SecureRedact({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
});

const params: SecureRedactUploadMediaParams = {
  mediaPath: 'PRESIGNED_URL'
};
const data: SecureRedactUploadMediaResponse = await secureRedact.uploadMedia(
  params
);

console.log(data.mediaId);
```

## Upload Media

Function that adds a media to the Secure Redact system. The mediaPath must be a presigned URL that the Secure Redact system can download the file from.

You can monitor progress in two ways. Either by polling our /info route (see [Fetch Media Status](#fetch-media-status)) or by setting up the stateCallback URL. This must be a URL where the Secure Redact system can POST updates to. For more information see the [API reference](https://docs.secureredact.co.uk/#3a149f82-27ae-4673-a7f4-17cc28d8c146)

```js
const data = await secureRedact.uploadMedia({
  mediaPath: 'PRESIGNED_URL'
});
```

Parameters:

```ts
interface SecureRedactUploadMediaParams {
  mediaPath: string;
  videoTag?: string;
  increasedDetectionAccuracy?: boolean;
  stateCallback?: string;
  exportCallback?: string;
  exportToken?: string;
}
```

Response:

```ts
interface SecureRedactUploadResponse {
  fileInfo: {
    name: string;
    mimetype: string;
    size: number;
  };
  mediaId: SecureRedactMediaId;
  message?: string;
  error: string | null;
}
```

## Fetch Media Status

Function that responds with the current media status. For information on the potential status' see the [API reference](https://docs.secureredact.co.uk/#ca89fc7a-fafd-44f6-bee8-4f57ddde1579)

```js
const data = await secureRedact.fetchMediaStatus({
  mediaId: 'MEDIA_ID'
});
```

Parameters:

```ts
interface SecureRedactFetchMediaStatusParams {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}
```

Response:

```ts
interface SecureRedactMediaInfo {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string | null;
  status: string;
}
```

## Redact Media

Function that starts the Redact Media process, for more information see [API reference](https://docs.secureredact.co.uk/#fbf2f894-4db3-43cc-ae5b-62d03c3d83fb)

```js
const data = await secureRedact.redactMedia({
  mediaId: 'MEDIA_ID'
});
```

Parameters:

```ts
interface SecureRedactRedactMediaParams {
  mediaId: SecureRedactMediaId;
  enlargeBoxes?: number;
  redactAudio?: boolean;
  blur?: 'pixelated' | 'smooth';
  username?: SecureRedactUsername;
}
```

Response:

```ts
interface SecureRedactRedactResponse {
  error: string | null;
}
```

## Download Media

Function that responds with the redacted media, for more information see [API reference](https://docs.secureredact.co.uk/#6a691701-2c86-4eda-bb8f-1bfeff0f4d3d)

```js
const blob = await secureRedact.downloadMedia({
  mediaId: 'MEDIA_ID'
});

// simulate downloading file to user's machine
const blobURL = URL.createObjectURL(blob);
const a = document.createElement('a');
a.setAttribute('href', blobURL);
document.body.appendChild(a);
a.click();
URL.revokeObjectURL(blobURL);
```

Parameters:

```ts
interface SecureRedactDownloadMediaParams {
  username?: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}
```

Response:

```ts
interface SecureRedactDownloadMediaResponse {
  blob: Blob;
}
```

## Delete Media

Function that deletes the media, for more information see [API reference](https://docs.secureredact.co.uk/#1b311316-482c-4c3b-8af4-4f02494939b3)

```js
const blob = await secureRedact.deleteMedia({
  mediaId: 'MEDIA_ID'
});
```

Parameters:

```ts
interface SecureRedactDeleteMediaParams {
  mediaId: SecureRedactMediaId;
}
```

Response:

```ts
interface SecureRedactDeleteMediaResponse {
  error: string | null;
  message: string;
  mediaId: SecureRedactMediaId;
}
```

## Create User

**Enterprise Accounts ONLY**

Function that creates a new user that belongs to your enterprise account, for more information see [API reference](https://docs.secureredact.co.uk/#37abd470-679a-4e2a-9c4f-f5fe18405cd5)

```js
const blob = await secureRedact.createUser({
  username: 'DUMMY_USERNAME'
});
```

Parameters:

```ts
interface SecureRedactCreateUserParams {
  username: SecureRedactUsername;
}
```

Response:

```ts
interface SecureRedactUserInfo {
  username: SecureRedactUsername;
  error: string | null;
  msg?: string;
}
```

## Login User

**Enterprise Accounts ONLY**

Function that returns a URL to log the user in to the Secure Redact UI, for more information see [API reference](https://docs.secureredact.co.uk/#9b2e4dfc-7c04-4a0b-8a5a-13608e32dbd8)

```js
const blob = await secureRedact.loginUser({
  username: 'DUMMY_USERNAME'
});
```

Parameters:

```ts
interface SecureRedactLoginUserParams {
  username: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}
```

Response:

```ts
interface SecureRedactLoginResponse {
  redirectUrl: string;
  success: boolean;
}
```

## Generic Types

```ts
type SecureRedactUsername = string;
type SecureRedactMediaId = string;
```
