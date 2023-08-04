# Secure Redact Javascript SDK

[![NPM version](https://img.shields.io/npm/v/@secure-redact/javascript-sdk.svg)](https://www.npmjs.com/package/@secure-redact/javascript-sdk)

Built and maintained by the Pimloc team.

This repo provides a Javascript SDK wrapper for talking to the Secure Redact API. For more information see the [API Reference](https://docs.secureredact.co.uk)

## Table of Contents

- [Installation](#installation)
- [Flow 1 - Standard Account](#flow-1---standard-account)
- [Flow 2 - Enterprise Account](#flow-2---enterprise-account)

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

## Flow 1 - Standard Account

1. [Upload Media](#upload-media)
2. [Monitor Upload Progress](#monitor-progress)
3. [Redact Media](#redact-media)
4. [Monitor Redact Progress](#monitor-progress)
5. [Download Media](#download-media)

## Flow 2 - Enterprise Account

1. [Upload Media](#upload-media)
2. [Monitor Upload Progress](#monitor-progress)
3. [Create User](#create-user)
4. [Load Secure Redact UI](#login-user)
5. User Edits/Review Media
6. User Redacts Media from UI
7. [Monitor Redact Progress](#monitor-progress)
8. [Download Media](#download-media)

## Methods

### Upload Media

Function that adds a media to the Secure Redact system. The mediaPath must be a presigned URL that the Secure Redact system can download the file from.

You can monitor progress in two ways. Either by polling our /info route (see [Monitor Progress](#monitor-progress)) or by setting up the stateCallback URL. This must be a URL where the Secure Redact system can POST updates to. For more information see the [API reference](https://docs.secureredact.co.uk/#3a149f82-27ae-4673-a7f4-17cc28d8c146)

```js
const data = await secureRedact.uploadMedia({
  mediaPath: 'PRESIGNED_URL'
});
```

#### Parameters

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

#### Response

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
