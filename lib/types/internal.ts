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
  SecureRedactUserInfo,
  SecureRedactDownloadMediaParams,
  SecureRedactDownloadMediaResponse,
  SecureRedactFetchProjectsParams,
  SecureRedactFetchProjectsResponse,
  SecureRedactProjectInfo,
  SecureRedactFileInfo
} from './lib';

enum SecureRedactEndpoints {
  FETCH_TOKEN = 'token',
  FETCH_MEDIA_STATUS = 'info',
  CREATE_USER = 'signup',
  UPLOAD_MEDIA = 'video',
  REDACT_MEDIA = 'redact',
  DELETE_MEDIA = 'video/delete',
  LOGIN_USER = 'login',
  DOWNLOAD_MEDIA = 'download',
  PROJECTS = 'projects'
}

interface SecureRedactParams
  extends Partial<SecureRedactCreateUserParams>,
    Partial<SecureRedactDeleteMediaParams>,
    Partial<SecureRedactFetchMediaStatusParams>,
    Partial<SecureRedactFetchTokenParams>,
    Partial<SecureRedactLoginUserParams>,
    Partial<SecureRedactRedactMediaParams>,
    Partial<SecureRedactUploadMediaParams>,
    Partial<SecureRedactDownloadMediaParams>,
    Partial<SecureRedactFetchProjectsParams> {
  [key: string]:
    | string
    | number
    | boolean
    | File
    | undefined
    | null
    | SecureRedactFileInfo;
}

interface SecureRedactResponse
  extends Partial<SecureRedactDeleteMediaResponse>,
    Partial<SecureRedactFetchTokenResponse>,
    Partial<SecureRedactLoginResponse>,
    Partial<SecureRedactMediaInfo>,
    Partial<SecureRedactRedactResponse>,
    Partial<SecureRedactUploadResponse>,
    Partial<SecureRedactDownloadMediaResponse>,
    Partial<SecureRedactUserInfo>,
    Partial<SecureRedactFetchProjectsResponse> {
  [key: string]:
    | string
    | number
    | boolean
    | Blob
    | Record<string, string | number>
    | undefined
    | Array<SecureRedactProjectInfo>
    | SecureRedactProjectInfo
    | null;
}

export { SecureRedactEndpoints, SecureRedactParams, SecureRedactResponse };
