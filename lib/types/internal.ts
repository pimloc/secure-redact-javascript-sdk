import {
  SecureRedactCreateUserParams,
  SecureRedactDeleteMediaParams,
  SecureRedactDeleteMediaResponse,
  SecureRedactFetchMediaStatusParams,
  SecureRedactFetchTokenParams,
  SecureRedactFetchTokenResponse,
  SecureRedactLoginResponse,
  SecureRedactLoginUserParams,
  SecureRedactMediaInfo,
  SecureRedactRedactMediaParams,
  SecureRedactRedactResponse,
  SecureRedactUploadMediaParams,
  SecureRedactUploadResponse,
  SecureRedactUserInfo
} from './lib.ts';

enum SecureRedactEndpoints {
  FETCH_TOKEN = 'token',
  FETCH_MEDIA_STATUS = 'info',
  CREATE_USER = 'signup',
  UPLOAD_MEDIA = 'video',
  REDACT_MEDIA = 'redact',
  DELETE_MEDIA = 'video/delete',
  LOGIN_USER = 'login'
}

type SecureRedactParams =
  | SecureRedactFetchTokenParams
  | SecureRedactLoginUserParams
  | SecureRedactCreateUserParams
  | SecureRedactDeleteMediaParams
  | SecureRedactLoginUserParams
  | SecureRedactRedactMediaParams
  | SecureRedactUploadMediaParams
  | SecureRedactFetchMediaStatusParams;

type SecureRedactResponse =
  | SecureRedactRedactResponse
  | SecureRedactLoginResponse
  | SecureRedactUploadResponse
  | SecureRedactMediaInfo
  | SecureRedactUserInfo
  | SecureRedactFetchTokenResponse
  | SecureRedactDeleteMediaResponse;

export { SecureRedactEndpoints, SecureRedactParams, SecureRedactResponse };
