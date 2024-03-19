// general
type SecureRedactUsername = string;
type SecureRedactBearerToken = string;
type SecureRedactMediaId = string;

// fetch token
interface SecureRedactFetchTokenParams {
  username?: SecureRedactUsername;
}

interface SecureRedactFetchTokenResponse {
  token: SecureRedactBearerToken;
  error: string | null;
}

// fetch media status
interface SecureRedactFetchMediaStatusParams {
  mediaId: SecureRedactMediaId;
  username?: SecureRedactUsername;
}

interface SecureRedactMediaInfo {
  mediaId: SecureRedactMediaId;
  username: SecureRedactUsername;
  error: string | null;
  status: string;
}

// create user
interface SecureRedactCreateUserParams {
  username: SecureRedactUsername;
}

interface SecureRedactUserInfo {
  username: SecureRedactUsername;
  error: string | null;
  msg?: string;
}

// upload media
interface SecureRedactUploadMediaParams {
  mediaPath: string;
  videoTag?: string;
  increasedDetectionAccuracy?: boolean;
  stateCallback?: string;
  exportCallback?: string;
  exportToken?: string;
  licensePlates?: boolean;
  faces?: boolean;
  file?: File;
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

// redact media
interface SecureRedactRedactMediaParams {
  mediaId: SecureRedactMediaId;
  enlargeBoxes?: number;
  redactAudio?: boolean;
  blur?: 'pixelated' | 'smooth';
  username?: SecureRedactUsername;
}

interface SecureRedactRedactResponse {
  error: string | null;
}

// delete media
interface SecureRedactDeleteMediaParams {
  mediaId: SecureRedactMediaId;
}

interface SecureRedactDeleteMediaResponse {
  error: string | null;
  message: string;
  mediaId: SecureRedactMediaId;
}

// login user
interface SecureRedactLoginUserParams {
  username: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}

interface SecureRedactLoginResponse {
  redirectUrl: string;
  success: boolean;
}

// download media
interface SecureRedactDownloadMediaParams {
  username?: SecureRedactUsername;
  mediaId: SecureRedactMediaId;
}

interface SecureRedactDownloadMediaResponse {
  blob: Blob;
}

export {
  SecureRedactMediaId,
  SecureRedactUsername,
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
  SecureRedactLoginResponse,
  SecureRedactDownloadMediaParams,
  SecureRedactDownloadMediaResponse
};
