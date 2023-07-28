type SecureRedactUsername = string;
type SecureRedactBearerToken = string;
type SecureRedactMediaId = string;

enum SecureRedactEndpoints {
  FETCH_TOKEN = 'token',
  FETCH_MEDIA_STATUS = 'info',
  CREATE_USER = 'signup',
  UPLOAD_MEDIA = 'video',
  REDACT_MEDIA = 'redact',
  DELETE_MEDIA = 'video/delete',
  LOGIN_USER = 'login'
}

type SecureRedactResponseValue =
  | string
  | number
  | null
  | Record<string, string>;
type SecureRedactResponseData = Record<string, SecureRedactResponseValue>;
type SecureRedactParamsData = Record<
  string,
  string | boolean | number | undefined
>;

type FetchTokenParams = SecureRedactUsername | null;

interface FetchMediaStatusParams {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}

interface SecureRedactMediaInfo {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string | null;
  status: string;
}

interface CreateUserParams {
  username: SecureRedactUsername;
}

interface SecureRedactUserInfo {
  username: SecureRedactUsername;
  error: string | null;
  msg: string | null;
}

interface UploadMediaParams {
  mediaPath: string;
  videoTag?: string;
  increasedDetectionAccuracy?: boolean;
  stateCallback?: string;
  exportCallback?: string;
  exportToken?: string;
}

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

interface RedactMediaParams {
  mediaId: SecureRedactMediaId;
  enlargeBoxes?: number;
  redactAudio?: boolean;
  blur?: 'pixelated' | 'smooth';
  username?: SecureRedactUsername;
}

interface SecureRedactRedactResponse {
  error: string | null;
}

interface DeleteMediaParams {
  mediaId: SecureRedactMediaId;
}

interface SecureRedactDeleteMediaResponse {
  error: string | null;
  message: string;
  mediaId: SecureRedactMediaId;
}

interface LoginUserParams {
  username: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}

interface SecureRedactLoginResponse {
  redirectUrl: string;
  success: boolean;
}

export {
  SecureRedactResponseData,
  SecureRedactParamsData,
  SecureRedactBearerToken,
  SecureRedactEndpoints,
  SecureRedactMediaInfo,
  FetchTokenParams,
  FetchMediaStatusParams,
  CreateUserParams,
  SecureRedactUserInfo,
  UploadMediaParams,
  SecureRedactUploadResponse,
  SecureRedactResponseValue,
  RedactMediaParams,
  SecureRedactRedactResponse,
  DeleteMediaParams,
  SecureRedactDeleteMediaResponse,
  LoginUserParams,
  SecureRedactLoginResponse
};
