// general
type SecureRedactUsername = string;
type SecureRedactBearerToken = string;
type SecureRedactMediaId = string;

interface Params {
  [key: string]: string | number | boolean | undefined | null;
}

interface Response {
  [key: string]:
    | string
    | number
    | boolean
    | Record<string, string | number>
    | undefined
    | null;
}

// fetch token
interface SecureRedactFetchTokenParams extends Params {
  username?: SecureRedactUsername;
}

interface SecureRedactFetchTokenResponse extends Response {
  token: SecureRedactBearerToken;
  error: string | null;
}

// fetch media status
interface SecureRedactFetchMediaStatusParams extends Params {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}

interface SecureRedactMediaInfo extends Response {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string | null;
  status: string;
}

// create user
interface SecureRedactCreateUserParams extends Params {
  username: SecureRedactUsername;
}

interface SecureRedactUserInfo extends Response {
  username: SecureRedactUsername;
  error: string | null;
  msg?: string;
}

// upload media
interface SecureRedactUploadMediaParams extends Params {
  mediaPath: string;
  videoTag?: string;
  increasedDetectionAccuracy?: boolean;
  stateCallback?: string;
  exportCallback?: string;
  exportToken?: string;
}

interface SecureRedactUploadResponse extends Response {
  fileInfo: {
    name: string;
    mimetype: string;
    size: number;
  };
  mediaId: SecureRedactMediaId;
  message?: string;
  error: string | null;
}

// redact media
interface SecureRedactRedactMediaParams extends Params {
  mediaId: SecureRedactMediaId;
  enlargeBoxes?: number;
  redactAudio?: boolean;
  blur?: 'pixelated' | 'smooth';
  username?: SecureRedactUsername;
}

interface SecureRedactRedactResponse extends Response {
  error: string | null;
}

// delete media
interface SecureRedactDeleteMediaParams extends Params {
  mediaId: SecureRedactMediaId;
}

interface SecureRedactDeleteMediaResponse extends Response {
  error: string | null;
  message: string;
  mediaId: SecureRedactMediaId;
}

// login user
interface SecureRedactLoginUserParams extends Params {
  username: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}

interface SecureRedactLoginResponse extends Response {
  redirectUrl: string;
  success: boolean;
}

export {
  SecureRedactBearerToken,
  SecureRedactFetchTokenParams,
  SecureRedactFetchTokenResponse,
  SecureRedactFetchMediaStatusParams,
  SecureRedactMediaInfo,
  SecureRedactCreateUserParams,
  SecureRedactUserInfo,
  SecureRedactUploadMediaParams,
  SecureRedactUploadResponse,
  SecureRedactRedactMediaParams,
  SecureRedactRedactResponse,
  SecureRedactDeleteMediaParams,
  SecureRedactDeleteMediaResponse,
  SecureRedactLoginUserParams,
  SecureRedactLoginResponse
};
